import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

/**
 * ฟังก์ชันสำหรับปรับรูปแบบเบอร์โทรศัพท์ให้อยู่ในรูปแบบ E.164 (สำหรับเบอร์ไทย)
 * เช่น 081-234-5678 -> 66812345678
 */
function normalizeThaiPhoneNumber(phone) {
  // 1. ลบตัวอักษรที่ไม่ใช่ตัวเลขทั้งหมด
  let digits = phone.replace(/\D/g, '');
  // 2. ถ้าขึ้นต้นด้วย 0 ให้ตัด 0 ออกแล้วเติม 66
  if (digits.startsWith('0')) {
    return '66' + digits.substring(1);
  }
  // 3. ถ้าไม่ได้ขึ้นต้นด้วย 0 (อาจจะเป็น 66 อยู่แล้ว) ก็ให้คืนค่าเดิม
  return digits;
}

// ฟังก์ชันสำหรับเรียก API ของ isms.asia
async function callIsmsApi(data) {
    const url = 'https://portal.isms.asia/sms-api/message-sms/send'; 
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.ISMS_API_KEY}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            const errorBody = await response.text();
            // Log รายละเอียดของ Error ที่ได้รับกลับมา
            console.error(`External API responded with status ${response.status} for recipient ${data.recipient}:`, errorBody);
            return { status: 'error', system_message: `API Error: ${response.statusText}`, details: errorBody };
        }
        return await response.json();
    } catch (error) {
        console.error("Error calling ISMS API:", error);
        return { status: 'error', system_message: error.message };
    }
}

export async function GET(request) {
  // 1. ตรวจสอบความปลอดภัยของ Cron Job
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  console.log('Cron job started: Processing pending SMS messages...');

  try {
    // 2. ดึงข้อความที่ยังรอดำเนินการ (pending)
    const BATCH_SIZE = 50;
    const { data: pendingMessages, error: fetchError } = await supabase
      .from('sms_messages')
      .select('*')
      .eq('status', 'pending')
      .limit(BATCH_SIZE);

    if (fetchError) throw fetchError;

    if (!pendingMessages || pendingMessages.length === 0) {
      console.log('No pending messages to process.');
      return NextResponse.json({ success: true, message: 'No pending messages.' });
    }

    console.log(`Found ${pendingMessages.length} messages to process.`);

    // 3. วนลูปส่ง SMS ทีละข้อความ
    for (const msg of pendingMessages) {
      
      // --- จุดที่แก้ไข ---
      // ตรวจสอบว่ามี sender_name หรือไม่
      if (!msg.sender_name) {
        console.error(`Skipping message ID ${msg.id} due to missing sender_name.`);
        // อัปเดตสถานะเป็น failed เพื่อไม่ให้วนกลับมาทำอีก
        await supabase.from('sms_messages')
          .update({ status: 'failed', status_code: 'MISSING_SENDER' })
          .eq('id', msg.id);
        continue; // ข้ามไปทำข้อความถัดไป
      }

      const normalizedRecipient = normalizeThaiPhoneNumber(msg.recipient);

      const payload = {
        recipient: normalizedRecipient,
        sender_name: msg.sender_name,
        message: msg.message
      };

      console.log(`Sending to ${normalizedRecipient} with sender "${msg.sender_name}"`);

      const apiResult = await callIsmsApi(payload);

      // 4. อัปเดตสถานะของข้อความตามผลลัพธ์
      if (apiResult.status === 'success') {
        await supabase.from('sms_messages')
          .update({
            status: 'sent',
            sms_uuid: apiResult.data.uuid,
            ref_no: apiResult.data.ref_no,
            status_code: apiResult.data.status,
            cost: apiResult.data.cost
          })
          .eq('id', msg.id);
      } else {
        await supabase.from('sms_messages')
          .update({ 
            status: 'failed',
            status_code: 2 // หรือรหัส Error อื่นๆ ตามที่ API คืนค่ามา
          })
          .eq('id', msg.id);
      }
    }

    return NextResponse.json({ success: true, message: `Processed ${pendingMessages.length} messages.` });

  } catch (error) {
    console.error('Cron Job Error:', error);
    return NextResponse.json({ success: false, message: 'Cron job failed: ' + error.message }, { status: 500 });
  }
}

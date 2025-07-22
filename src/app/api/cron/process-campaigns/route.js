import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

// ฟังก์ชันสำหรับเรียก A PI ของ isms.asia
async function callIsmsApi(data) {
    // ใช้ URL ที่ถูกต้องตามโค้ดตัวอย่าง
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
            console.error(`External API responded with status ${response.status}:`, errorBody);
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
      // สร้าง Payload ให้ตรงกับโค้ดตัวอย่างที่ให้มา
      const payload = {
        recipient: msg.recipient,
        sender_name: msg.sender_name,
        message: msg.message
      };

      // Log เพื่อให้เห็นว่าเราส่งอะไรไป
      console.log('Sending payload to ISMS API:', JSON.stringify(payload));

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

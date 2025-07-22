import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

// ฟังก์ชันสำหรับเรียก API ของ isms.asia
async function callIsmsApi(data) {
    // --- จุดที่แก้ไข ---
    // เปลี่ยน URL จาก '.../message-sms/send' เป็น '.../send'
    // เพื่อให้ตรงกับ API endpoint ที่เป็นไปได้มากที่สุด
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
        // เพิ่มการตรวจสอบสถานะของ response ก่อนแปลงเป็น JSON
        if (!response.ok) {
            // พยายามอ่าน error body เพื่อดูรายละเอียดเพิ่มเติม
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
    // 2. ดึงข้อความที่ยังรอดำเนินการ (pending) มาจำนวนหนึ่ง (เช่น 50 ข้อความ)
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

    // 3. วนลูปส่ง SMS ทีละข้อความใน Batch ที่ดึงมา
    for (const msg of pendingMessages) {
      const apiResult = await callIsmsApi({
        recipient: msg.recipient,
        sender_name: msg.sender_name,
        message: msg.message
      });

      // 4. อัปเดตสถานะของข้อความตามผลลัพธ์ที่ได้
      if (apiResult.status === 'success') {
        await supabase.from('sms_messages')
          .update({
            status: 'sent', // <-- อัปเดตสถานะ
            sms_uuid: apiResult.data.uuid,
            ref_no: apiResult.data.ref_no,
            status_code: apiResult.data.status,
            cost: apiResult.data.cost
          })
          .eq('id', msg.id);
      } else {
        await supabase.from('sms_messages')
          .update({ 
            status: 'failed', // <-- อัปเดตสถานะ
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

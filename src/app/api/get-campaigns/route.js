import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

/**
 * API Route to fetch all campaigns from the database.
 * This correctly fetches a list of campaigns without using .single(),
 * which prevents the HTTP 406 Not Acceptable error.
 */
export async function GET() {
  try {
    // ดึงข้อมูลแคมเปญทั้งหมด โดยเรียงจากใหม่สุดไปเก่าสุด
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .order('created_at', { ascending: false });

    // หากเกิด error จากการดึงข้อมูล ให้โยน error ออกไป
    if (error) {
      throw error;
    }

    // ส่งข้อมูลที่ได้กลับไปในรูปแบบ JSON ที่ถูกต้อง
    return NextResponse.json({ success: true, campaigns: data });

  } catch (error) {
    console.error("Error fetching campaigns:", error);
    // ส่งข้อความ error กลับไปพร้อม status 500
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

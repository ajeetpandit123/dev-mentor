import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getServiceSupabase } from '@/lib/supabaseServer';

export async function POST(req: NextRequest) {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      plan,
      userId 
    } = await req.json();

    // 1. VERIFY SIGNATURE
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    // 2. UPDATE USER PLAN IN DATABASE (using Service Role to bypass RLS)
    const supabase = getServiceSupabase();
    
    // Grant Unlimited Tokens (or a very high number) and update plan name
    const { error } = await supabase
      .from('profiles')
      .update({ 
        plan: plan,
        analysis_tokens: 999999 // Representing 'Unlimited'
      })
      .eq('id', userId);

    if (error) {
      console.error('Database Update Error:', error);
      throw new Error('Payment verified but failed to update profile');
    }

    return NextResponse.json({ success: true, message: "Payment verified successfully" });
  } catch (error: any) {
    console.error('Payment Verification Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

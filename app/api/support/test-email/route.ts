import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend('re_bpkdMvst_8K3CEnKXffmsag9yWafzrgKE');

export async function GET() {
  try {
    console.log('Sending test email...');
    
    const { data, error } = await resend.emails.send({
      from: 'Intfinex <onboarding@resend.dev>',
      to: 'email@intfinex.com', // Your email address
      subject: 'Test Email from Support System',
      html: `
        <div>
          <h1>This is a test email</h1>
          <p>If you're receiving this, the email system is working.</p>
          <p>Time: ${new Date().toISOString()}</p>
        </div>
      `
    });
    
    if (error) {
      console.error('Full error details:', error);
      return NextResponse.json({ success: false, error }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true, 
      messageId: data?.id
    });
  } catch (error) {
    console.error('Caught exception:', error);
    return NextResponse.json({ success: false, error }, { status: 500 });
  }
} 
import { NextResponse } from 'next/server'
import { Resend } from 'resend'

// Initialize Resend with your API key
const resend = new Resend('re_bpkdMvst_8K3CEnKXffmsag9yWafzrgKE');

export async function GET() {
  try {
    console.log('Sending test email...');
    
    // Send a simple test email
    const { data, error } = await resend.emails.send({
      from: 'Intfinex <email@intfinex.com>',
      to: 'afurkankurt@outlook.com',
      subject: 'Test Email from Intfinex',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #222; padding: 20px; text-align: center;">
            <h2 style="color: #00ffd5;">Intfinex</h2>
          </div>
          <div style="padding: 20px; background-color: #f9f9f9;">
            <h3>Hello!</h3>
            <p>This is a test email from Intfinex to verify that our email sending is working correctly.</p>
            <p>Time sent: ${new Date().toISOString()}</p>
          </div>
        </div>
      `
    });
    
    if (error) {
      console.error('Resend API error:', error);
      return NextResponse.json({ 
        success: false, 
        error: error.message 
      }, { status: 500 });
    }
    
    console.log('Test email sent successfully, ID:', data?.id);
    
    return NextResponse.json({ 
      success: true, 
      messageId: data?.id 
    });
  } catch (error) {
    console.error('Error sending test email:', error);
    return NextResponse.json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 
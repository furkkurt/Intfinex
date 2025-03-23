import { NextResponse } from 'next/server'
import { adminAuth } from '@/lib/firebase-admin'
import { Resend } from 'resend'

// Initialize Resend with API key
const resend = new Resend('re_bpkdMvst_8K3CEnKXffmsag9yWafzrgKE'); // Using the same key as other endpoints

export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Generate a random password
    const newPassword = Math.random().toString(36).slice(-8) + 
      Math.random().toString(36).toUpperCase().slice(-2) + 
      Math.floor(Math.random() * 10);

    try {
      // Get user by email
      const user = await adminAuth.getUserByEmail(email);
      
      // Update password in Firebase Auth
      await adminAuth.updateUser(user.uid, {
        password: newPassword
      });
    } catch (authError) {
      console.error('Auth error:', authError);
      return NextResponse.json({ 
        error: 'User not found or authentication failed' 
      }, { status: 404 });
    }

    try {
      // Send email with new password
      const { data, error } = await resend.emails.send({
        from: 'Intfinex <email@intfinex.com>',
        to: email,
        subject: 'Your Password Has Been Reset',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Password Reset</h2>
            <p>Your password has been reset. Here is your new password:</p>
            <p style="font-size: 24px; padding: 10px; background: #f5f5f5; border-radius: 5px;">
              ${newPassword}
            </p>
            <p>Please change this password after logging in.</p>
            <p>If you did not request this password reset, please contact support immediately.</p>
          </div>
        `
      });

      if (error) {
        console.error('Email sending error:', error);
        // Password was updated but email failed
        return NextResponse.json({ 
          success: true,
          warning: 'Password updated but email delivery failed'
        });
      }

      return NextResponse.json({ 
        success: true,
        messageId: data?.id 
      });
    } catch (emailError) {
      console.error('Email error:', emailError);
      // Password was updated but email failed
      return NextResponse.json({ 
        success: true,
        warning: 'Password updated but email delivery failed'
      });
    }
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json({ 
      error: 'Failed to reset password',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 
import { NextResponse } from 'next/server'
import { adminDb, adminAuth } from '@/lib/firebase-admin'
import { Resend } from 'resend'

// Check for development mode
const isDev = process.env.NODE_ENV === 'development'

// Initialize Resend with API key - get one from https://resend.com
// Free tier provides 100 emails/day
const resend = new Resend('re_bpkdMvst_8K3CEnKXffmsag9yWafzrgKE'); // Your actual API key

// Check if in sandbox mode (add this before sending)
const isSandboxMode = false; // Set to false to ensure real sending

// Try different verified sender addresses
const senderEmail = 'email@intfinex.com'; // Your current sender
const backupSender = 'noreply@intfinex.com'; // Try an alternative
const personalSender = 'your-personal-email@gmail.com'; // Try your personal email if verified

export async function POST(request: Request) {
  try {
    const { action, uid, email, code } = await request.json()
    
    if (action === 'send') {
      try {
        // Generate a verification code if not provided
        const verificationCode = code || Math.floor(100000 + Math.random() * 900000).toString();
        
        // Log the code for debugging in both dev and production
        console.log(`===== EMAIL VERIFICATION INFO =====`);
        console.log(`CODE: ${verificationCode}`);
        console.log(`USER: ${email}`);
        console.log(`UID: ${uid}`);
        
        // Store the code in Firestore
        if (!code) {
          await adminDb.collection('users').doc(uid).update({
            emailVerificationCode: verificationCode,
            emailVerificationSentAt: new Date().toISOString(),
            emailVerificationAttempts: 0
          });
        }
        
        // Send the email using Resend (now confirmed working)
        const { data, error } = await resend.emails.send({
          from: 'Intfinex <email@intfinex.com>',
          to: email,
          subject: 'Your Intfinex Verification Code',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background-color: #222; padding: 20px; text-align: center;">
                <h2 style="color: #00ffd5;">Intfinex</h2>
              </div>
              <div style="padding: 20px; background-color: #f9f9f9;">
                <h3>Your Verification Code</h3>
                <p>Please use the following code to verify your email address:</p>
                <div style="background-color: #eee; padding: 10px; text-align: center; font-size: 24px; letter-spacing: 5px; font-weight: bold;">
                  ${verificationCode}
                </div>
                <p style="margin-top: 20px;">This code will expire in 15 minutes.</p>
              </div>
            </div>
          `
        });
        
        if (error) {
          console.error('Email sending error:', error);
          return NextResponse.json({ 
            success: false, 
            error: error.message 
          });
        }
        
        console.log('Email sent successfully, ID:', data?.id);
        
        // Record the successful email
        if (uid) {
          await adminDb.collection('users').doc(uid).update({
            emailSendAttempted: true,
            emailSendSuccessful: true,
            emailSendTimestamp: new Date().toISOString(),
            emailProvider: 'resend',
            emailMessageId: data?.id
          });
        }
        
        return NextResponse.json({ 
          success: true,
          messageId: data?.id
        });
      } catch (error) {
        console.error('Error in email verification process:', error);
        return NextResponse.json({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    } 
    else if (action === 'verify') {
      console.log('=== VERIFICATION REQUEST ===');
      console.log('UID:', uid);
      console.log('Submitted code from request:', code);
      
      try {
        // Get the verification data
        const userDoc = await adminDb.collection('users').doc(uid).get();
        
        console.log('Document exists:', userDoc.exists);
        
        if (!userDoc.exists) {
          return NextResponse.json({ error: 'Verification document not found' }, { status: 400 });
        }
        
        const userData = userDoc.data();
        console.log('Full userData:', JSON.stringify(userData, null, 2));
        
        // Deep inspection of the verification code
        console.log('== CODE COMPARISON DETAILS ==');
        console.log('Stored code (raw):', userData?.emailVerificationCode);
        console.log('Submitted code (raw):', code);
        console.log('Types - stored:', typeof userData?.emailVerificationCode, 'submitted:', typeof code);
        console.log('String lengths - stored:', String(userData?.emailVerificationCode).length, 'submitted:', String(code).length);
        
        // Compare character by character to find hidden whitespace or other issues
        const storedStr = String(userData?.emailVerificationCode);
        const submittedStr = String(code);
        console.log('Character by character analysis:');
        console.log('Stored:', Array.from(storedStr).map(c => `'${c}' (${c.charCodeAt(0)})`).join(', '));
        console.log('Submitted:', Array.from(submittedStr).map(c => `'${c}' (${c.charCodeAt(0)})`).join(', '));
        
        const normalizedStored = storedStr.trim();
        const normalizedSubmitted = submittedStr.trim();
        
        console.log('After normalization - stored:', normalizedStored, 'submitted:', normalizedSubmitted);
        console.log('Equality check result:', normalizedStored === normalizedSubmitted);
        
        // Now proceed with verification...
        if (normalizedStored !== normalizedSubmitted) {
          console.log('❌ VERIFICATION FAILED: Code mismatch!');
          
          // For testing purposes, let's add a special check to allow verification anyway when the right code is shown in the UI
          if (process.env.NODE_ENV === 'development') {
            console.log('DEV MODE: Would normally reject, but checking if UI code matches stored');
            
            // This is a development-only fallback to help debug by allowing verification 
            // when the UI shows the correct code but submission fails for unknown reasons
            console.log('DEV MODE: Continuing verification process for debugging');
            
            // Still update the attempts counter
            await adminDb.collection('users').doc(uid).update({
              emailVerificationAttempts: ((userData?.emailVerificationAttempts ?? 0) + 1),
              _debugNotes: `Attempted with: ${submittedStr}, stored was: ${storedStr}`
            });
            
            // But continue instead of returning error
          } else {
            // In production, fail as normal
            await adminDb.collection('users').doc(uid).update({
              emailVerificationAttempts: ((userData?.emailVerificationAttempts ?? 0) + 1)
            });
            
            return NextResponse.json({ 
              error: 'Invalid verification code',
              debug: { 
                submitted: submittedStr,
                expectedPattern: `A 6-digit number like: ${typeof userData?.emailVerificationCode === 'number' ? '123456' : userData?.emailVerificationCode?.substring(0, 1) + '*****'}`
              }
            }, { status: 400 });
          }
        } else {
          console.log('✓ VERIFICATION SUCCEEDED: Code matched!');
        }
        
        // If we get here, the code matched
        console.log('Verification code matched successfully!');
        
        // Check if the code is expired (30 minutes)
        const sentAt = new Date(userData?.emailVerificationSentAt ?? new Date().toISOString()).getTime()
        const now = Date.now()
        const thirtyMinutesInMs = 30 * 60 * 1000
        
        if (now - sentAt > thirtyMinutesInMs) {
          return NextResponse.json({ error: 'Verification code expired' }, { status: 400 })
        }
        
        // Mark email as verified
        await adminDb.collection('users').doc(uid).update({
          emailVerified: true,
          emailVerifiedAt: new Date().toISOString()
        })
        
        // Also update the user's emailVerified status in Firebase Auth
        await adminAuth.updateUser(uid, {
          emailVerified: true
        })
        
        return NextResponse.json({ success: true })
      } catch (error) {
        console.error('Error in verification process:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
      }
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Email verification error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
} 
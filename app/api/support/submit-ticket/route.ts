import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { adminDb } from '@/lib/firebase-admin'

// Initialize Resend with API key
const resend = new Resend('re_bpkdMvst_8K3CEnKXffmsag9yWafzrgKE');

export async function POST(request: Request) {
  try {
    const { subject, message, userEmail, userName, userId } = await request.json()
    
    if (!subject || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    // Store ticket in Firestore
    const ticketRef = adminDb.collection('support_tickets').doc()
    await ticketRef.set({
      subject,
      message,
      userEmail,
      userName,
      userId,
      status: 'open',
      createdAt: new Date().toISOString(),
      ticketId: ticketRef.id
    })
    
    // Before sending the email
    console.log('Attempting to send support ticket email to:', 'email@intfinex.com');

    // Send email notification
    const { data, error } = await resend.emails.send({
      from: 'Intfinex <onboarding@resend.dev>',
      to: 'email@intfinex.com',
      subject: `Support Ticket: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #222; padding: 20px; text-align: center;">
            <h2 style="color: #00ffd5;">Intfinex Support Ticket</h2>
          </div>
          <div style="padding: 20px; background-color: #f9f9f9;">
            <p><strong>From:</strong> ${userName || 'Unknown'} (${userEmail || 'No email'})</p>
            <p><strong>User ID:</strong> ${userId || 'Unknown'}</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <h3>Message:</h3>
            <p style="white-space: pre-line;">${message}</p>
            <hr />
            <p>Please reply to this email to respond to the customer.</p>
          </div>
        </div>
      `
    })
    
    if (error) {
      console.error('Error details from Resend:', {
        error,
        errorMessage: error.message,
        errorName: error.name,
        statusCode: error.statusCode,
        errorDetails: error.details
      });
      // Still return success if Firestore saved, email delivery is secondary
      return NextResponse.json({ 
        success: true, 
        ticketId: ticketRef.id,
        emailStatus: 'failed',
        emailError: error.message
      })
    }
    
    return NextResponse.json({ 
      success: true, 
      ticketId: ticketRef.id,
      emailStatus: 'sent',
      messageId: data?.id
    })
  } catch (error) {
    console.error('Error submitting support ticket:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
} 
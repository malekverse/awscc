import { NextRequest, NextResponse } from 'next/server'
import { sendContactEmail } from '@/lib/email-service'
import { ContactFormValues } from '@/components/contact-form'
import { z } from 'zod'

// Validation schema for the contact form
const contactSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  subject: z.string().min(5, { message: "Subject must be at least 5 characters" }),
  message: z.string().min(10, { message: "Message must be at least 10 characters" }),
  company: z.string().optional(),
  phone: z.string().optional()
    .refine(val => !val || /^\+?[0-9\s()]*$/.test(val), {
      message: "Phone number can only contain numbers, spaces, and + or () characters"
    }),
})

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json()
    
    // Validate the form data
    const validationResult = contactSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid form data', 
          details: validationResult.error.errors 
        },
        { status: 400 }
      )
    }

    const contactData: ContactFormValues = validationResult.data

    // Log the contact submission (for debugging)
    console.log('Contact form submission:', {
      name: contactData.name,
      email: contactData.email,
      subject: contactData.subject,
      timestamp: new Date().toISOString()
    })

    // Send the contact email with AI-generated response
    try {
      await sendContactEmail(contactData)
      
      return NextResponse.json(
        { 
          success: true, 
          message: 'Your message has been sent successfully! We\'ll get back to you soon.' 
        },
        { status: 200 }
      )
    } catch (emailError) {
      console.error('Email sending failed:', emailError)
      
      // Return success to user but log the error internally
      // This ensures user experience isn't affected by email service issues
      return NextResponse.json(
        { 
          success: true, 
          message: 'Your message has been received! We\'ll contact you as soon as possible.' 
        },
        { status: 200 }
      )
    }

  } catch (error) {
    console.error('Contact form submission error:', error)
    
    return NextResponse.json(
      { 
        error: 'Internal server error. Please try again later.',
        message: 'We\'ll contact you as soon as possible' 
      },
      { status: 500 }
    )
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
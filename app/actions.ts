'use server';

import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

// Initialize Supabase client with environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

export async function submitContactForm(formData: FormData) {
  const firstName = formData.get('firstName') as string;
  const lastName = formData.get('lastName') as string;
  const email = formData.get('email') as string;
  const message = formData.get('message') as string;
  const preferredMethod = formData.get('preferredMethod') as string;
  const phone = formData.get('phone') as string || '';

  if (!firstName || !lastName || !email || !message) {
    return { success: false, error: 'Missing required fields' };
  }

  try {
    // Generate a unique ID for the submission
    const id = uuidv4();
    
    const { data, error } = await supabase
      .from('ContactSubmission')
      .insert([{
        id,  // The generated ID
        firstName,
        lastName,
        email,
        message,
        preferredMethod,
        phone,
        status: 'pending',  // Set default status to 'pending'
        createdAt: new Date().toISOString()
      }])
      .select();

    if (error) {
      console.error('Database Error:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to save submission' 
      };
    }

    return { 
      success: true, 
      data,
      message: 'Your message has been sent successfully!'
    };
  } catch (error) {
    console.error('Submission Error:', error);
    return { 
      success: false, 
      error: 'An error occurred while submitting the form. Please try again later.'
    };
  }
}
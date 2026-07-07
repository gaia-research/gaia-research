import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-url.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.warn(
    'Supabase credentials not found in environment variables. ' +
    'Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'
  );
}

/**
 * Clean Supabase client instance for client-side and server-side database/auth operations.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Standard stub for GitHub OAuth integration.
 * Triggers redirect flow using Supabase auth service.
 */
export async function signInWithGithub(redirectTo?: string) {
  const targetRedirect = redirectTo || (typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : '');
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: targetRedirect,
    },
  });
  
  return { data, error };
}

/**
 * Signs the user out of the current Supabase session.
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

/**
 * Standard stub for fetching authenticated user profiles.
 */
export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
    
  return { data, error };
}

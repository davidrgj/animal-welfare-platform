import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

let client: SupabaseClient | null = null;

export function isCloud(): boolean {
  return Boolean(environment.supabaseUrl && environment.supabaseAnonKey);
}

/** Public app origin for auth emails (never localhost in production builds). */
export function appOrigin(): string {
  if (typeof window !== 'undefined' && window.location?.origin && !window.location.origin.includes('localhost')) {
    return window.location.origin.replace(/\/$/, '');
  }
  return (environment.appUrl || 'https://animal-welfare-platform-vepq.vercel.app').replace(/\/$/, '');
}

/** Redirect after email confirmation / recovery (hash router). */
export function authEmailRedirectTo(): string {
  return `${appOrigin()}/#/login`;
}

export function supabase(): SupabaseClient {
  if (!client) {
    client = createClient(environment.supabaseUrl, environment.supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce'
      }
    });
  }
  return client;
}

import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// For production builds, hardcode the values or use react-native-config
const supabaseUrl = 'https://nexejauijbarxxxbdpuk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5leGVqYXVpamJhcnh4eGJkcHVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU2MTE0MDAsImV4cCI6MjA4MTE4NzQwMH0.B3tldRoRzp6RlmjwWQzuCes0SzkC4ILPY_tRSMv3uxg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

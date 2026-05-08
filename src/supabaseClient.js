import { createClient } from '@supabase/supabase-js'

// Твоите данни от новия проект в Supabase
const supabaseUrl = 'https://vdkiiqlenkntwajenmtp.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZka2lpcWxlbmtudHdhamVubXRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxNTk1NTUsImV4cCI6MjA5MzczNTU1NX0.8FDhPCV2dGUYMdlK2RVg4W0mYpMSvPl75HImo_BJtMQ'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
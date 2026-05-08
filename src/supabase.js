import { createClient } from '@supabase/supabase-js'

// Твоите данни от НОВИЯ проект в Supabase
const SUPABASE_URL = 'https://vdkiiqlenkntwajenmtp.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZka2lpcWxlbmtudHdhamVubXRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxNTk1NTUsImV4cCI6MjA5MzczNTU1NX0.8FDhPCV2dGUYMdlK2RVg4W0mYpMSvPl75HImo_BJtMQ'

export const db = createClient(SUPABASE_URL, SUPABASE_KEY)
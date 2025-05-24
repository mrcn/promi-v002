import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://itfbzeqkdwwfqsbcvlcn.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0ZmJ6ZXFrZHd3ZnFzYmN2bGNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxMDE1NzksImV4cCI6MjA2MzY3NzU3OX0.II3u694xg8q3EvtoYy0ikVtK_uAUJ2Hhv33P9iJvRag'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
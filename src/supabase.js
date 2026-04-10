import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://uxemtqftuxqowktegvim.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4ZW10cWZ0dXhxb3drdGVndmltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3OTMyMzgsImV4cCI6MjA5MTM2OTIzOH0.LpdrI0qhfSa3nWCFyr3iE5VshNPZbkMjwBHXtxPqUG0'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

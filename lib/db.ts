import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Helper function to execute raw SQL queries
export async function executeQuery(query: string, params: any[] = []) {
  try {
    const { data, error } = await supabase.rpc("execute_sql", {
      query,
      params,
    })

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error("Database query error:", error)
    return { data: null, error }
  }
}

export default supabase

import { supabase } from "./db"

// Create a bucket for case documents if it doesn't exist
export async function initializeStorage() {
  try {
    // Check if the bucket exists
    const { data: buckets } = await supabase.storage.listBuckets()
    const bucketExists = buckets?.some((bucket) => bucket.name === "case-documents")

    // Create the bucket if it doesn't exist
    if (!bucketExists) {
      const { error } = await supabase.storage.createBucket("case-documents", {
        public: true, // Make the bucket public so files can be accessed without authentication
      })

      if (error) {
        console.error("Error creating storage bucket:", error)
        return false
      }
    }

    return true
  } catch (error) {
    console.error("Error initializing storage:", error)
    return false
  }
}

// Initialize storage on app startup
initializeStorage()

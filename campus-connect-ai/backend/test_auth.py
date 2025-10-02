import os
from dotenv import load_dotenv
import vertexai

# Load environment variables from .env file
load_dotenv()

print("Attempting to initialize Vertex AI...")

try:
    # Initialize Vertex AI.
    # This will raise an exception if authentication fails.
    vertexai.init()

    project_id = os.getenv("GOOGLE_CLOUD_PROJECT")
    if not project_id:
        # If not set in env, try to get it from the initialized client
        import google.auth
        try:
            _, project_id = google.auth.default()
        except Exception as e:
            print(f"Could not determine project ID: {e}")

    print("✅ Vertex AI initialized successfully!")
    if project_id:
        print(f"✅ Project ID: {project_id}")
    else:
        print("⚠️ Could not automatically determine Project ID. Please ensure it's set if needed.")

except Exception as e:
    print(f"❌ Failed to initialize Vertex AI: {e}")
    print("\nPlease double-check the following:")
    print("1. The .env file exists in the same directory as this script.")
    print("2. The GOOGLE_APPLICATION_CREDENTIALS path in your .env file is correct.")
    print("3. The JSON key file is not corrupted and the service account has the 'Vertex AI User' role.")
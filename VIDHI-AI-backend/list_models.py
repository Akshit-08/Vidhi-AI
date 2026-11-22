import os
from dotenv import load_dotenv
from groq import Groq

load_dotenv()
api_key = (os.getenv("GROQ_API_KEY") or "").strip()
if not api_key:
    print("GROQ_API_KEY not found in .env")
    exit(1)

client = Groq(api_key=api_key)

try:
    models = client.models.list()
    print("\nAvailable Groq models for your API key:")
    for m in models.data:
        print(f"  - {m.id}")
except Exception as e:
    print(f"Error checking models: {e}")

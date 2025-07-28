from fastapi import FastAPI, UploadFile, File, HTTPException
from llama_parse import LlamaParse
import shutil
import os
import uuid
from dotenv import load_dotenv

# ---------- Load environment variables from .env ----------
# This loads the .env file in the current working directory (llama_parse_service/)
load_dotenv()


# ---------- Fetch API Key from environment -------------
LLAMA_API_KEY = os.environ.get("LLAMA_CLOUD_API_KEY")

# Defensive: Ensure API key is present, raise early error if not found
if not LLAMA_API_KEY:
    raise RuntimeError("LLAMA_CLOUD_API_KEY is not set in environment variables")

# ---------- Initialize LlamaParse client ---------------
# Pass the API key to authenticate with the service or cloud backend
parser = LlamaParse(api_key=LLAMA_API_KEY)

# ---------- Create FastAPI application -------------------
app = FastAPI()

# ---------- Ensure upload directory exists ----------------
UPLOAD_FOLDER = "uploaded_files"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


@app.post("/parse_pdf/")
async def parse_pdf(file: UploadFile = File(...)):
    """
    API endpoint to accept PDF upload and return parsed markdown chunks.

    Steps:
    - Validates the uploaded file extension (must be .pdf).
    - Saves the uploaded file temporarily on disk.
    - Calls LlamaParse to parse the PDF into page-marked markdown chunks.
    - Deletes the temporary file after parsing.
    - Returns JSON containing the chunks and total chunk count.
    """

    # Validate file extension is PDF
    if not file.filename.lower().endswith('.pdf'):
        # Return 400 Bad Request if not PDF
        raise HTTPException(status_code=400, detail="Only PDF files are accepted")

    # Generate a unique filename to avoid collisions
    temp_filename = f"{uuid.uuid4()}.pdf"
    file_path = os.path.join(UPLOAD_FOLDER, temp_filename)  # <-- Fix here: os.path.join instead of just os

    try:
        # Save the uploaded file to disk
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Call the LlamaParse parser on saved file
        documents = parser.load_data(file_path)

        # Prepare structured response by extracting page and text
        results = []
        for doc in documents:
            results.append({
                "page": doc.metadata.get("page", None),
                "text": doc.text
            })

        # Debug logging — print number of chunks parsed (optional)
        print(f"Parsed {len(results)} chunks from PDF")

        # Return chunks and total count as JSON response
        return {"chunks": results, "total_chunks": len(results)}

    except Exception as e:
        print(f"Error parsing PDF: {e}")  # Log error
        raise HTTPException(status_code=500, detail=f"Error parsing PDF: {str(e)}")

    finally:
        # Clean up: remove the temporary uploaded file to free disk space
        if os.path.exists(file_path):
            os.remove(file_path)


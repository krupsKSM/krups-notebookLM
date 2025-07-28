from fastapi import FastAPI, UploadFile, File, HTTPException
from llama_parse import LlamaParse
import shutil
import os
import uuid
from dotenv import load_dotenv

# ---------- Load environment variables from .env ----------
# This loads the .env file present in the current working directory (llama_parse_service/)
load_dotenv()

# ---------- Fetch API Key from environment variables ----------
LLAMA_API_KEY = os.environ.get("LLAMA_CLOUD_API_KEY")

# Defensive check: Raise error early if API key is missing
if not LLAMA_API_KEY:
    raise RuntimeError("LLAMA_CLOUD_API_KEY is not set in environment variables")

# ---------- Initialize LlamaParse client ----------
# Pass the API key for authenticated access to LlamaParse service or cloud backend
parser = LlamaParse(api_key=LLAMA_API_KEY)

# ---------- Initialize FastAPI app ----------
app = FastAPI()

# ---------- Ensure the upload directory exists ----------
UPLOAD_FOLDER = "uploaded_files"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.post("/parse_pdf/")
async def parse_pdf(file: UploadFile = File(...)):
    """
    Endpoint to upload a PDF, parse it using LlamaParse, and return parsed markdown chunks.

    Workflow:
    - Validate that the uploaded file is a PDF.
    - Generate a unique temporary filename and save the file locally.
    - Pass the saved file to LlamaParse parser to extract markdown chunks with page metadata.
    - Collect page-text pairs into a response JSON.
    - Delete the temporary file after parsing to avoid storage bloat.
    - Handle and log exceptions with stack trace for debug purposes.
    """

    # Validate the uploaded file extension: accept only PDFs
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted")

    # Create a unique filename with UUID to avoid collisions
    temp_filename = f"{uuid.uuid4()}.pdf"
    file_path = os.path.join(UPLOAD_FOLDER, temp_filename)

    try:
        # Save uploaded file contents to disk temporarily
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Call LlamaParse client to parse the saved PDF file
        documents = parser.load_data(file_path)

        # Prepare the results from the parsed documents
        results = []
        for doc in documents:
            results.append({
                "page": doc.metadata.get("page", None),  # Extract page number, if available
                "text": doc.text                        # Extract text content of the chunk
            })

        # Debug log: number of chunks parsed
        print(f"Parsed {len(results)} chunks from PDF")

        # Return JSON response containing the chunks and total count
        return {"chunks": results, "total_chunks": len(results)}

    except Exception as e:
        # Print full traceback in server logs for debugging
        import traceback
        traceback.print_exc()

        # Log the error message
        print(f"Error parsing PDF: {e}")

        # Raise HTTP 500 Internal Server Error with error details for client debug
        raise HTTPException(status_code=500, detail=f"Error parsing PDF: {str(e)}")

    finally:
        # Clean up by removing the temporarily saved PDF file
        if os.path.exists(file_path):
            os.remove(file_path)

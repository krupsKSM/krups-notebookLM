# PDF Chatbot Application(NotebookLM clone)

## Overview

This application enables users to upload PDF documents and interact with their content via an AI-powered chat interface. It supports:

- Uploading and viewing PDFs with progress feedback.
- Parsing PDFs into semantic chunks using LlamaParse.
- Generating embeddings for PDF chunks for semantic search.
- Querying the document via chat with accurate page citations.
- Navigating the PDF viewer by clicking citations in chat responses.
- A clean, responsive UI with starter prompt recommendations.

---

## Technology Stack

- **Frontend:** React, Tailwind CSS, `react-pdf`, `react-icons`
- **Backend:** Node.js + Express, OpenAI API, in-memory vector store
- **Microservice:** Python FastAPI microservice wrapping LlamaParse for PDF chunking

---

## Prerequisites

- [Node.js](https://nodejs.org/en/) v16 or higher
- Python 3.9 or higher
- OpenAI API Key with sufficient quota and billing enabled
- Llama Cloud API Key (for PDF parsing microservice)

---

## Getting Started

### 1. Clone the repository

git clone https://github.com/yourusername/your-repo.git
```
cd your-repo
```
### 2. Setup Backend
```
cd backend
npm install
```

- Create `.env` in `backend` folder:

```
OPENAI_API_KEY=your_openai_api_key_here
```

- Start backend server:
```
npm run dev
```

Backend runs at `http://localhost:3000`.

### 3. Setup LlamaParse Microservice

```
cd llama_parse_service
python -m venv venv # Optional virtual env
source venv/bin/activate # On Windows: venv\Scripts\activate

pip install -r requirements.txt
```

- Create `.env` in microservice folder:

```
LLAMA_CLOUD_API_KEY=your_llama_cloud_api_key_here
```

- Run microservice:

```
uvicorn main:app --host 0.0.0.0 --port 8000
```

Microservice listens at `http://localhost:8000`.

### 4. Setup Frontend

```
cd ../frontend
npm install
```

- Create `.env` in frontend folder (optional):

```
VITE_API_BASE_URL=http://localhost:3000/api
```

- Start frontend

```
npm run dev
```

Open in browser at `http://localhost:5173` (or printed URL).

---

## Usage

1. Open frontend.
2. Upload a PDF file.
3. Wait for processing; PDF renders inline.
4. Use chat panel to ask questions about PDF.
5. Click citations to jump to PDF pages.
6. Use "Upload new" to start over any time.

---

## Deployment

- Backend + Microservice: deploy on Render, Heroku, Railway, or similar.
- Frontend: deploy on Netlify, Vercel, or similar.
- Set environment variables securely.
- Update frontend's API base URL for production.
- Keep API keys safe and not exposed to frontend code.

---

## Troubleshooting

- **Quota issues:** Check [OpenAI usage dashboard](https://platform.openai.com/account/usage).
- **Empty parsing:** Use text PDFs, not scanned images.
- **Network:** Confirm endpoints and ports.
- **API keys:** Do not commit secrets; use `.env` files.

---

## Code Structure

```
/backend
/frontend
/llama_parse_service
README.md
.env.example
```

---

## Notes

- Uses batch embeddings to reduce costs.
- Uses local in-memory vector store (consider upgrades for production).
- Provides helpful error messages on quota exceeded.
- Responsive, accessible, clean UI design.


---

## Contact

Maintained by - krupasindhu.dev@gmail.com

---

*Enjoy your AI-powered PDF chatbot!*

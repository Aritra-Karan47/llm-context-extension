from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from backend.core.converter import html_to_markdown

app = FastAPI(title="LLM Context Converter")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],           # chrome-extension://* + localhost for MVP
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ConvertRequest(BaseModel):
    html: str
    url: str = ""

class ConvertResponse(BaseModel):
    markdown: str
    title: str
    word_count: int
    url: str

@app.post("/convert", response_model=ConvertResponse)
async def convert(request: ConvertRequest):
    try:
        result = html_to_markdown(request.html, request.url)
        return result
    except ValueError as e:
        raise HTTPException(status_code=413, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Conversion failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
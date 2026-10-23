from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(title="MedsCheck pre-PoC API")

# Local dev origins for the Vite server.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["POST"],
    allow_headers=["Content-Type"],
)


class Medicine(BaseModel):
    name: str = Field(min_length=1, max_length=200, description="Medicine name")
    dosage: str | None = Field(default=None, max_length=100, description="e.g. 500 mg")

    model_config = {"str_strip_whitespace": True}


class EvaluateRequest(BaseModel):
    medicines: list[Medicine] = Field(min_length=1, max_length=50)


class EvaluateResponse(BaseModel):
    status: str
    count: int
    medicines: list[Medicine]


# Nothing is stored or logged here: the list lives only for this request.
@app.post("/api/evaluate", response_model=EvaluateResponse)
def evaluate(req: EvaluateRequest) -> EvaluateResponse:
    return EvaluateResponse(
        status="received",
        count=len(req.medicines),
        medicines=req.medicines,
    )

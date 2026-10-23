# MedsCheck pre-PoC demo

Runnable skeleton from `docs/pre-poc-demo.md`: React front end, FastAPI API, Uvicorn server. The API validates the medicine list and echoes it back. There is no drug data, LLM or sourcing yet. Nothing is stored or logged.

`medscheck.html` is the original static mockup, kept for reference.

## Run

API (port 8000):

    cd api
    /opt/anaconda3/bin/python3 -m venv .venv && .venv/bin/pip install -r requirements.txt
    .venv/bin/uvicorn main:app --port 8000 --no-access-log

Web (port 5173, proxies `/api` to the API):

    cd web
    npm install
    npm run dev

## Call the API

The API can be called from the React web app (above) or directly with curl. With the API running on port 8000:

    curl -X POST http://localhost:8000/api/evaluate \
      -H "Content-Type: application/json" \
      -d '{"medicines":[{"name":"Metformin","dosage":"500 mg"},{"name":"Aspirin"}]}'

Response:

    {"status":"received","count":2,"medicines":[{"name":"Metformin","dosage":"500 mg"},{"name":"Aspirin","dosage":null}]}

`dosage` is optional and comes back as `null` when omitted. An empty list, or a medicine with a missing or empty `name`, is rejected with a validation error.

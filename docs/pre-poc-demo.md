# Pre-PoC Demo

Companion to [roadmap.md](roadmap.md). A small, runnable demo that comes before the PoC. It proves the front end, API and server fit together, so the PoC and later versions build on a working skeleton.

## Purpose

Show the medicine list flow end to end: a user fills in the list in the browser, the browser sends it to the API, and the API accepts it and replies. There is no drug data, no LLM and no sourcing yet. Those start in the PoC ([roadmap.md](roadmap.md)).

## Requirements

### 1. Tech stack

| Layer | Choice |
|---|---|
| API | FastAPI |
| Server | Uvicorn runs the FastAPI app |
| Front end | React |

### 2. API

One endpoint takes a structured medicine list.

- **Input:** a list of medicines. Each item has:
  - `name`: required, non-empty text.
  - `dosage`: optional text, for example "500 mg". We use "dosage" rather than "strength" because it is the more widely used term in India. The mockup says "strength"; the UI label should say "dosage".
- **Validation:** FastAPI request models reject a missing or empty `name` and an empty list, with a clear error.
- **Response (demo):** an acknowledgement that echoes back the validated list and its count. No analysis is done.

Example request body:

```json
{
  "medicines": [
    { "name": "Metformin", "dosage": "500 mg" },
    { "name": "Aspirin" }
  ]
}
```

The exact route name and response shape are set when the demo is built. `[ASSUMPTION]`

### 3. Front end

A React single-page app following the layout in `UX/MedsCheckDashboard.png`:

- A "Your medicine list" editor with a name field and an optional dosage field per row.
- Remove a row, and an "Add another medicine" action.
- An "Evaluate medicines" button that sends the list to the API.
- A view that shows the API response, or the error if the request fails.

## Product promises that still apply

- **No data stored:** the API does not save or log medicine lists.
- **Disclaimer:** the page shows the general-information disclaimer from the mockup.

## Out of scope

Drug data, interaction checks, the LLM step, source links, authentication, hosting and polish.

## Done when

- The API and the React app both run locally.
- A list entered in the browser reaches the API and the response shows on screen.
- Invalid input (empty name, empty list) shows a clear error.
- Neither the API nor the server logs the list contents.

# Architecture (PoC)

How the PoC fits together. The reasons behind each choice are in [design-decisions.md](design-decisions.md). Stack, hosting and code layout are not chosen yet. `[NEEDS INPUT]`

## Request flow

```
Patient enters medicines (name + optional strength)
        |
        v
1. Normalise names          -> match brand names to active ingredients
        |
        v
2. Retrieve passages        -> trusted drug data source; each passage gets an ID (S1, S2, ...)
        |
        v
3. Call the model           -> medicines + passages in; JSON out (schema in poc-system-prompt.md)
        |
        v
4. Verify in code           -> IDs exist, quotes appear word for word, no evidence = dropped
        |
        v
5. Assemble the result      -> findings, "unable to answer" items, source links from our records,
        |                      fixed disclaimer
        v
Results page (nothing stored, nothing logged)
```

## Components

| Component | Job | Roadmap step |
|---|---|---|
| Name matcher | Brand name to active ingredient; flags unmatched names | P2 |
| Retriever | Finds passages for each medicine and each pair | P1, P3 |
| Prompt + model call | Produces the structured answer from retrieved passages only | P4 |
| Verifier | Enforces "no source, no answer" | P5 |
| Result builder | Merges verified output, looks up titles and URLs, adds the disclaimer | P5, P6 |
| UI | Medicine list editor, "Evaluate medicines" button, results view | P6 |

## Where the key promises are enforced

| Promise | Enforced by |
|---|---|
| Every claim has a source | Retriever supplies the only text the model may use (D2); verifier drops uncited or unquoted claims (D4) |
| No hallucinated answers; "unable to find" instead | Prompt rule plus `unable_to_answer` field (D7); verifier moves failures there (D4) |
| Always direct users to a professional | Fixed disclaimer added by code (D5); questions for the provider in each finding |
| Never says "safe" | Prompt rule and neutral empty-result message (D6) |
| No data stored | No persistence layer; counts-only logging; provider retention terms confirmed (D8) |

## Failure behaviour

- **Data source unavailable:** show an error. Do not call the model without passages.
- **Nothing retrieved for a medicine:** list it under "unable to answer". Do not call the model for it.
- **Model call fails or returns a response that doesn't match the schema:** show an error. Do not show partial output.
- **All findings fail verification:** show only the "unable to answer" items and the disclaimer.
- **Model declines to answer (refusal stop reason):** treat as "unable to answer" and show the standard message.

## Data handling

- This describes the PoC and every version before the later saved-list phase (see D11 in [design-decisions.md](design-decisions.md)). That phase will add a user store and needs its own architecture section.
- Medicine lists live in memory for the length of one request.
- Nothing is written to a database, file or log. Counts only may be logged.
- The model provider receives the medicine list and passages. Its retention terms must be confirmed before real patient data is used. `[NEEDS INPUT]`

## Not decided yet

- Programming language, framework and hosting.
- Which data source(s) and their licences (roadmap P1).
- How the test set is stored and kept free of real patient data.
- Rate limiting and abuse protection for a public endpoint.

Prototype

# CompareRx Architecture

A medicine interaction and risk checker for patients in India. The same system is shown twice: first for decision-makers, then for the engineering team.

[For management](#management) [For engineering](#engineering)

## For management

What a patient gets, what the product promises, and the order we build it in.

**How a check works.** The AI only explains text that software found in approved drug information, and software then verifies every quote before anything reaches the patient. When no source exists, the patient sees “I am unable to find the answer” instead of a guess.

**Build order.** The proof of concept and Version 1 deliver the checker itself. Versions 2 and 3 let patients add medicines from a photo, read by an AI agent, with the patient confirming every name. Saving medicines per user changes the “nothing is stored” promise, so it is held back until it has its own privacy and legal review.

### Why this is built to refuse

A confident wrong answer about a medicine is worse than no answer. Every claim needs a source, and software, not the AI, decides whether the source is real. A missing finding is acceptable. An invented one is not.

### Decisions needed from the business

- Which approved drug databases to use for Indian medicines, and their licences
- Who the clinical reviewer is
- Legal review of health-data rules, including the later saved-list phase
- Confirmation of the AI provider’s data retention terms

## For engineering

How a request moves through the PoC backend, where the trust boundaries are, and how the verifier enforces “no source, no answer”.

**Request flow.** Nothing is written to a database or log; the backend keeps only counts. The model sees only the passages the retriever returned. Titles and URLs shown to the patient come from our own source records, looked up by ID, never from model output (dashed line).

**The verifier.** This is the code that enforces “no source, no answer”. A quote can be real and still not support a claim, so clinician review of the test set covers what this check cannot.

### Design rules

- Retrieve first. The model never answers from memory.
- Own source IDs and exact quotes. Built-in API citations cannot be combined with a JSON schema.
- The disclaimer is added by code. The model never says “safe” and never advises a dose change.
- Medicine and source text is treated as untrusted data.
- No logging or storage of lists. Counts only.

### Not decided yet

- Language, framework and hosting
- Drug data source and licence
- Test set storage that keeps real patient data out
- Rate limiting and abuse protection for a public endpoint

| Situation | What happens |
| --- | --- |
| Drug data source unavailable | Error message. The model is not called without passages. |
| Nothing retrieved for a medicine | Listed under “unable to answer”. The model is not called for it. |
| Model call fails or output does not match the schema | Error message. No partial output is shown. |
| Every finding fails verification | Only “unable to answer” items and the disclaimer are shown. |
| Model declines to answer | Treated as “unable to answer” with the standard message. |
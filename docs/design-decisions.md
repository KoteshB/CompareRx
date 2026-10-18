# Design decisions

A log of decisions made so far, with the reason for each, so they are not re-argued later. Newest decisions go at the bottom. To change a decision, add a new entry that supersedes the old one rather than editing history.

Related: [prd.md](prd.md), [roadmap.md](roadmap.md), [architecture.md](architecture.md), [poc-system-prompt.md](poc-system-prompt.md).

| # | Decision | Status |
|---|---|---|
| D1 | Use an Anthropic model for the PoC | Accepted |
| D2 | Retrieve sources first; the model sees only retrieved passages | Accepted |
| D3 | Own source IDs and exact quotes, not the API's built-in citations | Accepted |
| D4 | Verify model output in code before showing it | Accepted |
| D5 | The application adds the disclaimer, not the model | Accepted |
| D6 | The model does not rate severity or declare anything "safe" | Accepted |
| D7 | Structured JSON output through the schema parameter | Accepted |
| D8 | No logging or storage of medicine lists | Accepted (product promise) |
| D9 | Treat medicine and source text as untrusted data | Accepted |
| D10 | Names read from photos need patient confirmation; images are never stored | Proposed (for Versions 2 and 3) |
| D11 | Saving medicines per user in a later phase, opt-in only | Proposed (not scheduled) |

---

## D1: Use an Anthropic model for the PoC

- **Decision:** Call the Anthropic API with `claude-opus-5-5`, and make a source reference a hard requirement of every answer.
- **Why:** The product's bar is "no source, no answer". We want a model that follows strict grounding and refusal instructions, and a single provider keeps the PoC simple.
- **Consequences:**
  - Set `output_config.effort` explicitly. This model defaults to `medium`. Start at `high` and compare against `medium` on the test set.
  - Forced tool calls (`tool_choice` of `any` or `tool`) and assistant prefill are rejected by this model. Use the schema parameter and the prompt instead.
  - Check Anthropic's data retention terms for our account before real patient data is used. This is an open question. `[NEEDS INPUT]`
  - The model choice can be revisited after the PoC by comparing cost and quality on the test set.

## D2: Retrieve sources first; the model sees only retrieved passages

- **Decision:** Our code looks up the medicines in the trusted data source and sends the model the retrieved passages, each with an ID. The model is told to use nothing else.
- **Why:** If the model answers from memory, we can't prove where a claim came from. Giving it only retrieved text makes every claim traceable and makes "I am unable to find the answer" a natural outcome when retrieval finds nothing.
- **Consequences:** Answer quality depends on retrieval quality (brand-to-ingredient matching, coverage of Indian medicines). A missed passage means a missed finding, never an invented one. Retrieval coverage is therefore a key PoC metric.

## D3: Own source IDs and exact quotes, not the API's built-in citations

- **Decision:** Each passage gets an ID (`S1`, `S2`, ...). The model cites an ID plus a short quote copied exactly from that passage.
- **Why:** The API's built-in citations feature can't be combined with a JSON schema for the output (the request fails with a 400 error). We need both a structured answer and verifiable sources. Exact quotes also let our code check every claim mechanically.
- **Alternatives considered:**
  - Built-in citations without a schema: rejected, because parsing free text for the results page is fragile.
  - Schema without quotes (IDs only): rejected, because an ID alone doesn't prove the passage supports the claim.
- **Consequences:** The prompt and schema carry the citation format. Do not switch to built-in citations without also giving up the schema.

## D4: Verify model output in code before showing it

- **Decision:** After the model responds, code checks that every cited ID exists, every quote appears word for word in that source, and every finding keeps at least one valid citation. Anything that fails is dropped and moved to "unable to answer". Titles and URLs shown to the user come from our own source records, never from the model.
- **Why:** A prompt asks the model to behave; it can't guarantee it. The "no hallucinated answers" requirement needs a check that does not depend on the model's honesty.
- **Consequences:** The PoC needs a test where a fabricated quote is injected and shown to be dropped. See the test cases in [poc-system-prompt.md](poc-system-prompt.md).
- **Known limit:** A quote can be real and still not support the claim. This check proves the quote exists, not that the reasoning is right. Clinician review of the test set (roadmap V1.7) covers this gap.

## D5: The application adds the disclaimer, not the model

- **Decision:** The disclaimer text is fixed in code and appended to every result.
- **Why:** The disclaimer is a legal and product promise. It must appear every time and with the same wording, which a model can't guarantee.

## D6: The model does not rate severity or declare anything "safe"

- **Decision:** The model includes a severity word only if a source passage uses it, and it never says medicines are safe. If nothing is found, the app shows a neutral message such as "No issues were found in the sources we checked".
- **Why:** Not finding a problem in our sources does not prove there isn't one, and false reassurance is the worst failure for this product. Severity ratings need clinical definitions we don't have yet (PRD open question 8).

## D7: Structured JSON output through the schema parameter

- **Decision:** The model returns one JSON object matching the schema in [poc-system-prompt.md](poc-system-prompt.md), set through `output_config.format`.
- **Why:** The results page and the verification step both need predictable fields. The schema separates `findings` from `unable_to_answer`, so a refusal is a normal, displayable result instead of an error.

## D8: No logging or storage of medicine lists

- **Scope:** Applies to the PoC and every version up to the later saved-list phase. D11 describes the planned exception.
- **Decision:** Medicine lists, model responses and source matches are never written to a database, log or analytics event. Logs may hold counts only (for example "3 findings, 1 dropped"), never medicine names.
- **Why:** This is a promise in the product's own UI copy and the PRD.
- **Consequences:** Debugging has to rely on a synthetic test set rather than real traffic. Third-party providers must not retain request data. `[NEEDS INPUT]`

## D9: Treat medicine and source text as untrusted data

- **Decision:** The prompt tells the model that anything inside the medicine and source sections is data, not instructions.
- **Why:** User-typed names and retrieved web or database text could contain instructions. A test case covers this ("ignore previous instructions" inside a source).
- **Consequences:** The code check in D4 is the backstop if the model is fooled, because injected text can't create a valid quote from a source.

## D10: Names read from photos need patient confirmation; images are never stored

- **Status:** Proposed. It applies from Version 2 (strip photos) and Version 3 (handwritten prescriptions) in [roadmap.md](roadmap.md).
- **Decision:**
  - Only text visible in the image can become a medicine name. Unclear text is reported as unreadable, never completed from the model's own knowledge.
  - The patient confirms or edits every extracted medicine before it joins the list. Nothing is evaluated straight from a photo.
  - Handwritten lines show a confidence level, and ambiguous words offer candidates from the drug data for the patient to pick.
  - Images are processed in memory and discarded. They are not saved, logged or used for training, and metadata is stripped on upload.
- **Why:** A wrongly read name feeds the wrong medicine into a safety check, which is the same failure as a hallucinated answer, just earlier in the flow. Confirmation by the patient and honest "can't read this" results keep the "no guessing" rule intact. Images are more sensitive than typed names, so the no-storage promise (D8) applies to them too.
- **Open:** Whether images may go to the same LLM provider, and how to build a consented, anonymised test set without breaking the no-storage promise. `[NEEDS INPUT]`

## D11: Saving medicines per user in a later phase, opt-in only

- **Status:** Proposed. Not scheduled in a version; see the "Later phase" section of [roadmap.md](roadmap.md).
- **Decision:** A later phase will let users save their medicines. The no-storage rule (D8) stays in force for everyone who does not opt in, and until this phase ships.
- **Why:** Patients with long-term conditions need to keep their list current, and retyping it is a barrier for elderly users.
- **Proposed limits** `[ASSUMPTION]`:
  - Opt-in only, with clear consent wording.
  - Store only medicine names and strengths. Never store results, model output, photos or prescriptions.
  - Users can see, export and delete their data.
  - No medicine data in logs or analytics, even for signed-in users.
- **Consequences:** The UI promise "not saved on the servers" and the "No data stored" wording in CLAUDE.md, the PRD and the README must be updated before this ships. Needs a privacy and legal review first. `[NEEDS INPUT]`

# CompareRx Roadmap

Companion to [prd.md](prd.md). The PRD says what and why; this file says in what order. See also [architecture.md](architecture.md), [design-decisions.md](design-decisions.md), [poc-system-prompt.md](poc-system-prompt.md) and [evals.md](evals.md) (what to test for each increment below).

Every increment keeps the non-negotiables from the PRD:
- **No source, no answer:** any claim without a retrievable source is replaced by "I am unable to find the answer".
- **No data stored:** medicine lists are never saved or logged.
- **Disclaimer:** results always direct users to a doctor or pharmacist.

Scope and exit criteria below are drafts. `[ASSUMPTION]`

## Summary

| Increment | Purpose | Main PRD stories covered |
|---|---|---|
| PoC | Prove we can give sourced answers, or an honest "unable to find", for a small medicine set | Source link per risk, no source / no answer |
| Version 1 | Usable by real patients in India, safe and private | All must-haves |
| Version 2 | Add medicines by photographing the medicine strip (agent-based extraction) | New; PRD nice-to-have "photograph" story, strips only |
| Version 3 | Add medicines by uploading a handwritten prescription (agent-based extraction) | New; PRD nice-to-have "photograph a prescription" story |
| Version 4 | Better matching, more context, easier for elderly users and caregivers | Should-haves |
| Version 5 | Reach and convenience | Nice-to-haves |
| Later phase (not scheduled) | Save medicines per user | Changes the "no data stored" promise |

## PoC: Prove the sourcing approach

**Question to answer:** Can we reliably return a sourced interaction or duplicate result, and reliably refuse when no source exists?

**Increments**
1. **P1: Data source spike.** Pick 1-2 candidate trusted sources, confirm licensing and retrievability, and load a small set (about 30 common Indian medicines).
2. **P2: Duplicate ingredient check.** Map brand names to active ingredients for the small set and flag duplicates. No LLM needed yet.
3. **P3: Sourced interaction lookup.** For a medicine pair, retrieve the matching source passage and its link.
4. **P4: Grounded explanation.** Use the LLM to explain only what the retrieved passage says, in plain language, with the link attached.
5. **P5: Refusal path.** Return "I am unable to find the answer" when retrieval finds nothing. Add an automated check that rejects any explanation not traceable to a retrieved passage.
6. **P6: Bare-bones UI.** Use the existing mockup layout: medicine list, "Evaluate medicines" button and a results view.

**Out of scope:** strength handling, patient context fields, polish, accessibility work, hosting at scale.

**Exit criteria**
- Zero unsourced claims across a test set of at least 50 queries, including deliberately unanswerable ones.
- 100% of unanswerable queries return "I am unable to find the answer".
- Licensing of the chosen sources is confirmed.
- Confirmed with the LLM provider: no data retention.

## Version 1: Safe and usable launch

**Goal:** Real patients can check a medicine list and trust the result, with privacy and the disclaimer built in.

**Increments**
1. **V1.1: Full list editor.** Name plus optional strength, add and remove rows, input validation.
2. **V1.2: Wider medicine coverage.** Expand the Indian brand-to-ingredient mapping, with a documented coverage rate.
3. **V1.3: Duplicate and interaction results.** Plain-language explanation with source link for each flagged risk, and a clear "unable to find" state per item.
4. **V1.4: Disclaimer and "Before evaluating" notice.** Visible on every results page.
5. **V1.5: Privacy enforcement.** No storage, no logging of lists, no list contents in analytics. Verified by an audit of logs and storage.
6. **V1.6: Error handling.** If data sources are down, show an error and no AI-generated claims.
7. **V1.7: Clinical review.** A clinician reviews the 200-list test set and the wording of results.
8. **V1.8: Legal review and limited release.** Sign-off on disclaimers, then a small pilot group.

**Exit criteria**
- At least 95% recall on the clinician-reviewed duplicate and interaction test set.
- No confirmed unsourced or hallucinated claims in the pilot.
- Privacy audit passed.
- Legal and clinical sign-off.

## Version 2: Add medicines from a photo of the medicine strip

**Goal:** A patient photographs a medicine strip (or box) and the tool reads the medicine name and strength, so they don't have to type. This is especially useful for elderly users.

**Approach:** An agent-based workflow. The agent gets a photo, decides whether it is readable, reads the text, looks the name up in the trusted drug data, and asks the patient to confirm. Whether this needs a true agent (it chooses its own steps) or a fixed workflow (steps are set in advance) is a design decision for the first increment. Start with the simplest design that meets the exit criteria. `[ASSUMPTION]`

**Rules that carry over from the PoC**
- **Read, don't guess:** Only text actually visible in the photo can become a medicine name. Anything unclear is reported as "I can't read this", never filled in from the agent's own knowledge of what the strip "probably" is.
- **The patient confirms:** Extracted names are shown for the patient to confirm or correct before any evaluation runs. Nothing is evaluated automatically from a photo.
- **No images stored:** The photo is processed in memory and discarded. It is never saved, logged or used for training. Photo metadata (for example location) is removed on upload.

**Increments**
1. **V2.1: Upload and image check.** Upload from camera or gallery, with checks for blur, glare and cut-off text, and a clear "please retake" message.
2. **V2.2: Text extraction from a strip.** Read the brand name, strength and, where printed, the active ingredient. Return the exact text read, with a confidence level for each field.
3. **V2.3: Match to the drug data.** Match the extracted name to the trusted data source and return candidates. Unmatched names go to "unable to identify".
4. **V2.4: Confirm and edit screen.** The patient sees what was read next to the photo, then confirms, edits or removes each medicine. Confirmed medicines join the normal medicine list.
5. **V2.5: Multiple strips and boxes.** Several medicines in one photo, or several photos in one session.
6. **V2.6: Agent workflow.** Chain steps V2.1-V2.4 with retry ("try a closer photo") and escalation ("type it instead"). Cap the number of steps and the time per photo.
7. **V2.7: Test set and review.** Build a test set of real Indian strips (varied lighting, languages and print quality) with the consent and privacy rules below.

**Out of scope for Version 2:** handwritten text, expiry or batch checks, counterfeit detection, reading dosage schedules.

**Exit criteria** (targets are drafts) `[NEEDS INPUT]`
- At least 95% of names the patient confirms match the strip, and no medicine is added without the patient's confirmation.
- For unreadable photos, the tool says it can't read them rather than guessing (100% on a set of deliberately unreadable test photos).
- No image is stored or logged, shown by a storage and log audit.
- At least 70% of elderly test users add a medicine from a photo without help.

## Version 3: Add medicines from a handwritten prescription

**Goal:** A patient uploads a photo of a handwritten prescription and the tool pulls out the medicines, so the full list from several doctors can be checked together.

**Approach:** A second agent-based workflow, built on the Version 2 pipeline. Handwriting is much harder to read than printed strip text, so this version is stricter about uncertainty. `[ASSUMPTION]`

**Rules that carry over, and added ones**
- Same as Version 2: read don't guess, the patient confirms, no images stored.
- **Show uncertainty per line:** Each extracted line has a confidence level. Low-confidence lines are highlighted for the patient to check and are never silently resolved.
- **Offer candidates, never decide:** When a handwritten word could be several medicines, show the options from the drug data and let the patient choose, or skip it.
- **Instructions are shown, not used:** Dose and frequency text (for example "BD", "1-0-1") is shown back to the patient for confirmation, but the evaluation uses only medicine names and strength until dose handling is clinically reviewed. `[ASSUMPTION]`

**Increments**
1. **V3.1: Prescription upload.** Camera or gallery, multi-page support, image quality checks and straightening of tilted photos.
2. **V3.2: Layout reading.** Separate the medicine lines from doctor details, patient details, clinic stamps and notes.
3. **V3.3: Handwriting extraction.** Read each medicine line, including common prescription shorthand (for example "Tab", "Cap", "Syr"), with the exact text read and a confidence level.
4. **V3.4: Match with candidates.** Match to the drug data, return ranked candidates for unclear words, and send unmatched lines to "unable to identify".
5. **V3.5: Review screen.** Prescription image beside the extracted lines. The patient confirms, picks a candidate, edits or removes each line.
6. **V3.6: Agent workflow.** Chain the steps with retries (for example "re-read this line") and a clear handoff to manual entry. Cap steps and time.
7. **V3.7: Test set and clinical review.** A test set of real handwritten prescriptions, reviewed by a pharmacist or clinician.

**Out of scope for Version 3:** dose or frequency analysis, interpreting doctor's notes or diagnoses, printed lab reports.

**Exit criteria** (targets are drafts) `[NEEDS INPUT]`
- On the reviewed test set, at least 90% of medicine lines are either correct or flagged as low confidence, and fewer than 1% are wrong and flagged as confident.
- Unreadable lines are never filled in (100% on deliberately illegible test samples).
- No image is stored or logged.
- Pharmacist or clinician sign-off.

## Version 4: Better matching, context and accessibility

**Goal:** Better relevance for the people who need it most.

**Increments**
1. **V4.1: Questions to ask your doctor.** A short, sourced list generated from the flagged risks.
2. **V4.2: Optional patient context.** Age, medical conditions and formulation fields that refine results, with sources.
3. **V4.3: Smarter name matching.** Spelling tolerance and suggestions as the user types.
4. **V4.4: Elderly-friendly design.** Large text, simple wording, high contrast, tested with elderly users (target 70% unaided completion).
5. **V4.5: Severity levels.** Only if clinical advisors define them and sources support them.
6. **V4.6: Quality monitoring without stored lists.** Aggregate, anonymous counts only.

**Exit criteria**
- Usability target met with elderly users.
- Brand-name match rate improved over V1 on the test set.

## Version 5: Reach and convenience

**Goal:** Make it easier to use and share.

**Increments**
1. **V5.1: Print or share results.** For caregivers to bring to the doctor, generated on the user's device without saving anything on the server.
2. **V5.2: Hindi and other Indian languages.** Priority order to be decided. Includes reading strips and prescriptions in those languages.
3. **V5.3: Supplements, herbal and Ayurvedic products, and food interactions.** Only where trusted sources exist.

## Later phase (not scheduled): Save medicines per user

**Goal:** A patient can keep their medicine list between visits, so they don't retype it and can see changes over time.

**Why it is separate:** Today the product promises that no medicine list is saved. This feature is the first one that breaks that promise on purpose, so it needs its own decision, consent flow and privacy review before any build. See [design-decisions.md](design-decisions.md), D11. The phase has not been placed in a version yet. `[NEEDS INPUT]`

**Questions to settle first**
- Saving is opt-in only, so people who don't sign in keep the no-storage behaviour. `[ASSUMPTION]`
- How do users sign in, and what is the minimum personal data we hold?
- Where is the data stored, how is it protected, and how can a user delete it?
- What do Indian data protection rules require for health data, and who owns that review?
- The "not saved on the servers" wording in the UI must change before launch.

**Increments (draft)**
1. **L.1: Decision and legal review.** Write the privacy design, consent wording and retention rules.
2. **L.2: Sign-in and consent.** Opt-in account creation with a clear explanation of what is saved.
3. **L.3: Saved list.** Store names and strengths only, never results, images or model output.
4. **L.4: Delete and export.** The user can see, export and delete everything we hold.

## Cross-cutting decisions needed before the PoC

These come from the PRD's open questions. `[NEEDS INPUT]`
- Which trusted databases for Indian medicines, and are they licensed for this use?
- What exactly counts as "has a source" (direct quote, specific page, matching entry)?
- LLM provider is decided: Anthropic, `claude-opus-5-5` (see [design-decisions.md](design-decisions.md), D1). Still open: confirm data retention terms for our account.
- Who is the clinical reviewer?
- What does the "no data stored" promise allow for debugging and metrics?

Needed before Version 2:
- How do we collect a test set of real strips and handwritten prescriptions with patient consent, with personal details removed and without breaking the "no data stored" promise?
- Do images go to the same LLM provider, and do its retention terms cover images?
- Is a fixed workflow enough, or does the extraction need a true agent that chooses its own steps?

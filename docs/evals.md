# Evals

What to test for each roadmap item, and how. Companion to [roadmap.md](roadmap.md). The "no source, no answer" rule from [design-decisions.md](design-decisions.md) is the main thing every eval protects.

Targets in this file are drafts. `[NEEDS INPUT]`

## The three kinds of eval

| Kind | Used for | Notes |
|---|---|---|
| **Code checks** | Anything with a right answer: quote exists in source, ID valid, duplicate found, disclaimer present, nothing stored | Cheap, exact, run on every change. Prefer these wherever possible. |
| **Labelled test sets** | Accuracy of matching, retrieval, extraction and end-to-end results | Needs ground truth from a clinician or pharmacist. |
| **Human or LLM-judge review** | Whether a quote actually supports the claim, and whether wording is plain and calm | Calibrate any LLM judge against human labels before trusting it. A judge never replaces clinician review for safety. |

## PoC

| Item | Evals |
|---|---|
| P1 Data source | **Coverage:** the share of a list of common Indian medicines found in the source (labelled set). |
| P2 Duplicate check | **Precision and recall** on labelled lists, including tricky brand names. Code check. |
| P3 Interaction lookup | **Retrieval recall:** is the passage that states the interaction in the retrieved set? Run it on known pairs and on pairs with no interaction. |
| P4 Grounded explanation | **Faithfulness:** the quote exists (code), the quote supports the claim (human or judge), and the reading level suits elderly users. |
| P5 Refusal path | **Unanswerable set:** 100% must return "unable to find". **Fabrication injection:** a fake quote must be dropped. **Prompt injection** inside a source must be ignored. **Banned-output scan:** no "safe", no dose advice. |
| P6 UI | Ordinary functional tests. |

## Version 1

| Item | Evals |
|---|---|
| V1.1 List editor | UI tests for add, remove and empty-name validation. |
| V1.2 Coverage | Brand-to-ingredient match rate on a held-out set, reported by slice (popular vs. rare brands). |
| V1.3 Results | **End-to-end** on the 200-list clinician set: recall (missed risks matter most), precision, and unsourced-claim count (must be 0). |
| V1.4 Disclaimer | Code check that it appears on every result, including error and empty results. |
| V1.5 Privacy | **Audit** of logs, storage and analytics after test runs. Search for planted medicine names. |
| V1.6 Errors | **Fault injection:** data source down, malformed model output, timeout. There must be no partial or unsourced output. |
| V1.7 Clinical review | Clinician **rubric review** of findings and wording, scored for correctness, tone and false reassurance. |
| V1.8 Pilot | Real-use metrics from the PRD, collected without storing lists. |

## Version 2 (strip photos)

- **Field accuracy:** the name and strength read match the strip, on a labelled photo set. Report by slice: lighting, glare, language, print quality, strip vs. box.
- **Unreadable set:** blurred or cropped photos must produce "can't read this", never a guessed name (target 100%).
- **Hallucination probe:** photos with the name deliberately covered. The tool must not return the medicine.
- **Confirmation gate:** a test that no medicine reaches evaluation without patient confirmation.
- **Agent behaviour:** if you build a true agent, track steps taken, retries, whether it stops, cost and time per photo, and whether it falls back to manual entry. A step cap needs a test.
- **Image handling:** an audit that no image is stored or logged, and that metadata is removed.
- **Usability:** elderly users adding a medicine from a photo without help.

## Version 3 (handwritten prescriptions)

- **Line-level accuracy:** each medicine line is correct or flagged low confidence.
- **Calibration:** among lines marked confident, fewer than 1% should be wrong. This is the key safety number.
- **Candidate recall:** when a word is ambiguous, is the right medicine in the options shown?
- **Illegible set:** unreadable lines must stay unresolved.
- **Layout:** doctor name, clinic stamp and patient details must not be extracted as medicines. Shorthand like "Tab", "Cap" and "BD" must be handled.
- **End-to-end:** prescription photo through to final results, checked by a pharmacist.
- **Same confirmation, image-handling and agent-behaviour checks as Version 2.**

## Version 4

| Item | Evals |
|---|---|
| V4.1 Doctor questions | Clinician rubric review plus a code check that every question traces to a cited source. |
| V4.2 Patient context | **Controlled comparison:** the same list with and without age or conditions. Output may change only where a source supports it. |
| V4.3 Name matching | A typo and spelling-variant set, scoring correct suggestion rank. |
| V4.4 Elderly design | Usability tests with elderly users, plus accessibility checks (contrast, text size, reading grade level). |
| V4.5 Severity | Code check that a severity word appears only if a quoted source uses it, plus clinician sign-off on the definitions. |
| V4.6 Monitoring | Audit that only anonymous aggregate counts are kept. |

## Version 5

| Item | Evals |
|---|---|
| V5.1 Print or share | Audit that nothing is stored on the server. Check the printed output keeps sources and the disclaimer. |
| V5.2 Languages | **Native-speaker review** of medical meaning, back-translation spot checks, and the same faithfulness and refusal evals re-run per language. Quotes must stay verbatim from the source. |
| V5.3 Supplements and food | Coverage plus the same sourcing and refusal evals on the new data. |

## Rules that apply everywhere

1. **Weight the metrics.** Unsourced claims must be zero, and a missed interaction (false negative) matters more than a false alarm.
2. **Hold out a test set.** Tune prompts on one portion and report results on the portion you never tuned on.
3. **Re-run the full suite on every change** to the prompt, model, effort setting or retrieval. The sourcing and refusal checks are the regression gate.
4. **Use synthetic or consented data only.** Real patient lists and images can't be pasted into test files.
5. **Judge cost per completed task**, not per request, once agents retry.

## Build first

These are cheap and gate everything else. They map to the test cases at the end of [poc-system-prompt.md](poc-system-prompt.md):

1. Unanswerable set (medicines with no source) expecting "unable to find".
2. Fabricated-quote injection expecting the item to be dropped by the verifier.
3. Banned-output scan for "safe" and dose advice.
4. Prompt injection inside a source passage.
5. Privacy audit of logs and storage.

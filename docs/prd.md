# PRD: CompareRx Medicine Interaction and Risk Checker

Delivery plan (PoC, Version 1, Version 2, ...): see [roadmap.md](roadmap.md).

## 1. Problem Statement

In India, no automatic check looks at the full list of medicines a patient has been prescribed. Patients often see several doctors, and each doctor prescribes without knowing what the others have already prescribed. This can lead to double dosing (for example, two brands with the same active ingredient) and to unsafe combinations. Patients, especially elderly ones, are left to spot these problems themselves. They usually don't know what to ask their doctor or pharmacist.

CompareRx lets a patient enter their medicine list and get back:
- possible risks
- plain-language explanations
- questions to ask a healthcare provider
- links to trusted sources

Every statement must be backed by a retrievable source. If the tool can't find a source, it says "I am unable to find the answer" and never guesses.

**Why now:** Elderly patients often take many medicines at once. Brand names in India often hide the active ingredient, so duplicates are easy to miss. `[ASSUMPTION]`

## 2. Goals

All targets below are `[NEEDS INPUT]` because there is no baseline yet.

1. Make 100% of risk statements shown to users carry at least one working source link, from launch onward.
2. Show "I am unable to find the answer" instead of any claim without a source, in 100% of those cases. Test this with a fixed set of unanswerable queries.
3. Correctly flag at least 95% of known duplicate-ingredient cases in a clinician-reviewed test set of 200 medicine lists, within 3 months of launch.
4. Have at least 70% of elderly test users in usability testing complete a medicine check without help, before public launch.
5. Have at least 60% of users who see a flagged risk say they will ask their doctor or pharmacist about it (post-result survey), within 3 months of launch.

## 3. Non-Goals

- It does not diagnose conditions or recommend starting, stopping or changing any medicine or dose.
- It does not replace a doctor or pharmacist, and results never say it does.
- It does not store, save or log medicine lists, and there are no user accounts or history.
- It does not read photos of medicine strips or prescriptions in Version 1. Strip photos come in Version 2 and handwritten prescriptions in Version 3 (see [roadmap.md](roadmap.md)). `[ASSUMPTION]`
- It does not cover supplements, herbal or Ayurvedic products, or food interactions in version 1. `[ASSUMPTION]`
- It does not provide ordering, pricing or pharmacy features.
- It never returns an answer from LLM knowledge alone without a retrievable source.

## 4. Users & Use Cases

**Primary users:** Patients in India, often elderly, who take several medicines. Their caregivers (usually adult children) are a secondary group.

**Scenario 1: Two doctors, one ingredient.** Mrs. Rao, 72, sees a cardiologist and an orthopaedic doctor. Both give her a painkiller under different brand names. Her son enters all her medicines into CompareRx. The tool flags that two of them share the same active ingredient, explains the overdose risk, links to the source, and suggests asking her doctor or pharmacist whether she needs both.

**Scenario 2: New prescription, unsure if safe.** Mr. Iyer, 68, takes metformin and a blood pressure tablet. A new doctor prescribes a third medicine. He enters all three and sees a possible interaction with a source link. He also gets a short list of questions to take back to the doctor.

**Scenario 3: No source found.** A user enters a rare local brand the tool can't match to any trusted database. The tool says "I am unable to find the answer for this medicine" and tells them to ask a pharmacist. It does not guess.

## 5. User Stories

**Must-have**
- As a patient, I want to enter my medicines with their strength so that the check reflects what I actually take.
- As a patient, I want to add and remove medicines from my list so that I can correct mistakes.
- As a patient, I want duplicate active ingredients flagged so that I avoid double dosing.
- As a patient, I want possible interactions explained in simple language so that I understand the risk.
- As a patient, I want a link to a reliable source for each risk so that I can verify it.
- As a patient, I want to be told "I am unable to find the answer" when no source exists so that I'm never misled.
- As a patient, I want a clear reminder to talk to my doctor or pharmacist so that I don't treat the tool as medical advice.
- As a patient, I want to know my medicine list is not saved so that I can use the tool privately.

**Should-have**
- As a patient, I want a list of questions to ask my doctor so that I know what to raise.
- As a patient, I want to be warned that age, conditions and formulation can change the result, with optional fields for them, so that the result is more relevant.
- As a patient, I want Indian brand names matched to their active ingredients so that duplicates are caught.
- As an elderly user, I want large text and simple wording so that I can read it easily.

**Nice-to-have**
- As a caregiver, I want to print or share the results so that I can take them to the doctor.
- As a patient, I want the tool in Hindi and other Indian languages so that I can use my own language.
- As a patient, I want to photograph a prescription so that I don't have to type.

## 6. Acceptance Criteria (must-have stories)

**Enter medicines**
- Given I'm on the medicine list page, when I type a name and optional strength and click "Add another medicine", then a new row is added and my entry is kept.
- Given I have submitted an empty name, when I click "Evaluate medicines", then I see a message asking me to enter a name and nothing is sent.

**Remove medicines**
- Given my list has three medicines, when I remove the second, then it disappears and the other two remain in order.

**Duplicate ingredient detection**
- Given two entries share an active ingredient, when I click "Evaluate medicines", then the results show a duplicate warning that names the ingredient and both medicines.

**Interaction explanation with source**
- Given a known interaction exists in a trusted source, when results load, then each flagged risk shows a plain-language explanation and at least one clickable source link.
- Given a risk is displayed, when I click the source link, then it opens the page the claim came from.

**No source, no answer**
- Given no trusted source can be found for a medicine or pair, when results load, then the tool shows "I am unable to find the answer" for that item and shows no explanation or risk statement for it.
- Given the data sources are unavailable, when I click "Evaluate medicines", then I see an error message and no AI-generated claims.

**Disclaimer**
- Given any results page, then a visible notice says the tool gives general information, is not a substitute for professional advice, and tells me to consult a doctor or pharmacist.

**No data stored**
- Given I submit a list, when the evaluation finishes, then no part of my list is saved in any database, log or analytics event. Verify by checking server logs and storage after a test run.

## 7. Risks & Assumptions

| Risks | Assumptions |
|---|---|
| The LLM may state something not in the sources. We need a check that every claim maps to a retrieved source. | Trusted, retrievable drug databases cover Indian brands well enough. `[ASSUMPTION]` `[NEEDS INPUT]` |
| Indian brand names are inconsistent, so matching to active ingredients may fail or be wrong. | Strength and name are enough for a first check, and the notice about age and conditions is sufficient. `[ASSUMPTION]` |
| Missing a real interaction (a false negative) could give false reassurance. | Users will read the results and follow the advice to see a professional. `[ASSUMPTION]` |
| Liability and regulatory exposure for health guidance in India. | Positioning as "general information" is sufficient legally. `[NEEDS INPUT]` (legal) |
| Source licensing: some drug databases are paid or restrict reuse. | Free or open sources can cover the version 1 scope. `[ASSUMPTION]` |
| "No data stored" conflicts with debugging and quality monitoring. | We can measure quality without keeping user lists. `[ASSUMPTION]` |
| Elderly users may struggle with typing and spelling. | Caregivers will often enter the data for them. `[ASSUMPTION]` |
| Third-party LLM and API providers may retain submitted data. | A provider with no-retention terms is available. `[NEEDS INPUT]` |

## 8. Open Questions

1. Which trusted databases will we use for Indian medicines and interactions, and are they licensed for this use? (Owner: `[NEEDS INPUT]`)
2. What is the exact rule for "has a source"? Does it need a direct quote, a specific page, or just a matching entry? (Owner: PM + clinical advisor)
3. Who clinically reviews the test set and the wording of results? (Owner: `[NEEDS INPUT]`)
4. Which LLM provider will we use, and does it guarantee no data retention? (Owner: Engineering)
5. How do we measure quality and success without storing medicine lists? (Owner: PM + Engineering)
6. Does Indian law require specific disclaimers or registration for a health information tool? (Owner: Legal)
7. Which languages are needed at launch? (Owner: PM)
8. Should the tool show severity levels, and who defines them? (Owner: clinical advisor)

## 9. Success Metrics

**Leading indicators (early signals)**
- Percentage of risk statements with a working source link (target 100%).
- Percentage of unanswerable test queries that return "I am unable to find the answer" (target 100%).
- Match rate of Indian brand names to active ingredients in the test set.
- Task completion rate for elderly users in usability testing.
- Page-load and evaluation time (target under 10 seconds). `[ASSUMPTION]`

**Lagging indicators (final outcomes)**
- Recall on the clinician-reviewed test set of duplicate and interaction cases (target 95% or higher).
- Percentage of users who say they will ask their doctor or pharmacist (target 60%).
- Number of confirmed hallucinated or unsourced claims reported (target 0).
- Repeat use and referral by caregivers, measured through anonymous aggregate counts only. `[ASSUMPTION]`

---

Review the [ASSUMPTION] and [NEEDS INPUT] sections before sharing with engineering.

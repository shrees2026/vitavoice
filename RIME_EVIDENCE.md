# Rime Evidence — VitaVoice

## 1. Claim

> Rime's Mist v2 model mispronounces uncommon medical drug names by default, but a phonetic pronunciation override makes it pronounce them correctly and consistently.

VitaVoice evaluates this claim by comparing the same medical term in plain-text and phonetic-override forms and listening to the resulting audio.

## 2. What Is Being Tested

The test is specifically about pronunciation behavior in Rime's text-to-speech output.

It is not a test of:

- Medical correctness
- Diagnosis
- Clinical interpretation
- Medical summarization
- Treatment recommendations

The output being evaluated is the spoken pronunciation of the supplied text.

## 3. Rime Configuration

The repository's backend uses the following configuration:

| Setting | Value |
|---|---|
| Model | `mistv2` |
| Speaker | `peak` |
| Language | `en` |
| TTS endpoint | `https://users.rime.ai/v1/rime-tts` |
| Coverage endpoint | `https://users.rime.ai/v1/coverage` |
| Audio format | `audio/mpeg` |
| Pronunciation option | `phonemizeBetweenBrackets` |
| Override notation | Phonetic notation inside `{curly brackets}` |

The backend sends `phonemizeBetweenBrackets` according to the frontend's `usePhonetics` flag.

## 4. Acceptance Test

For each selected medical term:

1. Generate audio from the plain-text representation.
2. Generate audio from the phonetic-override representation.
3. Listen to both versions.
4. Judge each pronunciation as **Correct** or **Incorrect**.
5. Record the result.
6. Compare the plain and override outcomes.

A pronunciation result should only be marked **Correct** or **Incorrect** after an actual listener evaluation. The presence of an audio file alone is not treated as a pronunciation-quality result.

## 5. Repository Test Artifacts

The current repository contains these audio files:

| Medical term | Plain audio | Override audio |
|---|---:|---:|
| Amoxclav | Present | Not present |
| Atorvastatin | Present | Not present |
| HbA1c | Present | Present |
| Levothyroxine | Present | Not present |
| Metoprolol | Present | Not present |
| PRN | Present | Not present |
| QID | Present | Present |

### Interpretation

The repository therefore contains two terms with both sides of a plain-versus-override audio comparison:

- HbA1c
- QID

The remaining listed terms currently have only a plain audio artifact in the repository.

## 6. Frontend Comparison Configuration

The current frontend defines three comparison terms.

### Metoprolol

Plain:

```text
The patient was prescribed Metoprolol.
```

Phonetic override:

```text
The patient was prescribed {m0EtOpr1Ol0Al}.
```

This is the only one of the three current frontend comparison entries that contains an explicit phonetic override string.

### Levothyroxine

Plain:

```text
Continue Levothyroxine as directed.
```

Current correction input:

```text
Continue Levothyroxine as directed.
```

The current frontend therefore does not contain a phonetic override for this entry.

### Atorvastatin

Plain:

```text
Start Atorvastatin 20mg at bedtime.
```

Current correction input:

```text
Start Atorvastatin 20mg at bedtime.
```

The current frontend therefore does not contain a phonetic override for this entry.

## 7. Evidence Status

The repository provides implementation evidence that:

- Plain text can be sent to Rime.
- The backend supports enabling `phonemizeBetweenBrackets`.
- The frontend has a plain-versus-correction comparison flow.
- Phonetic notation is supported by the application's request path.
- Paired plain and override audio artifacts exist for HbA1c and QID.

The repository does **not** contain a recorded human pass/fail judgment for every generated clip.

Therefore, this document does not invent:

- A pronunciation accuracy percentage
- A number of listeners
- A pass rate
- A failure rate
- A claim that a specific clip was definitely judged correct
- A claim that one term was definitely the best stress case

Those values require actual listening evaluation.

## 8. Stress Case Candidates

Two repository-backed paired comparisons are available:

### HbA1c

```text
hba1c_plain.mp3
hba1c_override.mp3
```

### QID

```text
qid_plain.mp3
qid_override.mp3
```

Either can serve as the final stress case after listening to both versions and selecting the pair with the clearest audible difference.

The repository itself does not record which pair was selected as the final stress case.

## 9. Recommended Human Evaluation Record

When the clips are evaluated, record the result in this form:

| Term | Plain result | Override result | Listener |
|---|---|---|---|
| HbA1c | Correct / Incorrect | Correct / Incorrect | Record evaluator |
| QID | Correct / Incorrect | Correct / Incorrect | Record evaluator |

If additional terms are tested, add them using the same format.

No result should be entered without an actual listening judgment.

## 10. Why the Evidence Is Structured This Way

The core claim concerns an audible property: pronunciation.

Source-code inspection can establish that the application sends plain text and can enable Rime phonetic processing. Repository inspection can establish which audio artifacts exist. Neither one can, by itself, establish whether a human listener considered a pronunciation correct.

The evidence therefore separates:

1. **Implementation evidence** — what the code sends to Rime.
2. **Artifact evidence** — which audio files exist.
3. **Human evaluation evidence** — whether listeners judged the resulting pronunciation correct.

Only the third category can supply a pass/fail pronunciation result.

## 11. Reproduction Procedure

### Start the application

```bash
pip install -r requirements.txt
```

Create `.env`:

```text
RIME_API_KEY=your_api_key_here
```

Run:

```bash
python app.py
```

Open:

```text
http://localhost:3000
```

### Run the pronunciation comparison

1. Open the **Hear the difference** section.
2. Select a configured comparison term.
3. Play the plain version.
4. Play the correction version.
5. Record the pronunciation judgment.
6. Repeat for every selected test term.

## 12. Coverage Check

The backend also exposes a Coverage API endpoint:

```text
POST /api/coverage
```

The endpoint forwards the supplied text to:

```text
https://users.rime.ai/v1/coverage
```

This provides a mechanism for checking coverage information before deciding whether a term requires pronunciation handling.

The existence of a Coverage API response should not be treated as a pronunciation-quality judgment.

## 13. Limitations

- The current evidence set contains a limited number of audio artifacts.
- Only HbA1c and QID currently have both plain and override audio files in the repository.
- The current frontend contains a real phonetic override for Metoprolol, but the repository does not contain a corresponding `metoprolol_override.mp3` artifact.
- The current frontend entries for Levothyroxine and Atorvastatin do not contain phonetic override strings.
- The repository does not contain recorded listener pass/fail results.
- Pronunciation evaluation is based on human listening judgment.
- The tested configuration is English with the `peak` speaker and `mistv2` model.
- The evidence does not establish behavior for other speakers, models, languages, or larger medical vocabularies.
- The application is not a medical decision-support system.

## 14. Evidence Conclusion

The VitaVoice repository contains a working implementation path for Rime TTS, a phonetic-override mechanism, a comparison interface, and paired plain/override audio artifacts for HbA1c and QID.

The repository therefore supports demonstrating and evaluating the pronunciation claim.

A quantitative or pass/fail conclusion about pronunciation correctness must come from the actual listening evaluation of the stored clips or newly generated clips. This document deliberately does not manufacture those results.

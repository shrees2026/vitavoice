# VitaVoice

VitaVoice is a web-based text-to-speech application built for the **DataForge × Rime Hackathon Challenge**. It converts medical text into spoken audio using Rime's Mist v2 text-to-speech model, with a specific focus on pronunciation handling for uncommon medical terms.

## Problem

Doctors and medical professionals may need to consume dense medical information such as patient reports, chart notes, laboratory information, and journal excerpts while working under time constraints. Listening can be more convenient than continuously reading from a screen in situations where hands-free access is useful.

A specific voice problem is that uncommon medical terms can be pronounced incorrectly by text-to-speech systems. VitaVoice focuses on this pronunciation problem rather than attempting to interpret the medical content.

## Solution

VitaVoice provides a simple text-to-speech workflow:

1. Medical text is entered into the VitaVoice interface.
2. The text is sent to the Rime Text-to-Speech API.
3. Rime generates MP3 audio using the configured voice.
4. The generated audio is played directly in the browser.
5. The application also provides a comparison interface for testing plain text against phonetic-override input.

VitaVoice does **not** diagnose patients, interpret laboratory results, summarize medical records, or provide clinical recommendations.

## Core Claim

> Rime's Mist v2 model mispronounces uncommon medical drug names by default, but a phonetic pronunciation override makes it pronounce them correctly and consistently.

The project is designed around testing this claim by comparing the same medical term with and without a phonetic pronunciation override.

## Target Users

The primary target users are:

- Doctors
- Medical professionals
- Other healthcare users who need to listen to medical text

## Event

**DataForge × Rime — Rime Hackathon Challenge**

## The Voice Problem

The project focuses on medical words and expressions that may be difficult for a general text-to-speech system to pronounce consistently, including:

- Drug names
- Dosages
- Units
- Laboratory values
- Medical terminology

The repository contains pronunciation-test audio clips for terms including:

- Metoprolol
- Levothyroxine
- Atorvastatin
- Amoxclav
- HbA1c
- PRN
- QID

The existence of an audio clip in the repository is evidence that a clip was generated; it is not, by itself, a human pronunciation-quality judgment.

## How It Works

```text
Medical Text
     |
     v
VitaVoice Web Interface
     |
     v
Flask Backend
     |
     +----------------------+
     |                      |
     v                      v
Rime TTS API          Rime Coverage API
     |
     v
MP3 Audio
     |
     v
Browser Playback
```

For the pronunciation comparison flow:

```text
Same Medical Term
       |
       +--------------------+
       |                    |
       v                    v
 Plain Text          Phonetic Override
       |                    |
       v                    v
    Rime Mist v2        Rime Mist v2
       |                    |
       v                    v
 Plain Audio          Corrected Audio
       |                    |
       +---------+----------+
                 |
                 v
          Human Comparison
```

## Current Application Flow

### Standard listening flow

1. The user enters medical text in the report text area.
2. The frontend sends a `POST` request to `/api/speak`.
3. The Flask backend forwards the text to Rime.
4. Rime returns MP3 audio.
5. The browser creates an audio object from the returned data and plays it.

### Pronunciation comparison flow

The frontend contains a comparison section with selectable terms and separate controls for:

- **Play plain**
- **Play with correction**

The frontend sends the selected text together with a `usePhonetics` flag. The backend maps this flag to Rime's `phonemizeBetweenBrackets` option.

## Architecture

### Backend

The backend is implemented in **Python with Flask**.

`app.py`:

- Serves the frontend.
- Exposes `/api/speak`.
- Exposes `/api/coverage`.
- Reads `RIME_API_KEY` from environment variables.
- Sends requests to the Rime TTS and Coverage APIs.
- Returns generated MP3 audio to the frontend.
- Returns JSON error responses when requests fail.

### Frontend

The frontend is implemented with:

- HTML
- CSS
- JavaScript

The frontend provides:

- Medical-text input
- Listen control
- Audio playback
- Loading/status feedback
- Plain-versus-correction comparison
- Selectable comparison terms
- Separate playback controls for each version

## Rime Configuration

The application code currently uses:

| Setting | Value |
|---|---|
| Model | `mistv2` |
| Speaker | `peak` |
| Language | `en` |
| TTS endpoint | `https://users.rime.ai/v1/rime-tts` |
| Coverage endpoint | `https://users.rime.ai/v1/coverage` |
| Audio format | `audio/mpeg` |
| Pronunciation control | `phonemizeBetweenBrackets` |
| Phonetic input format | Rime phonetic notation inside `{curly brackets}` |

The backend sets `phonemizeBetweenBrackets` according to the frontend's `usePhonetics` value.

## Technology Stack

| Component | Technology |
|---|---|
| Backend | Python |
| Web framework | Flask |
| CORS | Flask-CORS |
| HTTP client | Requests |
| Environment configuration | python-dotenv |
| Frontend | HTML, CSS, JavaScript |
| Text-to-speech | Rime TTS |
| TTS model | Mist v2 |
| Audio | MP3 |

The current implementation does not contain a separate document parser or medical-language processing module. The main input is text entered into the web interface.

## Repository Structure

```text
vitavoice/
├── app.py
├── requirements.txt
├── .env.example
├── .gitignore
├── public/
│   ├── index.html
│   ├── script.js
│   └── style.css
└── clips/
    ├── amoxclav_plain.mp3
    ├── atorvastatin_plain.mp3
    ├── hba1c_override.mp3
    ├── hba1c_plain.mp3
    ├── levothyroxine_plain.mp3
    ├── metoprolol_plain.mp3
    ├── prn_plain.mp3
    ├── qid_override.mp3
    └── qid_plain.mp3
```

## Setup

### Prerequisites

- Python
- pip
- A valid Rime API key

### 1. Clone the repository

```bash
git clone https://github.com/shrees2026/vitavoice.git
cd vitavoice
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure the Rime API key

Create a `.env` file in the project root:

```text
RIME_API_KEY=your_api_key_here
```

The repository provides `.env.example` as the placeholder template.

Do not commit a real API key.

### 4. Start the application

```bash
python app.py
```

The Flask application runs on port `3000`.

### 5. Open VitaVoice

Open:

```text
http://localhost:3000
```

## API Endpoints

### `POST /api/speak`

Generates speech from submitted text.

Request body:

```json
{
  "text": "The patient was prescribed Metoprolol.",
  "usePhonetics": false
}
```

For a phonetic-override request, `usePhonetics` is set to `true`.

The backend sends the request to Rime with:

- `speaker: peak`
- `modelId: mistv2`
- `language: en`
- `phonemizeBetweenBrackets` based on `usePhonetics`

A successful response contains MP3 audio.

### `POST /api/coverage`

Checks text using the Rime Coverage API.

Request body:

```json
{
  "text": "medical term"
}
```

The backend forwards the text to the configured Rime Coverage endpoint and returns the resulting JSON response.

## Failure Behavior

The application has explicit handling for the main request failure paths.

### Empty speech input

If `/api/speak` receives no text, the backend returns:

```text
400
```

with:

```json
{
  "error": "No text provided"
}
```

### Rime API failure

If the Rime TTS request returns a non-success response, the backend returns a JSON error containing:

```text
Rime API request failed
```

and preserves the status code returned by Rime.

### Server-side speech-generation exception

If an exception occurs while generating speech, the backend returns:

```text
500
```

with:

```json
{
  "error": "Something went wrong generating audio"
}
```

### Frontend connection failure

If the browser cannot reach the backend, the frontend reports that it could not reach the server and asks whether `app.py` is running at `http://localhost:3000`.

### Audio playback failure

If the returned audio cannot be played by the browser, the frontend reports:

```text
Couldn't play the audio.
```

### Coverage failure

If the Coverage API request raises an exception, the backend returns:

```text
500
```

with:

```json
{
  "error": "Coverage check failed"
}
```

## Pronunciation Comparison

The repository's frontend comparison configuration currently contains three displayed terms:

| Term | Plain input | Phonetic/correction input currently in frontend |
|---|---|---|
| Metoprolol | `The patient was prescribed Metoprolol.` | `The patient was prescribed {m0EtOpr1Ol0Al}.` |
| Levothyroxine | `Continue Levothyroxine as directed.` | Same text; no phonetic override is currently present |
| Atorvastatin | `Start Atorvastatin 20mg at bedtime.` | Same text; no phonetic override is currently present |

Therefore, the current repository does **not** support claiming that all three displayed comparison terms have completed phonetic corrections.

## Repository Evidence

The repository currently contains the following generated pronunciation clips:

| Term | Plain clip | Override clip |
|---|---:|---:|
| Amoxclav | Present | Not present |
| Atorvastatin | Present | Not present |
| HbA1c | Present | Present |
| Levothyroxine | Present | Not present |
| Metoprolol | Present | Not present |
| PRN | Present | Not present |
| QID | Present | Present |

These files establish which audio artifacts are present in the repository. They do not independently establish whether a listener judged each pronunciation correct or incorrect.

The detailed evidence record is maintained in `RIME_EVIDENCE.md`.

## Acceptance Test

The intended acceptance test is:

1. Select a medical term.
2. Generate audio using the plain-text representation.
3. Generate audio using the phonetic-override representation.
4. Have a listener judge each pronunciation as **correct** or **incorrect**.
5. Record the judgment for each version.
6. Compare the plain and override pass/fail results.

The acceptance test is specifically intended to evaluate the pronunciation claim rather than the general quality of the application.

## Current Evidence Boundary

The repository contains paired audio artifacts for **HbA1c** and **QID**, but the repository contents available for this documentation do not contain a recorded human pass/fail judgment for those clips.

Accordingly, this README does not invent a pronunciation score, accuracy percentage, listener count, or pass/fail result.

The claim should be presented as a tested project hypothesis supported by the generated artifacts, with the final human pronunciation judgments recorded separately when performed.

## Stress Case

The strongest repository-supported candidates for a before/after stress case are:

- **HbA1c**, because both plain and override clips are present.
- **QID**, because both plain and override clips are present.

The repository does not contain a written human evaluation identifying one of these as the objectively best stress case. The final stress case should therefore be selected by listening to the available paired clips and choosing the clearest audible difference.

No unsupported pronunciation result is stated here.

## Privacy and Safety

Medical information may contain sensitive patient information.

For demonstrations and testing:

- Use synthetic or de-identified medical content.
- Do not place real patient information in the repository.
- Do not expose real patient information in screenshots or recordings.
- Do not expose API credentials in the repository or demonstration.

VitaVoice is a text-to-speech application. It does not provide diagnosis, medical interpretation, or clinical recommendations.

## Reproducibility

The repository contains the application source, configuration template, frontend, dependencies, and generated audio artifacts required to reproduce the application's main text-to-speech flow.

For pronunciation evaluation, the repository also contains selected plain and override audio clips. A complete human-evaluated acceptance record requires the corresponding listener judgments to be recorded in `RIME_EVIDENCE.md`.

## Demo

A strong demonstration flow is:

1. Introduce the problem of consuming dense medical text by reading from a screen.
2. Show VitaVoice's report text input.
3. Enter medical text.
4. Generate and play the audio.
5. Open the pronunciation comparison section.
6. Select a term with paired plain and override clips available for evaluation.
7. Play the plain version.
8. Play the corrected version.
9. Explain the Rime configuration: Mist v2, speaker `peak`, English.
10. State the evaluation boundary clearly: pronunciation quality requires human listening judgment.

The demonstration should show behavior that exists in the repository.

## Limitations

- The current application is English-only through its configured Rime language setting.
- The application uses the `peak` speaker and `mistv2` model configuration documented above.
- The current frontend comparison list does not contain completed phonetic overrides for every displayed term.
- The repository contains a limited set of pronunciation-test audio artifacts.
- Human pronunciation judgments are not stored in the repository's current evidence files.
- The application does not perform medical interpretation or clinical decision support.
- The frontend currently expects the backend at `http://localhost:3000`.
- A valid Rime API key is required to generate new audio.

## Credits

**Project:** VitaVoice  
**Event:** DataForge × Rime — Rime Hackathon Challenge

// ---------------------------------------------------------
// VitaVoice — frontend logic
// ---------------------------------------------------------

// Change this if the backend runs on a different host/port.
const API_BASE = "http://localhost:3000";

// ---------------------------------------------------------
// Comparison terms
// Ask the backend coder for the real phonetic override strings
// and paste them in here (replace the "phonetic" values below).
// Format must match what the backend expects, e.g.
//   "The patient was prescribed {m0EtOpr1Ol0Al}."
// ---------------------------------------------------------
const COMPARISON_TERMS = [
  {
    id: "metoprolol",
    label: "Metoprolol",
    plain: "The patient was prescribed Metoprolol.",
    phonetic: "The patient was prescribed {m0EtOpr1Ol0Al}.",
  },
  {
    id: "levothyroxine",
    label: "Levothyroxine",
    plain: "Continue Levothyroxine as directed.",
    phonetic: "Continue Levothyroxine as directed.", // TODO: replace with real override
  },
  {
    id: "atorvastatin",
    label: "Atorvastatin",
    plain: "Start Atorvastatin 20mg at bedtime.",
    phonetic: "Start Atorvastatin 20mg at bedtime.", // TODO: replace with real override
  },
];

// ---------------------------------------------------------
// Element references
// ---------------------------------------------------------
const reportText = document.getElementById("report-text");
const listenBtn = document.getElementById("listen-btn");
const listenStatus = document.getElementById("listen-status");

const termSelect = document.getElementById("term-select");
const plainTextEl = document.getElementById("plain-text");
const phoneticTextEl = document.getElementById("phonetic-text");
const playPlainBtn = document.getElementById("play-plain-btn");
const playPhoneticBtn = document.getElementById("play-phonetic-btn");
const plainWaveform = document.getElementById("plain-waveform");
const phoneticWaveform = document.getElementById("phonetic-waveform");
const compareStatus = document.getElementById("compare-status");

let currentAudio = null;

// ---------------------------------------------------------
// Core: call the backend and play back the returned audio
// ---------------------------------------------------------
async function speak(text, usePhonetics, { button, waveform, statusEl } = {}) {
  if (!text || !text.trim()) {
    setStatus(statusEl, "Enter some text first.", true);
    return;
  }

  // Stop anything currently playing so audio doesn't overlap.
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }

  setLoading(button, true);
  setStatus(statusEl, "Generating audio…", false);
  if (waveform) waveform.classList.remove("is-active");

  try {
    const response = await fetch(`${API_BASE}/api/speak`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, usePhonetics }),
    });

    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}`);
    }

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    currentAudio = audio;

    audio.addEventListener("play", () => {
      if (waveform) waveform.classList.add("is-active");
      setStatus(statusEl, "Playing…", false);
    });

    audio.addEventListener("ended", () => {
      if (waveform) waveform.classList.remove("is-active");
      setStatus(statusEl, "", false);
      URL.revokeObjectURL(audioUrl);
    });

    audio.addEventListener("error", () => {
      if (waveform) waveform.classList.remove("is-active");
      setStatus(statusEl, "Couldn't play the audio.", true);
    });

    await audio.play();
  } catch (err) {
    console.error("VitaVoice speak() failed:", err);
    setStatus(
      statusEl,
      "Couldn't reach the server. Is app.py running at " + API_BASE + "?",
      true
    );
  } finally {
    setLoading(button, false);
  }
}

function setLoading(button, isLoading) {
  if (!button) return;
  button.disabled = isLoading;
  const spinner = button.querySelector(".btn__spinner");
  if (spinner) spinner.hidden = !isLoading;
}

function setStatus(el, message, isError) {
  if (!el) return;
  el.textContent = message;
  el.classList.toggle("status--error", Boolean(isError));
}

// ---------------------------------------------------------
// Basic flow: paste a report, hit Listen
// ---------------------------------------------------------
listenBtn.addEventListener("click", () => {
  speak(reportText.value, false, {
    button: listenBtn,
    statusEl: listenStatus,
  });
});

// ---------------------------------------------------------
// Comparison view
// ---------------------------------------------------------
function populateTermSelect() {
  termSelect.innerHTML = "";
  COMPARISON_TERMS.forEach((term) => {
    const option = document.createElement("option");
    option.value = term.id;
    option.textContent = term.label;
    termSelect.appendChild(option);
  });
}

function getSelectedTerm() {
  return (
    COMPARISON_TERMS.find((t) => t.id === termSelect.value) ||
    COMPARISON_TERMS[0]
  );
}

function renderSelectedTerm() {
  const term = getSelectedTerm();
  plainTextEl.textContent = term.plain;
  phoneticTextEl.textContent = term.phonetic;
  compareStatus.textContent = "";
}

termSelect.addEventListener("change", renderSelectedTerm);

playPlainBtn.addEventListener("click", () => {
  const term = getSelectedTerm();
  speak(term.plain, false, {
    button: playPlainBtn,
    waveform: plainWaveform,
    statusEl: compareStatus,
  });
});

playPhoneticBtn.addEventListener("click", () => {
  const term = getSelectedTerm();
  speak(term.phonetic, true, {
    button: playPhoneticBtn,
    waveform: phoneticWaveform,
    statusEl: compareStatus,
  });
});

// ---------------------------------------------------------
// Init
// ---------------------------------------------------------
populateTermSelect();
renderSelectedTerm();
//the end
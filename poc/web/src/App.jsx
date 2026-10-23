import { useState } from "react";

const API_URL = "/api/evaluate";

let nextId = 1;
const newRow = (name = "", dosage = "") => ({ id: nextId++, name, dosage });

const steps = [
  { title: "Enter your medicines", text: "Add medicine names and dosages (or just the names).", icon: "▤" },
  {
    title: "We analyze the risks",
    text: "Your list is securely sent to our backend, which uses trusted sources and an LLM to check for potential interactions, side effects, and safety concerns.",
    icon: "▤",
  },
  { title: "Get clear results", text: "See potential risks, explanations, and suggested next steps, with links to reliable sources.", icon: "♢" },
];

const promises = [
  { icon: "♢", title: "Trusted sources", text: "Uses reputable drug information and interaction databases." },
  { icon: "◉", title: "AI-powered analysis", text: "Combines trusted data with advanced language models." },
  { icon: "♙", title: "No data stored", text: "Your medicine list is not saved on our servers." },
  { icon: "♢", title: "Your safety matters", text: "Better information. Safer decisions." },
];

function errorMessage(status, body) {
  if (status === 422 && Array.isArray(body?.detail)) {
    const first = body.detail[0];
    const field = first?.loc?.[first.loc.length - 1];
    if (first?.type === "too_short" && field === "medicines") return "Add at least one medicine.";
    if (first?.type === "string_too_short" && field === "name") return "Every medicine needs a name.";
    return first?.msg || "The medicine list is not valid.";
  }
  return `Request failed (${status}).`;
}

export default function App() {
  const [rows, setRows] = useState(() => [
    newRow("Metformin", "500 mg"),
    newRow("Lisinopril", "10 mg"),
    newRow("Ibuprofen", "200 mg"),
  ]);
  const [result, setResult] = useState(null); // {kind: "ok" | "error", title, message, data?}
  const [loading, setLoading] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  const update = (id, field, value) =>
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  const remove = (id) => setRows((rs) => rs.filter((r) => r.id !== id));
  const add = () => setRows((rs) => [...rs, newRow()]);

  async function evaluate() {
    setShowErrors(true);
    if (rows.length === 0) {
      setResult({ kind: "error", title: "Add a medicine first", message: "Enter at least one medicine before requesting an evaluation." });
      return;
    }
    if (rows.some((r) => !r.name.trim())) {
      setResult({ kind: "error", title: "Name missing", message: "Every medicine needs a name. Fill in or remove the empty rows." });
      return;
    }
    const medicines = rows.map((r) => {
      const dosage = r.dosage.trim();
      return dosage ? { name: r.name.trim(), dosage } : { name: r.name.trim() };
    });
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ medicines }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) throw new Error(errorMessage(res.status, body));
      setResult({ kind: "ok", title: "Evaluation response received", message: `${body.count} medicine${body.count === 1 ? "" : "s"} received.`, data: body });
    } catch (err) {
      const message = err instanceof TypeError ? "Could not reach the API. Check that the backend is running." : err.message;
      setResult({ kind: "error", title: "Unable to evaluate", message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <header className="topbar">
        <div className="brand">
          <span className="brand-icon">💊</span>
          <span>Meds<span>Check</span></span>
        </div>
        <nav aria-label="Main navigation">
          <a className="active" href="#home">Home</a>
          <a href="#about">About</a>
          <a href="#how-it-works">How It Works</a>
          <a href="#faq">FAQ</a>
        </nav>
        <div className="prototype">Prototype</div>
      </header>

      <section className="hero" id="home">
        <div>
          <h1>Meds<span>Check</span></h1>
          <h2>Check for potential medicine interactions and risks.</h2>
          <p>Enter the medicines you’re taking, and we’ll analyze potential interactions, side effects, and safety concerns using trusted sources and AI.</p>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="art-blob">
            <div className="capsule" />
            <div className="capsule two" />
            <div className="tablet" />
            <div className="shield">✓</div>
          </div>
        </div>
      </section>

      <main className="main">
        <section className="panel" aria-labelledby="medicine-heading">
          <div className="panel-heading">
            <h3 id="medicine-heading">Your medicine list</h3>
            <span className="count">{rows.length} medicine{rows.length === 1 ? "" : "s"}</span>
          </div>
          <p className="subtext">Add each medicine separately. Include the dosage when known.</p>

          <div className="medicine-list">
            {rows.map((r, i) => (
              <div className="medicine" key={r.id}>
                <div className="pill-icon">♧</div>
                <div className="medicine-fields">
                  <div>
                    <label className="field-label" htmlFor={`name-${r.id}`}>Medicine name</label>
                    <input
                      id={`name-${r.id}`}
                      type="text"
                      value={r.name}
                      maxLength={200}
                      placeholder="e.g. Metformin"
                      aria-invalid={showErrors && !r.name.trim()}
                      onChange={(e) => update(r.id, "name", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="field-label" htmlFor={`dosage-${r.id}`}>Dosage (optional)</label>
                    <input
                      id={`dosage-${r.id}`}
                      type="text"
                      value={r.dosage}
                      maxLength={100}
                      placeholder="e.g. 500 mg"
                      onChange={(e) => update(r.id, "dosage", e.target.value)}
                    />
                  </div>
                </div>
                <button className="remove" aria-label={`Remove medicine ${i + 1}${r.name ? `: ${r.name}` : ""}`} onClick={() => remove(r.id)}>×</button>
              </div>
            ))}
          </div>

          <button className="add-row" onClick={add}><span>+</span>Add another medicine</button>

          <div className="notice">
            <div className="info">ⓘ</div>
            <div>
              <strong>Before evaluating</strong>
              Medicine names alone may not be enough. Dosage, formulation, age, relevant medical conditions, and other factors can change the risk assessment.
            </div>
          </div>
          <button className="evaluate" onClick={evaluate} disabled={loading}>
            <span className="magnify">⌕</span>{loading ? "Evaluating…" : "Evaluate medicines"}
            <small>Submit list to risk analysis backend</small>
          </button>
          <p className="caption">Pre-PoC demo. The API only acknowledges your list; no risk evaluation has been performed.</p>

          {(result || loading) && (
            <div id="results" className={result?.kind === "error" ? "error" : ""} style={{ display: "block" }} role="status" aria-live="polite">
              {loading ? (
                <h4>Evaluating medicines…</h4>
              ) : (
                <>
                  <h4>{result.title}</h4>
                  <p>{result.message}</p>
                  {result.data && (
                    <ul>
                      {result.data.medicines.map((m, i) => (
                        <li key={i}>{m.name} {m.dosage && <small>— {m.dosage}</small>}</li>
                      ))}
                    </ul>
                  )}
                </>
              )}
            </div>
          )}
        </section>

        <aside className="panel how-panel" id="how-it-works">
          <h3>How it works</h3>
          {steps.map((s, i) => (
            <div key={s.title}>
              <div className="step">
                <div className="step-number">{i + 1}</div>
                <div className="step-icon">{s.icon}</div>
                <div><strong>{s.title}</strong><p>{s.text}</p></div>
              </div>
              {i < steps.length - 1 && <div className="step-arrow"><span>⌄</span></div>}
            </div>
          ))}
          <div className="important" id="about">
            <div className="important-card">
              <div className="important-icon">!</div>
              <div>
                <strong>Important</strong>
                This tool provides general information and is not a substitute for professional medical advice. Always consult a healthcare provider or pharmacist for personal advice.
              </div>
            </div>
          </div>
        </aside>
      </main>

      <footer id="faq">
        {promises.map((p) => (
          <div className="footer-item" key={p.title}>
            <div className="footer-icon">{p.icon}</div>
            <div><strong>{p.title}</strong><p>{p.text}</p></div>
          </div>
        ))}
      </footer>
    </>
  );
}

import { useEffect, useRef, useState } from "react";
import "./DownCounter.css";

const DEFAULT = 5 * 60; // 00:05:00
const MAX = 99 * 3600 + 59 * 60 + 59;
const UNITS = [
  { key: "h", label: "Hours", step: 3600 },
  { key: "m", label: "Minutes", step: 60 },
  { key: "s", label: "Seconds", step: 1 },
];
const PRESETS = [
  { label: "1 min", secs: 60 },
  { label: "5 min", secs: 5 * 60 },
  { label: "10 min", secs: 10 * 60 },
  { label: "25 min", secs: 25 * 60 },
  { label: "1 hr", secs: 3600 },
];

const pad = (n) => String(n).padStart(2, "0");

export default function DownCounter() {
  const [left, setLeft] = useState(DEFAULT); // bacha hua time (seconds)
  const [total, setTotal] = useState(DEFAULT); // set kiya hua time (progress + reset ke liye)
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const endRef = useRef(0); // target timestamp, taaki interval drift na kare

  // Running ho toh har 250ms par target time se remaining nikalta hai
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      const r = Math.max(0, Math.ceil((endRef.current - Date.now()) / 1000));
      setLeft(r);
      if (r === 0) {
        setRunning(false);
        setFinished(true);
      }
    }, 250);
    return () => clearInterval(id);
  }, [running]);

  const h = Math.floor(left / 3600);
  const m = Math.floor((left % 3600) / 60);
  const s = left % 60;
  const values = { h, m, s };

  const setTime = (secs) => {
    if (running) return;
    const v = Math.min(MAX, Math.max(0, secs));
    setLeft(v);
    setTotal(v);
    setFinished(false);
  };

  const adjust = (step, dir) => setTime(left + dir * step);

  // Box mein direct type karne ke liye: sirf last 2 digits rakhta hai (microwave-style)
  const setUnit = (key, raw) => {
    const digits = raw.replace(/\D/g, "").slice(-2);
    const val = digits === "" ? 0 : parseInt(digits, 10);
    const next = {
      h: key === "h" ? val : h,
      m: Math.min(59, key === "m" ? val : m),
      s: Math.min(59, key === "s" ? val : s),
    };
    setTime(next.h * 3600 + next.m * 60 + next.s);
  };

  const start = () => {
    const from = left === 0 ? total : left; // khatam hone ke baad Start = dobara shuru
    if (from === 0) return;
    setLeft(from);
    endRef.current = Date.now() + from * 1000;
    setFinished(false);
    setRunning(true);
  };
  const pause = () => setRunning(false);
  const reset = () => {
    setRunning(false);
    setFinished(false);
    setLeft(total);
  };

  const pct = total > 0 ? (left / total) * 100 : 0;

  let status = "Time set karo, type karo ya preset chuno, phir Start dabao.";
  if (running) status = "Counting down…";
  else if (finished) status = "Time's up! Reset ya Start dabao dobara chalane ke liye.";
  else if (left < total) status = `Paused at ${pad(h)}:${pad(m)}:${pad(s)}. Start dabao resume ke liye.`;

  const cls = finished ? " is-done" : running && left <= 10 ? " is-low" : "";

  return (
    <div className="counter-layout">
      <div className="time-row" role="timer" aria-live="off">
        {UNITS.map((u, i) => (
          <div className="time-col" key={u.key}>
            <button
              type="button"
              className="step-btn"
              onClick={() => adjust(u.step, 1)}
              disabled={running}
              aria-label={`Increase ${u.label}`}
            >
              ▲
            </button>
            <input
              type="text"
              inputMode="numeric"
              className={"counter-box counter-input" + cls}
              value={pad(values[u.key])}
              readOnly={running}
              onChange={(e) => setUnit(u.key, e.target.value)}
              onFocus={(e) => e.target.select()}
              onKeyDown={(e) => e.key === "Enter" && e.target.blur()}
              aria-label={u.label}
            />
            <button
              type="button"
              className="step-btn"
              onClick={() => adjust(u.step, -1)}
              disabled={running}
              aria-label={`Decrease ${u.label}`}
            >
              ▼
            </button>
            <span className="unit-label">{u.label}</span>
            {i < UNITS.length - 1 && <span className="colon">:</span>}
          </div>
        ))}
      </div>

      <div className="progress" aria-hidden="true">
        <div className={"progress-fill" + cls} style={{ width: `${pct}%` }} />
      </div>

      <p className="status-line">{status}</p>

      <div className="preset-row">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            type="button"
            className="chip"
            onClick={() => setTime(p.secs)}
            disabled={running}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="btn-row">
        <button
          type="button"
          className="btn btn--mint"
          onClick={start}
          disabled={running || (left === 0 && total === 0)}
        >
          Start
        </button>
        <button type="button" className="btn btn--rose" onClick={pause} disabled={!running}>
          Pause
        </button>
        <button type="button" className="btn btn--paper" onClick={reset} disabled={left === total && !finished}>
          Reset
        </button>
      </div>
    </div>
  );
}
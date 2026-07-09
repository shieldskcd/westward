import React from "react";
import { C, serif, mono, LANDMARKS, GOAL, currentLandmarkIdx } from "../game/engine.js";

// Stage art lives in public/stages/ (copied verbatim into dist/stages on build).
// import.meta.env.BASE_URL respects the relative `base`, so these resolve both
// on the dev server and on the deployed subdomain. (Kept out of engine.js so the
// Node test runner never touches import.meta.)
const STAGE_DIR = import.meta.env.BASE_URL + "stages/";
export const stage = (name) => `${STAGE_DIR}${name}.png`;

// A framed scene banner. `name` is the file stem in public/stages (no extension).
export function Scene({ name, alt, height = 190 }) {
  return (
    <div style={{ width: "100%", height, marginBottom: 14, overflow: "hidden",
      border: `2px solid ${C.ink}`, background: C.panel, boxShadow: "3px 3px 0 rgba(44,35,24,.25)" }}>
      <img src={stage(name)} alt={alt} loading="lazy"
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
    </div>
  );
}

export function Stat({ label, value, accent }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "4px 8px", minWidth: 66 }}>
      <span style={{ ...mono, color: accent || C.ink, fontSize: 18, fontWeight: 700 }}>{value}</span>
      <span style={{ ...mono, color: C.inkSoft, fontSize: 10, letterSpacing: 1, textTransform: "uppercase" }}>{label}</span>
    </div>
  );
}

export function Btn({ children, onClick, disabled, tone }) {
  const bg = tone === "danger" ? C.rust : tone === "go" ? C.sage : C.panel;
  const fg = tone ? "#f3ead0" : C.ink;
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        ...serif, fontSize: 15, padding: "8px 16px", borderRadius: 2,
        background: disabled ? C.line : bg, color: disabled ? "#efe4c6" : fg,
        border: `1px solid ${C.ink}`, opacity: disabled ? 0.6 : 1,
        cursor: disabled ? "not-allowed" : "pointer", letterSpacing: 0.4,
        boxShadow: disabled ? "none" : "2px 2px 0 rgba(44,35,24,.25)",
      }}
    >
      {children}
    </button>
  );
}

export function TrailBar({ mile }) {
  const pct = Math.min(100, (mile / GOAL) * 100);
  const idx = currentLandmarkIdx(mile);
  return (
    <div style={{ width: "100%" }}>
      <div style={{ position: "relative", width: "100%", height: 46 }}>
        <div style={{ position: "absolute", top: 20, left: 0, right: 0, height: 6, background: C.line, borderRadius: 3 }} />
        <div style={{ position: "absolute", top: 20, left: 0, width: `${pct}%`, height: 6, background: C.sage, borderRadius: 3, transition: "width .5s ease" }} />
        {LANDMARKS.map((lm, i) => {
          const left = (lm.mile / GOAL) * 100;
          const passed = mile >= lm.mile;
          const major = lm.fort || lm.river || lm.mountain || lm.end;
          return (
            <div key={i} style={{ position: "absolute", left: `${left}%`, top: 14, transform: "translateX(-50%)" }}>
              <div style={{ width: 3, height: 18, background: passed ? C.sage : C.line, opacity: major ? 1 : 0.5 }} />
            </div>
          );
        })}
        <div style={{ position: "absolute", left: `${pct}%`, top: 2, transform: "translateX(-50%)", transition: "left .5s ease", color: C.rust, fontSize: 16 }}>▲</div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", ...mono, fontSize: 10, color: C.inkSoft }}>
        <span>{LANDMARKS[idx].name}</span>
        <span>{mile} / {GOAL} mi</span>
        <span>{idx + 1 < LANDMARKS.length ? `Next: ${LANDMARKS[idx + 1].name}` : "Journey's end"}</span>
      </div>
    </div>
  );
}

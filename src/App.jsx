import React, { useReducer, useEffect } from "react";
import {
  reducer, initState, saveGame, hasSave,
  C, serif, mono, LANDMARKS, currentLandmarkIdx,
} from "./game/engine.js";
import { Stat, Btn, TrailBar, Scene } from "./components/ui.jsx";
import { Outfit, Fort, Hunt, River, Mountain, EndScreen } from "./components/screens.jsx";

// Which scene art to show on the open trail, based on where the party is.
const DUSK_STOPS = new Set(["Independence Rock", "Soda Springs", "The Dalles"]);
function trailScene(idx) {
  const name = LANDMARKS[idx] && LANDMARKS[idx].name;
  if (name === "Chimney Rock") return "03_ChimneyRock";
  if (DUSK_STOPS.has(name)) return "08_CampAtDusk";
  return "02_Primary_Screen";
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, undefined, initState);
  const s = state;

  // save/resume: persist every meaningful change (skips the outfitting screen)
  useEffect(() => {
    if (s.phase !== "outfit" && s.phase !== "end") saveGame(s);
  }, [s]);

  const idx = s.mile != null ? currentLandmarkIdx(s.mile) : 0;
  const atFort = s.phase === "trail" && LANDMARKS[idx].fort && s.mile >= LANDMARKS[idx].mile;
  const canHunt = s.bullets > 39;
  const resumed = s.phase !== "outfit" && s.turn > 0;

  return (
    <div style={{ minHeight: "100vh", width: "100%", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "24px 12px", background: C.frame, boxSizing: "border-box" }}>
      <div style={{ width: "100%", maxWidth: 640, background: C.paper, border: `2px solid ${C.ink}`, boxShadow: "6px 6px 0 rgba(44,35,24,.35)" }}>
        {/* header */}
        <div style={{ padding: "16px 20px 12px", borderBottom: `2px solid ${C.ink}`, background: C.panel }}>
          <h1 style={{ ...serif, fontSize: 26, letterSpacing: 2, color: C.ink, textTransform: "uppercase", margin: 0 }}>Westward</h1>
          <p style={{ ...mono, fontSize: 10, color: C.inkSoft, letterSpacing: 1, margin: "2px 0 0" }}>a wagon journey · 1847 · public-domain mechanics</p>
        </div>

        {/* status + trail */}
        {s.phase !== "outfit" && (
          <div style={{ padding: "12px 20px", borderBottom: `1px solid ${C.line}` }}>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", marginBottom: 8 }}>
              <Stat label="Food" value={s.food} accent={s.food < 20 ? C.rust : C.ink} />
              <Stat label="Bullets" value={s.bullets} />
              <Stat label="Clothing" value={s.clothing} />
              <Stat label="Misc" value={s.misc} accent={s.misc < 8 ? C.rust : C.ink} />
              <Stat label="Cash" value={`$${s.cash}`} accent={C.amber} />
              <Stat label="Turn" value={`${s.turn}/20`} />
            </div>
            <TrailBar mile={s.mile} />
          </div>
        )}

        {/* body */}
        <div style={{ padding: "16px 20px" }}>
          {s.phase === "outfit" && (
            <>
              {hasSave() && (
                <div style={{ ...between(), marginBottom: 12, padding: 10, background: C.panel, border: `1px solid ${C.line}` }}>
                  <span style={{ ...mono, fontSize: 12, color: C.inkSoft }}>A journey is already in progress.</span>
                  <Btn tone="go" onClick={() => dispatch({ type: "RESUME" })}>Resume</Btn>
                </div>
              )}
              <Outfit dispatch={dispatch} />
            </>
          )}
          {s.phase === "fort" && <Fort state={s} dispatch={dispatch} />}
          {s.phase === "hunt" && <Hunt dispatch={dispatch} />}
          {s.phase === "river" && <River state={s} dispatch={dispatch} />}
          {s.phase === "mountain" && <Mountain state={s} dispatch={dispatch} />}
          {s.phase === "end" && <EndScreen state={s} dispatch={dispatch} />}

          {s.phase === "trail" && (
            <div>
              <Scene name={trailScene(idx)} alt={LANDMARKS[idx].name} />
              {resumed && <p style={{ ...mono, fontSize: 10, color: C.inkSoft, marginTop: 0 }}>— journey resumed —</p>}

              {/* rations */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
                <span style={{ ...mono, fontSize: 11, color: C.inkSoft }}>Rations:</span>
                {[["Filling", 3], ["Moderate", 2], ["Bare bones", 1]].map(([lbl, lv]) => (
                  <button key={lv} onClick={() => dispatch({ type: "SET_EAT", level: lv })}
                    style={{ ...mono, fontSize: 11, padding: "4px 12px", borderRadius: 2, cursor: "pointer",
                      background: s.eat === lv ? C.sage : "transparent", color: s.eat === lv ? "#f3ead0" : C.ink,
                      border: `1px solid ${C.line}` }}>{lbl}</button>
                ))}
                <span style={{ ...mono, fontSize: 10, color: C.inkSoft }}>burns {8 + 5 * s.eat} food/turn</span>
              </div>

              {/* actions */}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <Btn tone="go" onClick={() => dispatch({ type: "ADVANCE", penalty: 0 })}>Continue on the trail →</Btn>
                <Btn disabled={!canHunt} onClick={() => dispatch({ type: "OPEN_HUNT" })}>
                  Hunt {canHunt ? "(−45 mi)" : "(need 40+ bullets)"}
                </Btn>
                {atFort && <Btn onClick={() => dispatch({ type: "OPEN_FORT" })}>Rest & resupply at fort</Btn>}
              </div>

              {s.huntResolved && (
                <div style={{ marginTop: 12 }}>
                  <Btn tone="go" onClick={() => { s.huntResolved = false; dispatch({ type: "ADVANCE", penalty: 45 }); }}>
                    Move on after the hunt →
                  </Btn>
                </div>
              )}

              {/* journal */}
              <div style={{ marginTop: 16, maxHeight: 190, overflowY: "auto", background: C.panel, border: `1px solid ${C.line}`, padding: 10 }}>
                {s.log.map((l, i) => (
                  <div key={i} style={{ ...mono, fontSize: 12, marginBottom: 4,
                    color: l.tone === "bad" ? C.rust : l.tone === "good" ? C.sage : l.tone === "warn" ? C.amber : C.ink,
                    opacity: i === 0 ? 1 : Math.max(0.4, 0.75 - i * 0.03) }}>
                    › {l.t}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div style={{ padding: "8px 20px", borderTop: `1px solid ${C.line}`, background: C.panel }}>
          <span style={{ ...mono, fontSize: 9, color: C.inkSoft }}>
            Mechanics adapted from the 1978 public-domain OREGON source. Landmarks, rivers & mountain passes are enhancements to tune.
          </span>
        </div>
      </div>
    </div>
  );
}

function between() {
  return { display: "flex", alignItems: "center", justifyContent: "space-between" };
}

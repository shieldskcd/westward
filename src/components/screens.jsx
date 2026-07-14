import React, { useState, useRef, useEffect } from "react";
import { C, serif, mono, GOAL, DEFAULT_OUTFIT, LANDMARKS, currentLandmarkIdx } from "../game/engine.js";
import { Btn, Scene } from "./ui.jsx";

const rowBottom = { borderBottom: `1px dashed ${C.line}` };
const between = { display: "flex", alignItems: "center", justifyContent: "space-between" };

export function Outfit({ dispatch }) {
  const [oxen, setOxen] = useState(DEFAULT_OUTFIT.oxen);
  const [food, setFood] = useState(DEFAULT_OUTFIT.food);
  const [ammo, setAmmo] = useState(DEFAULT_OUTFIT.ammo);
  const [clothing, setClothing] = useState(DEFAULT_OUTFIT.clothing);
  const [misc, setMisc] = useState(DEFAULT_OUTFIT.misc);
  const left = 700 - (oxen + food + ammo + clothing + misc);
  const oxenOk = oxen >= 200 && oxen <= 300;
  const ok = oxenOk && left >= 0;

  const Row = ({ label, val, set, step, hint }) => (
    <div style={{ ...between, padding: "8px 0", ...rowBottom }}>
      <div>
        <div style={{ ...serif, fontSize: 15, color: C.ink }}>{label}</div>
        <div style={{ ...mono, fontSize: 10, color: C.inkSoft }}>{hint}</div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Btn onClick={() => set(Math.max(0, val - step))}>−</Btn>
        <span style={{ ...mono, width: 54, textAlign: "center", fontWeight: 700 }}>${val}</span>
        <Btn onClick={() => set(val + step)}>+</Btn>
      </div>
    </div>
  );

  return (
    <div>
      <Scene name="01_DepartIndependence" alt="Departing Independence, Missouri" />
      <p style={{ ...serif, color: C.inkSoft, fontSize: 14, marginBottom: 12 }}>
        You've saved $900 and spent $200 on a wagon. Outfit your party with the remaining <b>$700</b>.
        Spend it all now, or hold cash back for the forts — where everything costs more.
      </p>
      <Row label="Oxen team" val={oxen} set={setOxen} step={10} hint="$200–$300 · a faster team means more miles per turn" />
      <Row label="Food" val={food} set={setFood} step={10} hint="burned every turn by eating" />
      <Row label="Ammunition" val={ammo} set={setAmmo} step={1} hint={`$1 = 50 bullets → ${ammo * 50} rounds`} />
      <Row label="Clothing" val={clothing} set={setClothing} step={5} hint="keeps the party alive in the mountains" />
      <Row label="Misc. supplies" val={misc} set={setMisc} step={5} hint="medicine & repairs — your buffer against death" />
      <div style={{ ...between, marginTop: 12 }}>
        <span style={{ ...mono, color: left < 0 ? C.rust : C.ink }}>Cash left: ${left}</span>
        {!oxenOk && <span style={{ ...mono, color: C.rust, fontSize: 12 }}>Oxen must be $200–$300</span>}
      </div>
      <div style={{ marginTop: 16 }}>
        <Btn tone="go" disabled={!ok} onClick={() => dispatch({ type: "OUTFIT", payload: { oxen, food, ammo, clothing, misc } })}>
          Hit the trail →
        </Btn>
      </div>
    </div>
  );
}

export function Fort({ state, dispatch }) {
  const [f, setF] = useState(0), [a, setA] = useState(0), [c, setC] = useState(0), [m, setM] = useState(0);
  const spend = f + a + c + m;
  const Row = ({ label, val, set, note }) => (
    <div style={{ ...between, padding: "8px 0", ...rowBottom }}>
      <span style={{ ...serif }}>
        {label} <span style={{ ...mono, fontSize: 10, color: C.inkSoft }}>{note}</span>
      </span>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Btn onClick={() => set(Math.max(0, val - 5))}>−</Btn>
        <span style={{ ...mono, width: 46, textAlign: "center" }}>${val}</span>
        <Btn onClick={() => set(val + 5)}>+</Btn>
      </div>
    </div>
  );
  return (
    <div>
      <Scene name="04_FortSupply" alt="A frontier trading post" />
      <h3 style={{ ...serif, fontSize: 20, color: C.rust }}>Trading Post</h3>
      <p style={{ ...mono, fontSize: 11, color: C.inkSoft, marginBottom: 8 }}>Every dollar buys only 2/3 its worth out here.</p>
      <Row label="Food" val={f} set={setF} note="+2/3 value" />
      <Row label="Ammunition" val={a} set={setA} note="×50 rounds, 2/3 value" />
      <Row label="Clothing" val={c} set={setC} note="+2/3 value" />
      <Row label="Misc. supplies" val={m} set={setM} note="+2/3 value" />
      <div style={{ ...between, marginTop: 12 }}>
        <span style={{ ...mono }}>Spend ${spend} of ${state.cash}</span>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn onClick={() => dispatch({ type: "CLOSE_FORT" })}>Leave</Btn>
          <Btn tone="go" disabled={spend > state.cash || spend === 0} onClick={() => dispatch({ type: "FORT_BUY", payload: { food: f, ammo: a, clothing: c, misc: m } })}>Buy</Btn>
        </div>
      </div>
    </div>
  );
}

export function Hunt({ dispatch }) {
  const [word, setWord] = useState(null);
  const [ready, setReady] = useState(false);
  const startRef = useRef(0);
  const words = ["BANG", "BLAM", "POW", "WHAM"];
  useEffect(() => {
    const delay = 700 + Math.random() * 2200;
    const t = setTimeout(() => {
      setWord(words[Math.floor(Math.random() * words.length)]);
      startRef.current = performance.now();
      setReady(true);
    }, delay);
    return () => clearTimeout(t);
  }, []);
  const fire = () => {
    if (!ready) { dispatch({ type: "RESOLVE_HUNT", ms: 9999 }); return; }
    dispatch({ type: "RESOLVE_HUNT", ms: performance.now() - startRef.current });
  };
  return (
    <div style={{ textAlign: "center", padding: "24px 0" }}>
      <Scene name="05_Hunting" alt="Hunting on the plains" />
      <h3 style={{ ...serif, fontSize: 20, color: C.rust }}>Hunting</h3>
      <p style={{ ...mono, fontSize: 12, color: C.inkSoft, marginBottom: 16 }}>When the word appears, fire as fast as you can.</p>
      <div style={{ ...serif, fontSize: 40, color: ready ? C.sage : C.line, height: 56 }}>{word || "…"}</div>
      <div style={{ marginTop: 16 }}>
        <Btn tone={ready ? "danger" : undefined} onClick={fire}>{ready ? `FIRE — ${word}!` : "steady…"}</Btn>
      </div>
    </div>
  );
}

export function River({ state, dispatch }) {
  return (
    <div style={{ padding: "16px 0" }}>
      <Scene name="06_RiverCrossing" alt={`Crossing the ${state.pendingRiver.name}`} />
      <h3 style={{ ...serif, fontSize: 20, color: C.rust }}>The {state.pendingRiver.name}</h3>
      <p style={{ ...mono, fontSize: 12, color: C.inkSoft, marginBottom: 12 }}>The water runs fast and cold. How do you cross?</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <Btn onClick={() => dispatch({ type: "CROSS_RIVER", method: "ford" })}>Ford it — fast, but you risk flooding the wagon</Btn>
        <Btn onClick={() => dispatch({ type: "CROSS_RIVER", method: "float" })}>Caulk the wagon and float — slower, safer</Btn>
        <Btn onClick={() => dispatch({ type: "CROSS_RIVER", method: "ferry" })}>Take the ferry — $5 and a little lost time</Btn>
      </div>
    </div>
  );
}

export function Mountain({ state, dispatch }) {
  return (
    <div style={{ padding: "16px 0" }}>
      <Scene name="07_MountainBlizzard" alt={`${state.pendingMountain.name} — a hard pass`} />
      <h3 style={{ ...serif, fontSize: 20, color: C.rust }}>{state.pendingMountain.name}</h3>
      <p style={{ ...mono, fontSize: 12, color: C.inkSoft, marginBottom: 12 }}>
        The trail climbs into the mountains. Snow threatens the passes, and there's no way around.
      </p>
      <Btn tone="danger" onClick={() => dispatch({ type: "RESOLVE_MOUNTAIN" })}>Press on through the pass →</Btn>
    </div>
  );
}

// A carved trailside grave marker: R.I.P., the epitaph, the year, and how far the
// party got before the trail took them. Built to slot a party member's NAME in later
// (Phase 2c) — for now it marks the whole party's resting place.
function Tombstone({ epitaph, mile }) {
  const near = LANDMARKS[currentLandmarkIdx(mile)].name;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", margin: "18px 0 6px" }}>
      <div
        style={{
          width: 268, maxWidth: "82%", padding: "30px 24px 34px",
          borderRadius: "134px 134px 12px 12px",
          background: "linear-gradient(#cabfa2, #a89d80)",
          border: `2px solid ${C.ink}`,
          boxShadow: "3px 4px 0 rgba(44,35,24,.3), inset 0 3px 7px rgba(255,255,255,.28)",
          textAlign: "center", color: C.ink,
        }}
      >
        <div style={{ ...serif, fontSize: 22, letterSpacing: 6, fontWeight: 700, opacity: 0.78 }}>R·I·P</div>
        <div style={{ fontSize: 20, margin: "0 0 14px", opacity: 0.5 }}>†</div>
        <div style={{ ...serif, fontSize: 14.5, lineHeight: 1.5, fontStyle: "italic" }}>{epitaph}</div>
        <div style={{ width: 44, height: 1, background: C.ink, opacity: 0.3, margin: "16px auto" }} />
        <div style={{ ...mono, fontSize: 12, letterSpacing: 1 }}>1847</div>
        <div style={{ ...mono, fontSize: 12, letterSpacing: 1, marginTop: 2 }}>
          {mile.toLocaleString()} miles from home
        </div>
        <div style={{ ...mono, fontSize: 10, color: C.inkSoft, marginTop: 6 }}>near {near}</div>
      </div>
      {/* the grassy mound the marker is planted in */}
      <div style={{ width: 220, maxWidth: "70%", height: 20, background: C.sage, borderRadius: "50%", marginTop: -9, opacity: 0.7 }} />
    </div>
  );
}

export function EndScreen({ state, dispatch }) {
  const won = state.won;
  return (
    <div style={{ textAlign: "center", padding: "32px 0" }}>
      <Scene
        name={won ? "09_ArrivalAtOregon" : "10_TrailMarker"}
        alt={won ? "Arrival in the Willamette Valley" : "A lonely trailside grave"}
      />
      <h2 style={{ ...serif, fontSize: 30, color: won ? C.sage : C.rust }}>
        {won ? "You reached Oregon City!" : "The trail has claimed your party."}
      </h2>
      {won ? (
        <p style={{ ...serif, fontSize: 16, color: C.ink, marginTop: 10 }}>
          {`After ${GOAL} long miles and ${state.turn} turns, your party arrives in the Willamette Valley. A real pioneer.`}
        </p>
      ) : (
        <Tombstone epitaph={state.dead} mile={state.mile} />
      )}
      <div style={{ marginTop: 24 }}>
        <Btn tone="go" onClick={() => dispatch({ type: "RESTART" })}>Set out again</Btn>
      </div>
    </div>
  );
}

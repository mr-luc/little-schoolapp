const repairRobot = document.querySelector("#repairRobot");
const repairText = document.querySelector("#repairText");
const repairCount = document.querySelector("#repairCount");
const repairMeterFill = document.querySelector("#repairMeterFill");

const repairMessages = [
  "Algo ist noch defekt. Löse Mission 1 und starte die Reparatur.",
  "Die Werkstattplattform ist aktiv.",
  "Das linke Rad sitzt wieder.",
  "Das rechte Rad sitzt wieder.",
  "Der Körperrahmen ist befestigt.",
  "Die Bauchplatte ist eingebaut.",
  "Der linke Arm ist repariert.",
  "Der rechte Arm ist repariert.",
  "Die linke Greifhand funktioniert wieder.",
  "Die rechte Greifhand funktioniert wieder.",
  "Der Hals ist stabilisiert.",
  "Der Kopf ist wieder montiert.",
  "Das linke Auge leuchtet.",
  "Das rechte Auge leuchtet.",
  "Der Mund reagiert wieder.",
  "Die Antenne ist angebaut.",
  "Das linke Ohrmodul ist verbunden.",
  "Das rechte Ohrmodul ist verbunden.",
  "Der Energiekern ist eingesetzt.",
  "Die Systeme leuchten. Nur noch der Boss-Test fehlt.",
  "Algo ist vollständig repariert und bereit für die Teststrecke."
];

let lastRepairStep = -1;

function getRepairStep() {
  try {
    const saved = JSON.parse(localStorage.getItem("little-algorithmen7-progress-v3"));
    if (!saved || !Number.isInteger(saved.score)) return 0;
    return Math.max(0, Math.min(20, saved.score));
  } catch (error) {
    return 0;
  }
}

function renderRepairRobot(step = getRepairStep(), force = false) {
  if (!repairRobot) return;
  if (!force && step === lastRepairStep) return;
  lastRepairStep = step;

  const active = (number) => step >= number ? "active" : "";
  const complete = step >= 20 ? "complete" : "";

  repairRobot.innerHTML = `
    <svg class="repair-svg ${complete}" viewBox="0 0 360 320" role="img" aria-label="Roboter Algo wird aus Einzelteilen zusammengesetzt">
      <defs>
        <filter id="repairGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g class="repair-shadow"><ellipse cx="180" cy="292" rx="116" ry="16" /></g>
      <g class="repair-part p1 ${active(1)}"><rect x="86" y="274" width="188" height="18" rx="9" /></g>
      <g class="repair-part p2 ${active(2)}"><circle cx="126" cy="254" r="28" /><circle cx="126" cy="254" r="12" class="inner" /></g>
      <g class="repair-part p3 ${active(3)}"><circle cx="234" cy="254" r="28" /><circle cx="234" cy="254" r="12" class="inner" /></g>
      <g class="repair-part p4 ${active(4)}"><rect x="113" y="141" width="134" height="105" rx="26" /></g>
      <g class="repair-part p5 ${active(5)}"><rect x="142" y="170" width="76" height="48" rx="16" class="panel" /></g>
      <g class="repair-part p6 ${active(6)}"><path d="M113 170 H72 Q52 170 52 190 V222" /></g>
      <g class="repair-part p7 ${active(7)}"><path d="M247 170 H288 Q308 170 308 190 V222" /></g>
      <g class="repair-part p8 ${active(8)}"><circle cx="52" cy="232" r="16" /></g>
      <g class="repair-part p9 ${active(9)}"><circle cx="308" cy="232" r="16" /></g>
      <g class="repair-part p10 ${active(10)}"><rect x="158" y="120" width="44" height="24" rx="10" /></g>
      <g class="repair-part p11 ${active(11)}"><rect x="102" y="54" width="156" height="78" rx="28" /></g>
      <g class="repair-part p12 ${active(12)}"><circle cx="154" cy="93" r="10" class="eye" /></g>
      <g class="repair-part p13 ${active(13)}"><circle cx="206" cy="93" r="10" class="eye" /></g>
      <g class="repair-part p14 ${active(14)}"><path d="M154 112 Q180 124 206 112" class="mouth" /></g>
      <g class="repair-part p15 ${active(15)}"><path d="M180 54 V25" /><circle cx="180" cy="18" r="10" class="antenna-dot" /></g>
      <g class="repair-part p16 ${active(16)}"><circle cx="92" cy="92" r="17" /></g>
      <g class="repair-part p17 ${active(17)}"><circle cx="268" cy="92" r="17" /></g>
      <g class="repair-part p18 ${active(18)}"><circle cx="180" cy="194" r="18" class="core" /></g>
      <g class="repair-part p19 ${active(19)}"><circle cx="180" cy="194" r="36" class="core-glow" /><path d="M134 156 L118 140 M226 156 L242 140 M135 228 L120 244 M225 228 L240 244" class="energy-lines" /></g>
      <g class="repair-part p20 ${active(20)}"><path d="M100 34 C135 14 225 14 260 34" class="complete-arc" /><text x="180" y="307" text-anchor="middle" class="online-text">SYSTEM ONLINE</text></g>
    </svg>
  `;

  if (repairText) repairText.textContent = repairMessages[step] || repairMessages[0];
  if (repairCount) repairCount.textContent = `Repariert: ${step} von 20 Bauteilen`;
  if (repairMeterFill) repairMeterFill.style.width = `${(step / 20) * 100}%`;
}

window.addEventListener("storage", () => renderRepairRobot(getRepairStep(), true));
renderRepairRobot(getRepairStep(), true);
setInterval(() => renderRepairRobot(), 300);

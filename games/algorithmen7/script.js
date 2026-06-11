const gameEl = document.querySelector("#game");
const missionCounter = document.querySelector("#missionCounter");
const scoreCounter = document.querySelector("#scoreCounter");
const progressBar = document.querySelector("#progressBar");
const resetButton = document.querySelector("#resetButton");
const confettiTemplate = document.querySelector("#confettiTemplate");

const STORAGE_KEY = "little-algorithmen7-progress-v3";

const missions = [
  {
    type: "quiz",
    chapter: "Kapitel 1: Roboterwerkstatt",
    kicker: "Mission 1 von 20",
    title: "Entscheidung erkennen",
    speech: "Ich sehe eine Frage im Ablauf. Welches Symbol brauche ich dafür?",
    story: "Algo steht in der Roboterwerkstatt. Auf seinem Bildschirm erscheint der Befehl: Akku < 20? Du entscheidest, welches Flussdiagramm-Symbol dazu passt.",
    text: "Für eine Frage mit Ja/Nein-Weg brauchst du welches Symbol?",
    options: [
      { text: "Oval", correct: false, hint: "Das Oval steht für Start oder Ende." },
      { text: "Parallelogramm", correct: false, hint: "Das Parallelogramm steht für Eingabe oder Ausgabe." },
      { text: "Raute", correct: true, hint: "Richtig. In der Raute steht eine Bedingung oder Entscheidung." },
      { text: "Rechteck", correct: false, hint: "Das Rechteck steht für eine Verarbeitung oder Berechnung." }
    ]
  },
  {
    type: "quiz",
    chapter: "Kapitel 1: Roboterwerkstatt",
    kicker: "Mission 2 von 20",
    title: "Eingabe und Ausgabe",
    speech: "Ich bekomme Daten und soll später etwas anzeigen. Wie nennt man das?",
    story: "Algo soll zuerst eine Zahl vom Benutzer erhalten und später ein Ergebnis anzeigen. Beides gehört zur gleichen Symbolart.",
    text: "Welche Symbolart passt zu „Zahl eingeben“ und „Ergebnis anzeigen“?",
    options: [
      { text: "Eingabe / Ausgabe", correct: true, hint: "Genau. Eingaben und Ausgaben stehen im Parallelogramm." },
      { text: "Entscheidung / Bedingung", correct: false, hint: "Das wäre eine Frage mit Ja/Nein-Weg." },
      { text: "Verarbeitung", correct: false, hint: "Verarbeitung bedeutet zum Beispiel rechnen oder einen Wert ändern." },
      { text: "Start / Ende", correct: false, hint: "Start und Ende markieren nur Beginn und Schluss." }
    ]
  },
  {
    type: "quiz",
    chapter: "Kapitel 1: Roboterwerkstatt",
    kicker: "Mission 3 von 20",
    title: "Verarbeitung erkennen",
    speech: "Mein Prozessor verändert einen Wert. Welche Symbolart ist das?",
    story: "Im Speicher steht der Befehl: zahl = zahl + 1. Algo rechnet also und verändert eine Variable.",
    text: "Welche Symbolart passt zu einer Berechnung oder Veränderung?",
    options: [
      { text: "Verarbeitung", correct: true, hint: "Richtig. Berechnungen und Veränderungen stehen im Rechteck." },
      { text: "Start / Ende", correct: false, hint: "Start und Ende gehören zum Oval." },
      { text: "Eingabe / Ausgabe", correct: false, hint: "Hier wird nichts eingegeben oder angezeigt." },
      { text: "Entscheidung / Bedingung", correct: false, hint: "Das wäre eine Frage wie zahl > 5?." }
    ]
  },
  {
    type: "match",
    chapter: "Kapitel 1: Roboterwerkstatt",
    kicker: "Mission 4 von 20",
    title: "Symbolspeicher sortieren",
    speech: "Ordne erst jetzt die Begriffe den passenden Symbolnamen zu.",
    story: "Jetzt kennt Algo die Bedeutungen. Nun sortierst du die Fachbegriffe und Symbolnamen zusammen.",
    text: "Klicke zuerst links einen Begriff und dann rechts den passenden Symbolnamen an.",
    pairs: [
      { left: "Start / Ende", right: "Oval", info: "Start / Ende" },
      { left: "Eingabe / Ausgabe", right: "Parallelogramm", info: "Eingabe / Ausgabe" },
      { left: "Verarbeitung", right: "Rechteck", info: "Verarbeitung" },
      { left: "Entscheidung / Bedingung", right: "Raute", info: "Entscheidung" }
    ]
  },
  {
    type: "quiz",
    chapter: "Kapitel 2: Sequenz-Modul",
    kicker: "Mission 5 von 20",
    title: "Sequenz aktivieren",
    speech: "Was bedeutet Sequenz?",
    story: "Algo fährt zum Sequenz-Modul. Dort müssen Befehle genau nacheinander ausgeführt werden.",
    text: "Welche Erklärung passt zur Grundstruktur Sequenz?",
    options: [
      { text: "Ein Befehl wird wiederholt.", correct: false, hint: "Das ist eine Schleife oder Iteration." },
      { text: "Es wird eine Ja/Nein-Frage geprüft.", correct: false, hint: "Das ist eine Selektion oder Verzweigung." },
      { text: "Befehle werden Schritt für Schritt nacheinander ausgeführt.", correct: true, hint: "Richtig. Sequenz bedeutet Reihenfolge." },
      { text: "Das Programm entscheidet zufällig.", correct: false, hint: "Zufall ist keine Grundstruktur." }
    ]
  },
  {
    type: "order",
    chapter: "Kapitel 2: Sequenz-Modul",
    kicker: "Mission 6 von 20",
    title: "Startreihenfolge reparieren",
    speech: "Bringe meine Startbefehle in die richtige Reihenfolge.",
    story: "Algo kann nicht starten, weil seine Startsequenz vertauscht wurde.",
    text: "Klicke die Bausteine in der richtigen Reihenfolge an.",
    blocks: ["Motor starten", "Ende", "Start", "Sensor prüfen", "Akku prüfen", "System bereit melden"],
    correctOrder: ["Start", "Akku prüfen", "Sensor prüfen", "Motor starten", "System bereit melden", "Ende"],
    note: "Hier gibt es keine Entscheidung und keine Wiederholung. Es ist eine reine Sequenz."
  },
  {
    type: "codeQuiz",
    chapter: "Kapitel 2: Sequenz-Modul",
    kicker: "Mission 7 von 20",
    title: "Sequenz ausführen",
    speech: "Rechne meine Befehle der Reihe nach aus.",
    story: "Der Rechenkern testet, ob du jeden Schritt in der richtigen Reihenfolge beachtest.",
    text: "Welche Zahl wird am Ende ausgegeben?",
    code: `zahl = 2
zahl = zahl + 3
zahl = zahl * 2
Ausgabe zahl`,
    options: [
      { text: "5", correct: false, hint: "Nach dem zweiten Schritt ist zahl = 5. Danach wird noch mal 2 gerechnet." },
      { text: "7", correct: false, hint: "Achte auf die Reihenfolge der Rechenschritte." },
      { text: "10", correct: true, hint: "Richtig: 2 + 3 = 5 und 5 * 2 = 10." },
      { text: "12", correct: false, hint: "Das wäre hier nicht die richtige Reihenfolge." }
    ]
  },
  {
    type: "codeQuiz",
    chapter: "Kapitel 2: Sequenz-Modul",
    kicker: "Mission 8 von 20",
    title: "Variablen verfolgen",
    speech: "Mein Speicher ändert sich. Was steht am Ende in x?",
    story: "Algo schreibt Werte in Speicherplätze. Du musst verfolgen, wie sich die Variable verändert.",
    text: "Welche Ausgabe entsteht?",
    code: `x = 3
y = x + 4
x = y - 1
Ausgabe x`,
    options: [
      { text: "3", correct: false, hint: "x bekommt später einen neuen Wert." },
      { text: "6", correct: true, hint: "Richtig: y = 7, danach x = 7 - 1 = 6." },
      { text: "7", correct: false, hint: "7 steht zwischendurch in y, aber nicht am Ende in x." },
      { text: "8", correct: false, hint: "Überprüfe den letzten Rechenschritt." }
    ]
  },
  {
    type: "quiz",
    chapter: "Kapitel 3: Selektion-Modul",
    kicker: "Mission 9 von 20",
    title: "Selektion erkennen",
    speech: "Jetzt muss ich zwischen zwei Wegen wählen.",
    story: "Im Selektion-Modul gibt es Weichen. Je nach Bedingung fährt Algo links oder rechts weiter.",
    text: "Welche Beschreibung passt zur Selektion?",
    options: [
      { text: "Ein Ablauf wird genau einmal von oben nach unten ausgeführt.", correct: false, hint: "Das beschreibt eher eine Sequenz." },
      { text: "Eine Bedingung entscheidet, welcher Weg genommen wird.", correct: true, hint: "Richtig. Selektion nennt man auch Verzweigung." },
      { text: "Ein Befehl läuft immer unendlich weiter.", correct: false, hint: "Das wäre eine fehlerhafte Schleife." },
      { text: "Alle Befehle werden gleichzeitig ausgeführt.", correct: false, hint: "Das passt hier nicht." }
    ]
  },
  {
    type: "codeQuiz",
    chapter: "Kapitel 3: Selektion-Modul",
    kicker: "Mission 10 von 20",
    title: "Bedingung einsetzen",
    speech: "Ohne Bedingung weiß ich nicht, ob der Test bestanden ist.",
    story: "Algo sortiert Testauswertungen. Ab 20 Punkten soll „bestanden“ erscheinen.",
    text: "Welche Bedingung passt zur Regel: ab 20 Punkten bestanden?",
    code: `punkte = Eingabe

Wenn __________ dann:
    Ausgabe "bestanden"
Sonst:
    Ausgabe "nicht bestanden"`,
    options: [
      { text: "punkte < 20", correct: false, hint: "Dann wären gerade die nicht bestandenen Tests im Ja-Zweig." },
      { text: "punkte >= 20", correct: true, hint: "Richtig. Ab 20 Punkten bedeutet 20 oder mehr." },
      { text: "punkte = 100", correct: false, hint: "Das prüft nur genau 100 Punkte." },
      { text: "punkte != 20", correct: false, hint: "Das bedeutet: Punkte sind nicht genau 20." }
    ]
  },
  {
    type: "flowQuiz",
    flowKind: "points",
    chapter: "Kapitel 3: Selektion-Modul",
    kicker: "Mission 11 von 20",
    title: "Flussdiagramm lesen",
    speech: "Welche Beschreibung passt zu meinem Diagramm?",
    story: "Auf dem Diagnosebildschirm erscheint ein fertiges Flussdiagramm. Du musst den Ablauf in Worte übersetzen.",
    text: "Was beschreibt das Flussdiagramm?",
    options: [
      { text: "Das Programm prüft, ob mindestens 20 Punkte erreicht wurden.", correct: true, hint: "Richtig. Die Bedingung lautet Punkte >= 20?" },
      { text: "Das Programm zählt Punkte von 1 bis 20 hoch.", correct: false, hint: "Im Diagramm gibt es keine Schleife zum Hochzählen." },
      { text: "Das Programm verdoppelt eine eingegebene Zahl.", correct: false, hint: "Es wird nichts verdoppelt." },
      { text: "Das Programm prüft ein Passwort.", correct: false, hint: "Es geht um Punkte, nicht um ein Passwort." }
    ]
  },
  {
    type: "codeQuiz",
    chapter: "Kapitel 3: Selektion-Modul",
    kicker: "Mission 12 von 20",
    title: "Weg bestimmen",
    speech: "Welchen Weg nehme ich bei dieser Eingabe?",
    story: "Algo fährt durch eine Schleuse. Nur wenn der Akku stark genug ist, darf er zur Teststrecke.",
    text: "Welche Ausgabe entsteht bei akku = 15?",
    code: `akku = 15

Wenn akku < 20 dann:
    Ausgabe "aufladen"
Sonst:
    Ausgabe "bereit"`,
    options: [
      { text: "aufladen", correct: true, hint: "Richtig. 15 ist kleiner als 20." },
      { text: "bereit", correct: false, hint: "Das wäre der Sonst-Zweig." },
      { text: "15", correct: false, hint: "Die Zahl wird geprüft, aber nicht ausgegeben." },
      { text: "keine Ausgabe", correct: false, hint: "Einer der beiden Wege wird immer ausgeführt." }
    ]
  },
  {
    type: "quiz",
    chapter: "Kapitel 4: Iteration-Modul",
    kicker: "Mission 13 von 20",
    title: "Iteration erkennen",
    speech: "Jetzt soll ich etwas wiederholen.",
    story: "Das Iteration-Modul startet. Hier werden Befehle nicht nur einmal ausgeführt, sondern mehrfach.",
    text: "Welche Erklärung passt zur Iteration?",
    options: [
      { text: "Befehle werden wiederholt, solange eine Bedingung gilt.", correct: true, hint: "Richtig. Iteration bedeutet Wiederholung oder Schleife." },
      { text: "Ein Programm endet sofort.", correct: false, hint: "Das beschreibt keine Wiederholung." },
      { text: "Eine Eingabe wird angezeigt.", correct: false, hint: "Das ist Eingabe/Ausgabe, keine Iteration." },
      { text: "Eine Variable wird gelöscht.", correct: false, hint: "Das ist keine Grundstruktur." }
    ]
  },
  {
    type: "codeQuiz",
    chapter: "Kapitel 4: Iteration-Modul",
    kicker: "Mission 14 von 20",
    title: "Schleife ausführen",
    speech: "Folge meiner Schleife Schritt für Schritt.",
    story: "Algo testet seinen Lautsprecher und zählt dabei hoch.",
    text: "Welche Ausgabe entsteht?",
    code: `zahl = 1

Wiederhole solange zahl <= 3:
    Ausgabe zahl
    zahl = zahl + 1`,
    options: [
      { text: "1, 2", correct: false, hint: "Die Bedingung gilt auch noch bei zahl = 3." },
      { text: "1, 2, 3", correct: true, hint: "Richtig. Danach wird zahl zu 4 und die Schleife endet." },
      { text: "1, 2, 3, 4", correct: false, hint: "Bei zahl = 4 gilt zahl <= 3 nicht mehr." },
      { text: "Die Schleife endet nie.", correct: false, hint: "zahl wird jedes Mal um 1 erhöht." }
    ]
  },
  {
    type: "codeQuiz",
    chapter: "Kapitel 4: Iteration-Modul",
    kicker: "Mission 15 von 20",
    title: "Schleifenfehler finden",
    speech: "Ich sollte bis 5 zählen, aber etwas fehlt.",
    story: "Im Testprotokoll steht: Algo soll die Zahlen 1 bis 5 ausgeben. Der Code schafft das noch nicht.",
    text: "Was ist das Problem?",
    code: `zahl = 1

Wiederhole solange zahl < 5:
    Ausgabe zahl
    zahl = zahl + 1`,
    options: [
      { text: "Die 1 wird nicht ausgegeben.", correct: false, hint: "Die 1 wird direkt im ersten Durchlauf ausgegeben." },
      { text: "Die 5 wird nicht ausgegeben.", correct: true, hint: "Richtig. Bei zahl = 5 ist zahl < 5 falsch." },
      { text: "zahl wird kleiner.", correct: false, hint: "zahl wird um 1 größer." },
      { text: "Die Schleife läuft unendlich.", correct: false, hint: "Die Schleife endet bei zahl = 5." }
    ]
  },
  {
    type: "codeQuiz",
    chapter: "Kapitel 4: Iteration-Modul",
    kicker: "Mission 16 von 20",
    title: "Bedingung verbessern",
    speech: "Wie muss die Bedingung heißen, damit auch die 5 erscheint?",
    story: "Du darfst den Schleifencode reparieren. Nur eine Bedingung ist passend.",
    text: "Welche Bedingung gibt die Zahlen 1 bis 5 aus?",
    code: `zahl = 1

Wiederhole solange __________:
    Ausgabe zahl
    zahl = zahl + 1`,
    options: [
      { text: "zahl < 5", correct: false, hint: "Dann fehlt die 5 wieder." },
      { text: "zahl <= 5", correct: true, hint: "Richtig. Die Schleife läuft auch noch bei zahl = 5." },
      { text: "zahl > 5", correct: false, hint: "Bei zahl = 1 würde die Schleife gar nicht starten." },
      { text: "zahl = 5", correct: false, hint: "Dann passt der Startwert 1 nicht." }
    ]
  },
  {
    type: "flowQuiz",
    flowKind: "countdown",
    chapter: "Kapitel 5: Flussdiagramm-Labor",
    kicker: "Mission 17 von 20",
    title: "Schleife im Diagramm",
    speech: "Siehst du die Wiederholung im Flussdiagramm?",
    story: "Das Labor zeigt jetzt kein einfaches Ja/Nein-Programm, sondern eine echte Wiederholung mit Rückpfeil.",
    text: "Was beschreibt dieses Flussdiagramm?",
    options: [
      { text: "Das Programm zählt von 3 herunter und gibt 3, 2, 1 aus.", correct: true, hint: "Richtig. Nach jeder Ausgabe wird die Zahl um 1 kleiner." },
      { text: "Das Programm prüft, ob ein Passwort richtig ist.", correct: false, hint: "Es gibt keine Passwort-Eingabe." },
      { text: "Das Programm gibt nur einmal die 3 aus.", correct: false, hint: "Der Rückpfeil zeigt eine Wiederholung." },
      { text: "Das Programm zählt unendlich weiter.", correct: false, hint: "Die Zahl wird kleiner. Irgendwann gilt zahl > 0 nicht mehr." }
    ]
  },
  {
    type: "match",
    chapter: "Kapitel 5: Flussdiagramm-Labor",
    kicker: "Mission 18 von 20",
    title: "Grundstrukturen sortieren",
    speech: "Ordne die Fachbegriffe richtig zu.",
    story: "Algo muss die drei Grundstrukturen auseinanderhalten, bevor der Abschluss-Test startet.",
    text: "Klicke links einen Fachbegriff und dann rechts die passende Erklärung an.",
    pairs: [
      { left: "Sequenz", right: "Schritte nacheinander", info: "Reihenfolge" },
      { left: "Selektion", right: "Auswahl durch Bedingung", info: "Verzweigung" },
      { left: "Iteration", right: "Wiederholung", info: "Schleife" },
      { left: "Bedingung", right: "Frage mit wahr/falsch", info: "Ja/Nein" }
    ]
  },
  {
    type: "codeQuiz",
    chapter: "Kapitel 6: Boss-Test",
    kicker: "Mission 19 von 20",
    title: "Gemischter Algorithmus",
    speech: "Jetzt kommen Selektion und Iteration zusammen.",
    story: "Algo fährt eine Teststrecke. Er zählt, wie oft eine gerade Zahl gefunden wird.",
    text: "Welche Ausgabe entsteht?",
    code: `zahl = 1
anzahl = 0

Wiederhole solange zahl <= 4:
    Wenn zahl ist gerade dann:
        anzahl = anzahl + 1
    zahl = zahl + 1

Ausgabe anzahl`,
    options: [
      { text: "1", correct: false, hint: "Zwischen 1 und 4 gibt es mehr als eine gerade Zahl." },
      { text: "2", correct: true, hint: "Richtig. Gerade sind 2 und 4." },
      { text: "3", correct: false, hint: "1 und 3 sind ungerade." },
      { text: "4", correct: false, hint: "Nicht jede Zahl von 1 bis 4 ist gerade." }
    ]
  },
  {
    type: "codeQuiz",
    chapter: "Kapitel 6: Boss-Test",
    kicker: "Mission 20 von 20",
    title: "Algo endgültig retten",
    speech: "Prüfe meinen Sicherheitsablauf. Danach bin ich repariert!",
    story: "Der letzte Fehler steckt im Sicherheitsprogramm. Es nutzt Sequenz, Selektion und Iteration zusammen.",
    text: "Was gibt das Programm nach drei falschen Passwörtern aus?",
    code: `versuche = 0
zugang = falsch

Wiederhole solange versuche < 3 und zugang = falsch:
    passwort = Eingabe
    Wenn passwort richtig dann:
        zugang = wahr
    Sonst:
        versuche = versuche + 1

Wenn zugang = wahr dann:
    Ausgabe "Zugang erlaubt"
Sonst:
    Ausgabe "Zugang gesperrt"`,
    options: [
      { text: "Zugang erlaubt", correct: false, hint: "Nach drei falschen Eingaben bleibt zugang = falsch." },
      { text: "Zugang gesperrt", correct: true, hint: "Richtig. Nach dem dritten Fehler endet die Schleife und der Sonst-Zweig wird ausgeführt." },
      { text: "Passwort richtig", correct: false, hint: "Das ist eine Bedingung, keine Ausgabe." },
      { text: "Das Programm läuft unendlich.", correct: false, hint: "versuche wird nach jeder falschen Eingabe um 1 erhöht." }
    ]
  }
];

const state = loadState();

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && Number.isInteger(saved.index) && Number.isInteger(saved.score)) {
      return { index: Math.min(saved.index, missions.length), score: Math.max(0, saved.score) };
    }
  } catch (error) {
    console.warn("Spielstand konnte nicht geladen werden.", error);
  }
  return { index: 0, score: 0 };
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function updateStatus() {
  const shownIndex = Math.min(state.index + 1, missions.length);
  missionCounter.textContent = state.index >= missions.length ? "Fertig" : `${shownIndex} von ${missions.length}`;
  scoreCounter.textContent = `${state.score} ⚡`;
  const progress = state.index >= missions.length ? 100 : (state.index / missions.length) * 100;
  progressBar.style.width = `${progress}%`;
}

function render() {
  updateStatus();
  if (state.index >= missions.length) {
    renderEndScreen();
    return;
  }

  const mission = missions[state.index];
  if (mission.type === "quiz") renderQuiz(mission);
  if (mission.type === "codeQuiz") renderCodeQuiz(mission);
  if (mission.type === "flowQuiz") renderFlowQuiz(mission);
  if (mission.type === "match") renderMatch(mission);
  if (mission.type === "order") renderOrder(mission);

  gameEl.focus({ preventScroll: true });
}

function levelFrame(mission, body) {
  gameEl.innerHTML = `
    <section class="level-header">
      <div>
        <p class="level-kicker">${escapeHtml(mission.chapter)} · ${escapeHtml(mission.kicker)}</p>
        <h2 class="level-title">${escapeHtml(mission.title)}</h2>
        <p class="level-text">${escapeHtml(mission.text)}</p>
      </div>
      <div class="algo-speech">🤖 Algo: ${escapeHtml(mission.speech)}</div>
    </section>
    <section class="mission-body">
      <div class="feedback"><strong>Story:</strong> ${escapeHtml(mission.story)}</div>
      ${body}
    </section>
  `;
}

function renderQuiz(mission) {
  levelFrame(mission, `
    <div class="option-grid">${mission.options.map((option, index) => optionButton(option.text, index)).join("")}</div>
    <div id="feedback" class="feedback" hidden></div>
    <div id="nextRow" class="next-row" hidden><button class="primary-button" type="button">Nächste Mission</button></div>
  `);
  wireOptions(mission.options);
}

function renderCodeQuiz(mission) {
  levelFrame(mission, `
    <pre class="code-box"><code>${escapeHtml(mission.code)}</code></pre>
    <div class="option-grid">${mission.options.map((option, index) => optionButton(option.text, index)).join("")}</div>
    <div id="feedback" class="feedback" hidden></div>
    <div id="nextRow" class="next-row" hidden><button class="primary-button" type="button">Nächste Mission</button></div>
  `);
  wireOptions(mission.options);
}

function renderFlowQuiz(mission) {
  levelFrame(mission, `
    <div class="flow-wrap">${flowSvg(mission.flowKind || "even")}</div>
    <div class="option-grid">${mission.options.map((option, index) => optionButton(option.text, index)).join("")}</div>
    <div id="feedback" class="feedback" hidden></div>
    <div id="nextRow" class="next-row" hidden><button class="primary-button" type="button">Nächste Mission</button></div>
  `);
  wireOptions(mission.options);
}

function wireOptions(options) {
  const buttons = [...gameEl.querySelectorAll(".option-button")];
  const feedback = gameEl.querySelector("#feedback");
  const nextRow = gameEl.querySelector("#nextRow");
  let locked = false;

  buttons.forEach((button, index) => {
    button.addEventListener("click", () => {
      if (locked) return;
      const option = options[index];
      button.classList.add(option.correct ? "correct" : "wrong");
      feedback.hidden = false;
      feedback.textContent = option.hint;
      feedback.className = `feedback ${option.correct ? "good" : "bad"}`;

      if (option.correct) {
        locked = true;
        buttons.forEach(item => item.disabled = true);
        nextRow.hidden = false;
        nextRow.querySelector("button").addEventListener("click", completeMission, { once: true });
        launchSparkles();
      }
    });
  });
}

function renderMatch(mission) {
  const shuffledRight = shuffle([...mission.pairs]);
  levelFrame(mission, `
    <div class="match-layout">
      <div class="match-column">
        <h3>Links</h3>
        ${mission.pairs.map((pair, index) => `<button class="match-card left-card" type="button" data-index="${index}">${escapeHtml(pair.left)}</button>`).join("")}
      </div>
      <div class="match-column">
        <h3>Rechts</h3>
        ${shuffledRight.map(pair => `<button class="match-card right-card" type="button" data-info="${escapeAttr(pair.info)}">${escapeHtml(pair.right)}<br><small>${escapeHtml(pair.info)}</small></button>`).join("")}
      </div>
    </div>
    <p class="pair-count" id="pairCount">0 von ${mission.pairs.length} Paaren richtig</p>
    <div id="feedback" class="feedback" hidden></div>
    <div id="nextRow" class="next-row" hidden><button class="primary-button" type="button">Nächste Mission</button></div>
  `);

  let selectedLeft = null;
  let completed = 0;
  const feedback = gameEl.querySelector("#feedback");
  const pairCount = gameEl.querySelector("#pairCount");
  const nextRow = gameEl.querySelector("#nextRow");

  gameEl.querySelectorAll(".left-card").forEach(button => {
    button.addEventListener("click", () => {
      if (button.disabled) return;
      gameEl.querySelectorAll(".left-card").forEach(card => card.classList.remove("selected"));
      button.classList.add("selected");
      selectedLeft = button;
      feedback.hidden = false;
      feedback.className = "feedback";
      feedback.textContent = "Wähle jetzt rechts die passende Karte.";
    });
  });

  gameEl.querySelectorAll(".right-card").forEach(button => {
    button.addEventListener("click", () => {
      if (!selectedLeft || button.disabled) return;
      const pair = mission.pairs[Number(selectedLeft.dataset.index)];
      const correct = pair.info === button.dataset.info;
      feedback.hidden = false;

      if (correct) {
        selectedLeft.classList.remove("selected");
        selectedLeft.classList.add("correct");
        button.classList.add("correct");
        selectedLeft.disabled = true;
        button.disabled = true;
        completed += 1;
        pairCount.textContent = `${completed} von ${mission.pairs.length} Paaren richtig`;
        feedback.className = "feedback good";
        feedback.textContent = `Richtig: ${pair.left} passt zu ${pair.right}.`;
        selectedLeft = null;
        launchSparkles();
      } else {
        button.classList.add("wrong");
        setTimeout(() => button.classList.remove("wrong"), 650);
        feedback.className = "feedback bad";
        feedback.textContent = "Fast! Prüfe den Fachbegriff und die Erklärung noch einmal.";
      }

      if (completed === mission.pairs.length) {
        nextRow.hidden = false;
        nextRow.querySelector("button").addEventListener("click", completeMission, { once: true });
      }
    });
  });
}

function renderOrder(mission) {
  const picked = [];
  levelFrame(mission, `
    <div class="order-layout">
      <div class="order-panel">
        <h3>Bausteine</h3>
        ${mission.blocks.map((block, index) => `<button class="order-card" type="button" data-block="${escapeAttr(block)}" data-index="${index}">${escapeHtml(block)}</button>`).join("")}
      </div>
      <div class="order-result">
        <h3>Dein Ablauf</h3>
        <div id="pickedList" class="picked-list"></div>
      </div>
    </div>
    <p class="level-text">${escapeHtml(mission.note)}</p>
    <div id="feedback" class="feedback" hidden></div>
    <div class="next-row">
      <button id="undoOrder" class="ghost-button" type="button">Letzten Schritt entfernen</button>
      <button id="checkOrder" class="primary-button" type="button">Ablauf prüfen</button>
    </div>
  `);

  const pickedList = gameEl.querySelector("#pickedList");
  const feedback = gameEl.querySelector("#feedback");
  const buttons = [...gameEl.querySelectorAll(".order-card")];

  buttons.forEach(button => {
    button.addEventListener("click", () => {
      if (button.disabled) return;
      picked.push(button.dataset.block);
      button.disabled = true;
      button.classList.add("correct");
      renderPicked();
    });
  });

  gameEl.querySelector("#undoOrder").addEventListener("click", () => {
    const removed = picked.pop();
    if (!removed) return;
    const button = buttons.find(item => item.dataset.block === removed);
    if (button) {
      button.disabled = false;
      button.classList.remove("correct", "wrong");
    }
    feedback.hidden = true;
    renderPicked();
  });

  gameEl.querySelector("#checkOrder").addEventListener("click", () => {
    const complete = picked.length === mission.correctOrder.length;
    const right = complete && picked.every((block, index) => block === mission.correctOrder[index]);
    feedback.hidden = false;

    if (right) {
      feedback.className = "feedback good";
      feedback.textContent = "Super! Der Ablauf ist logisch.";
      launchSparkles();
      setTimeout(completeMission, 850);
    } else if (!complete) {
      feedback.className = "feedback bad";
      feedback.textContent = "Es fehlen noch Bausteine. Nutze alle Schritte.";
    } else {
      feedback.className = "feedback bad";
      feedback.textContent = "Noch nicht ganz. Prüfe Start, Eingabe, Entscheidung, Wiederholung und Ende.";
      buttons.forEach(button => button.classList.remove("wrong"));
      picked.forEach((block, index) => {
        if (block !== mission.correctOrder[index]) {
          const button = buttons.find(item => item.dataset.block === block);
          if (button) button.classList.add("wrong");
        }
      });
    }
  });

  function renderPicked() {
    pickedList.innerHTML = picked.length
      ? picked.map((block, index) => `<div class="picked-item">${index + 1}. ${escapeHtml(block)}</div>`).join("")
      : `<p class="level-text">Noch keine Bausteine ausgewählt.</p>`;
  }

  renderPicked();
}

function renderEndScreen() {
  updateStatus();
  progressBar.style.width = "100%";
  gameEl.innerHTML = `
    <section class="end-screen">
      <div class="robot" aria-hidden="true">
        <svg viewBox="0 0 160 160">
          <rect x="38" y="46" width="84" height="76" rx="18" class="bot-head" />
          <rect x="55" y="119" width="50" height="18" rx="8" class="bot-neck" />
          <circle cx="64" cy="80" r="9" class="bot-eye" />
          <circle cx="96" cy="80" r="9" class="bot-eye" />
          <path d="M58 99 Q80 118 102 99" class="bot-mouth" />
          <path d="M80 45 V25" class="bot-line" />
          <circle cx="80" cy="21" r="8" class="bot-dot" />
        </svg>
      </div>
      <p class="level-kicker">Boss-Test geschafft</p>
      <h2 class="end-title">Algo ist gerettet</h2>
      <p class="level-text" style="margin-left:auto;margin-right:auto;">Du hast Sequenz, Selektion und Iteration trainiert und Roboter Algo repariert.</p>
      <div class="end-score">Energie gesammelt: ${state.score} von ${missions.length} ⚡</div>
      <button class="primary-button" type="button" id="playAgain">Noch einmal spielen</button>
    </section>
  `;
  launchSparkles();
  gameEl.querySelector("#playAgain").addEventListener("click", resetGame);
}

function completeMission() {
  state.score += 1;
  state.index += 1;
  saveState();
  render();
}

function resetGame() {
  state.index = 0;
  state.score = 0;
  localStorage.removeItem(STORAGE_KEY);
  render();
}

resetButton.addEventListener("click", resetGame);

function optionButton(text, index) {
  return `<button class="option-button" type="button" data-index="${index}">${escapeHtml(text)}</button>`;
}

function launchSparkles() {
  const sparkles = confettiTemplate.content.cloneNode(true);
  gameEl.appendChild(sparkles);
  setTimeout(() => gameEl.querySelectorAll(".spark").forEach(spark => spark.remove()), 1100);
}

function shuffle(array) {
  return array
    .map(value => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttr(value) {
  return escapeHtml(value);
}

function flowSvg(kind) {
  if (kind === "points") return pointsFlowSvg();
  if (kind === "countdown") return countdownFlowSvg();
  return evenFlowSvg();
}

function pointsFlowSvg() {
  return `
  <svg class="flow-svg" viewBox="0 0 660 520" role="img" aria-label="Flussdiagramm Punkte bestanden">
    ${flowDefs()}
    <rect x="255" y="20" width="150" height="54" rx="27" class="flow-shape flow-start" /><text x="330" y="48" class="flow-text">Start</text>
    <path d="M330 75 V114" class="flow-line" />
    <polygon points="225,116 455,116 425,176 195,176" class="flow-shape flow-io" /><text x="330" y="146" class="flow-text">Punkte eingeben</text>
    <path d="M330 178 V220" class="flow-line" />
    <polygon points="330,220 455,292 330,364 205,292" class="flow-shape flow-decision" /><text x="330" y="292" class="flow-text">Punkte &gt;= 20?</text>
    <path d="M205 292 H110 V380" class="flow-line" /><text x="118" y="272" class="flow-small">Ja</text>
    <polygon points="60,380 250,380 225,446 35,446" class="flow-shape flow-io" /><text x="143" y="417" class="flow-text">bestanden</text>
    <path d="M455 292 H550 V380" class="flow-line" /><text x="525" y="272" class="flow-small">Nein</text>
    <polygon points="410,380 620,380 595,446 385,446" class="flow-shape flow-io" /><text x="503" y="417" class="flow-text">nicht bestanden</text>
    <path d="M143 446 V486 H295" class="flow-line" /><path d="M503 446 V486 H365" class="flow-line" />
    <rect x="295" y="459" width="70" height="54" rx="27" class="flow-shape flow-start" /><text x="330" y="487" class="flow-text">Ende</text>
  </svg>`;
}

function evenFlowSvg() {
  return `
  <svg class="flow-svg" viewBox="0 0 660 520" role="img" aria-label="Flussdiagramm gerade ungerade">
    ${flowDefs()}
    <rect x="255" y="20" width="150" height="54" rx="27" class="flow-shape flow-start" /><text x="330" y="48" class="flow-text">Start</text>
    <path d="M330 75 V114" class="flow-line" />
    <polygon points="225,116 455,116 425,176 195,176" class="flow-shape flow-io" /><text x="330" y="146" class="flow-text">Zahl eingeben</text>
    <path d="M330 178 V220" class="flow-line" />
    <polygon points="330,220 455,292 330,364 205,292" class="flow-shape flow-decision" /><text x="330" y="292" class="flow-text">Zahl gerade?</text>
    <path d="M205 292 H110 V380" class="flow-line" /><text x="118" y="272" class="flow-small">Ja</text>
    <polygon points="60,380 250,380 225,446 35,446" class="flow-shape flow-io" /><text x="143" y="405" class="flow-text">Ausgabe:</text><text x="143" y="429" class="flow-text">gerade Zahl</text>
    <path d="M455 292 H550 V380" class="flow-line" /><text x="525" y="272" class="flow-small">Nein</text>
    <polygon points="410,380 620,380 595,446 385,446" class="flow-shape flow-io" /><text x="503" y="405" class="flow-text">Ausgabe:</text><text x="503" y="429" class="flow-text">ungerade Zahl</text>
    <path d="M143 446 V486 H295" class="flow-line" /><path d="M503 446 V486 H365" class="flow-line" />
    <rect x="295" y="459" width="70" height="54" rx="27" class="flow-shape flow-start" /><text x="330" y="487" class="flow-text">Ende</text>
  </svg>`;
}

function countdownFlowSvg() {
  return `
  <svg class="flow-svg" viewBox="0 0 720 560" role="img" aria-label="Flussdiagramm Countdown mit Schleife">
    ${flowDefs()}
    <rect x="285" y="20" width="150" height="54" rx="27" class="flow-shape flow-start" /><text x="360" y="48" class="flow-text">Start</text>
    <path d="M360 75 V112" class="flow-line" />
    <rect x="255" y="112" width="210" height="62" class="flow-shape" /><text x="360" y="143" class="flow-text">zahl = 3</text>
    <path d="M360 176 V218" class="flow-line" />
    <polygon points="360,218 485,290 360,362 235,290" class="flow-shape flow-decision" /><text x="360" y="290" class="flow-text">zahl &gt; 0?</text>
    <path d="M360 362 V406" class="flow-line" /><text x="375" y="385" class="flow-small">Ja</text>
    <polygon points="255,406 485,406 455,468 225,468" class="flow-shape flow-io" /><text x="360" y="437" class="flow-text">Ausgabe zahl</text>
    <path d="M225 437 H120 V144 H253" class="flow-line" />
    <rect x="100" y="250" width="170" height="54" class="flow-shape" /><text x="185" y="277" class="flow-text">zahl = zahl - 1</text>
    <path d="M235 290 H185 V250" class="flow-line" />
    <path d="M485 290 H610 V476" class="flow-line" /><text x="505" y="270" class="flow-small">Nein</text>
    <rect x="575" y="476" width="70" height="54" rx="27" class="flow-shape flow-start" /><text x="610" y="504" class="flow-text">Ende</text>
  </svg>`;
}

function flowDefs() {
  return `
    <defs>
      <marker id="flowArrow" markerWidth="12" markerHeight="12" refX="10" refY="6" orient="auto"><path d="M0,0 L12,6 L0,12 z" fill="#14213d" /></marker>
      <style>
        .flow-shape { fill: #ffffff; stroke: #14213d; stroke-width: 3; }
        .flow-start { fill: #e7f8ef; }
        .flow-io { fill: #eaf4ff; }
        .flow-decision { fill: #fff5d6; }
        .flow-line { fill: none; stroke: #14213d; stroke-width: 3; marker-end: url(#flowArrow); }
        .flow-text { font: 700 20px system-ui, sans-serif; fill: #14213d; text-anchor: middle; dominant-baseline: middle; }
        .flow-small { font: 700 17px system-ui, sans-serif; fill: #14213d; }
      </style>
    </defs>`;
}

render();

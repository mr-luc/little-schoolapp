// Korrektur für Zuordnungsaufgaben:
// Rechts werden nur die Karten angezeigt, die wirklich zugeordnet werden sollen.
// Mission 4 darf die Fachbegriffe nicht zusätzlich rechts verraten.

renderMatch = function renderMatch(mission) {
  const shuffledRight = shuffle([...mission.pairs]);
  const isMission4 = String(mission.kicker || "").includes("Mission 4");

  levelFrame(mission, `
    <div class="match-layout">
      <div class="match-column">
        <h3>Links</h3>
        ${mission.pairs.map((pair, index) => `<button class="match-card left-card" type="button" data-index="${index}">${escapeHtml(pair.left)}</button>`).join("")}
      </div>
      <div class="match-column">
        <h3>Rechts</h3>
        ${shuffledRight.map(pair => `<button class="match-card right-card" type="button" data-info="${escapeAttr(pair.info)}">${escapeHtml(pair.right)}${isMission4 ? "" : `<br><small>${escapeHtml(pair.info)}</small>`}</button>`).join("")}
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
        feedback.textContent = "Fast! Prüfe den Fachbegriff und die Karte noch einmal.";
      }

      if (completed === mission.pairs.length) {
        nextRow.hidden = false;
        nextRow.querySelector("button").addEventListener("click", completeMission, { once: true });
      }
    });
  });
};

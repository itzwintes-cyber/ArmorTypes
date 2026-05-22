(function () {
  const DATA = window.GAME_DATA;
  if (!DATA) {
    console.error("Подключите data.js");
    return;
  }

  const appEl = document.getElementById("app");
  const screenMenu = document.getElementById("screen-menu");
  const screenGame = document.getElementById("screen-game");
  const screenStats = document.getElementById("screen-stats");
  const btnPlay = document.getElementById("btn-play");
  const btnMenu = document.getElementById("btn-menu");
  const btnMenuStats = document.getElementById("btn-menu-stats");
  const btnStatsMenu = document.getElementById("btn-stats-menu");
  const menuQuickStats = document.getElementById("menu-quick-stats");
  const menuStatOk = document.getElementById("menu-stat-ok");
  const menuStatKd = document.getElementById("menu-stat-kd");
  const menuStatTotal = document.getElementById("menu-stat-total");
  const slotsRoot = document.getElementById("slots");
  const poolEl = document.getElementById("pool");
  const poolHomes = {};
  const roundImage = document.getElementById("round-image");
  const roundTitle = document.getElementById("round-title");
  const btnBack = document.getElementById("btn-back");
  const btnCheck = document.getElementById("btn-check");
  const btnShowCorrect = document.getElementById("btn-show-correct");
  const btnStats = document.getElementById("btn-stats");
  const btnStatsBack = document.getElementById("btn-stats-back");
  const statOk = document.getElementById("stat-ok");
  const statMid = document.getElementById("stat-mid");
  const statBad = document.getElementById("stat-bad");
  const statKd = document.getElementById("stat-kd");
  const donutOk = document.getElementById("donut-ok");
  const donutMid = document.getElementById("donut-mid");
  const donutBad = document.getElementById("donut-bad");
  const statsSyncEl = document.getElementById("stats-sync-status");
  const btnLang = document.getElementById("btn-lang");
  const metaDesc = document.getElementById("meta-description");
  const donutAria = document.getElementById("donut-aria");

  const CHIP_MAX = DATA.CHIP_MAX_LEN || 14;
  const I18N = window.I18N;
  const DONUT_R = 48;
  const DONUT_C = 2 * Math.PI * DONUT_R;

  const stats = window.StatsStore ? StatsStore.load() : { ok: 0, mid: 0, bad: 0 };
  let roundIndex = 0;
  let roundOrder = [];
  let checked = false;
  let statsReturnTo = "menu";
  let gameStarted = false;

  const SVG_PLACEHOLDER =
    "data:image/svg+xml," +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 200"><rect fill="#12151c" width="320" height="200"/><text x="160" y="105" text-anchor="middle" fill="#b4f264" font-family="sans-serif" font-size="14">ArmorType</text></svg>'
    );

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function createRoundOrder() {
    if (!Array.isArray(DATA.rounds) || DATA.rounds.length === 0) return [];
    return shuffle(DATA.rounds.map((_, index) => index));
  }

  function getCurrentRound() {
    if (!roundOrder.length) roundOrder = createRoundOrder();
    const roundId = roundOrder[roundIndex % roundOrder.length];
    return DATA.rounds[roundId];
  }

  function chipDisplay(text, category) {
    let label = text;
    if (I18N) {
      const short = I18N.shortLabel(text);
      const full = I18N.valueLabel(text, category);
      label = short !== text ? short : full;
    } else {
      label = (DATA.shortLabels && DATA.shortLabels[text]) || text;
    }
    if (label.length <= CHIP_MAX) return label;
    return label.slice(0, CHIP_MAX - 1) + "…";
  }

  function applyStaticI18n() {
    if (!I18N) return;
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      el.textContent = I18N.t(el.dataset.i18n);
    });
    document.querySelectorAll("[data-i18n-aria]").forEach((el) => {
      el.setAttribute("aria-label", I18N.t(el.dataset.i18nAria));
    });
    if (btnLang) {
      btnLang.textContent = I18N.t("langBtn");
      btnLang.setAttribute("aria-label", I18N.t("langAria"));
    }
    document.title = I18N.t("pageTitle");
    if (metaDesc) metaDesc.setAttribute("content", I18N.t("pageDesc"));
    if (donutAria) donutAria.setAttribute("aria-label", I18N.t("donutAria"));
    refreshSlotsI18n();
    refreshPoolI18n();
    updateCheckButtonLabel();
  }

  function refreshSlotsI18n() {
    DATA.categories.forEach((cat) => {
      const meta = I18N?.categoryMeta(cat.id) || { slotTitle: cat.slotTitle, name: cat.name };
      const slot = slotsRoot.querySelector(`[data-category="${cat.id}"]`);
      if (slot) {
        const head = slot.querySelector(".slot__head");
        if (head) head.textContent = `${meta.slotTitle} · ${meta.name}`;
      }
      const ph = slotsRoot.querySelector(`[data-drop="${cat.id}"] .slot__placeholder`);
      if (ph) ph.textContent = I18N ? I18N.t("placeholderSlot") : "Клик сюда";
    });
  }

  function refreshPoolI18n() {
    DATA.categories.forEach((cat) => {
      const meta = I18N?.categoryMeta(cat.id) || { name: cat.name };
      const section = poolEl.querySelector(`[data-pool-section="${cat.id}"]`);
      const title = section?.querySelector(".pool-section__title");
      if (title) title.textContent = meta.name;
    });
    document.querySelectorAll(".chip").forEach((chip) => {
      const text = chip.dataset.text;
      const cat = chip.dataset.category;
      chip.textContent = chipDisplay(text, cat);
      chip.title = text;
    });
  }

  function updateCheckButtonLabel() {
    if (!btnCheck || !I18N) return;
    btnCheck.textContent = checked ? I18N.t("btnNext") : I18N.t("btnCheck");
  }

  const LIST_BY_CAT = { type: "types", era: "eras", country: "countries" };

  function shufflePoolSection(catId) {
    const home = poolHomes[catId];
    if (!home) return;
    const chips = [...home.querySelectorAll(".chip")];
    shuffle(chips).forEach((chip) => home.appendChild(chip));
  }

  function buildPoolUI() {
    poolEl.innerHTML = "";
    DATA.categories.forEach((cat) => {
      const list = DATA[LIST_BY_CAT[cat.id]] || [];
      const section = document.createElement("section");
      section.className = "pool-section";
      section.dataset.poolSection = cat.id;

      const title = document.createElement("h3");
      title.className = "pool-section__title";
      const meta = I18N?.categoryMeta(cat.id) || { name: cat.name };
      title.textContent = meta.name;

      const chipsWrap = document.createElement("div");
      chipsWrap.className = "pool-section__chips";
      chipsWrap.id = `pool-${cat.id}`;
      poolHomes[cat.id] = chipsWrap;

      shuffle(list).forEach((text) => {
        chipsWrap.appendChild(createChip(text, cat.id));
      });

      section.appendChild(title);
      section.appendChild(chipsWrap);
      poolEl.appendChild(section);
    });
  }

  const NEAR_COUNTRY = {
    "Соединённые Штаты": ["Канада"],
    "Канада": ["Соединённые Штаты"],
    "Россия": ["Советский Союз (СССР)"],
    "Советский Союз (СССР)": ["Россия"],
  };

  const TYPE_NEAR_GROUPS = [
    ["Танк ОБТ", "Танк средний", "Танк лёгкий", "Танк тяжёлый", "Танк-прим. BRDM"],
    ["БТР", "БТР-Д", "Бронеавтомобиль", "МРАП", "БМП", "БМД", "БМ боевая"],
    ["САУ", "САУ гаубица", "САУ САУС", "РСЗО", "РСЗО тяжёлая", "Артиллерия", "Гаубица букс.", "Миномёт", "Миномёт самоход."],
    ["ПУ ОТБР", "ПУ ЗРК", "ЗРК переносной", "ЗРК полевой", "ЗРК дальнего", "ПВО комплекс", "Береговой комплекс", "Береговая ПУ"],
    ["Истребитель", "Истребитель 5 пок.", "Истребитель-бомб.", "Перехватчик"],
    ["Штурмовик", "Штурмовик ВТО"],
    ["Бомбардировщик", "Бомбард. стратег.", "Бомбард. тактич."],
    ["Транспортный ВС", "Военно-трансп. ВС", "Самолёт-заправщик", "Самолёт АВАКС", "Самолёт РЭБ", "Разведывательный", "Учебно-боевой"],
    ["Вертолёт ударный", "Вертолёт трансп.", "Вертолёт развед.", "Вертолёт ПВО", "Вертолёт морской"],
    ["БПЛА ударный", "БПЛА развед.", "БПЛА-камикадзе"],
    ["Авианосец", "Лёгкий авианосец", "Крейсер", "Эсминец", "Фрегат", "Корвет", "Патрульный корабль", "Сторожевой корабль", "Десантный корабль", "Десантный катер", "Ракетный катер", "Торпедный катер", "Минный заградитель", "Подлодка ДПЛ", "Подлодка АПЛ", "Подлодка с ТНВ"],
  ];

  function scoreField(catId, picked, correct) {
    if (picked === correct) return "ok";

    if (catId === "era") {
      const pi = DATA.eras.indexOf(picked);
      const ci = DATA.eras.indexOf(correct);
      if (pi >= 0 && ci >= 0 && Math.abs(pi - ci) === 1) return "mid";
    }

    if (catId === "country") {
      if (NEAR_COUNTRY[picked]?.includes(correct) || NEAR_COUNTRY[correct]?.includes(picked)) {
        return "mid";
      }
    }

    if (catId === "type") {
      for (const group of TYPE_NEAR_GROUPS) {
        if (group.includes(picked) && group.includes(correct)) {
          return "mid";
        }
      }
    }

    return "bad";
  }

  function setDonutArc(circle, length, offset) {
    if (!circle) return;
    const len = Math.max(0, length);
    circle.style.strokeDasharray = `${len} ${DONUT_C - len}`;
    circle.style.strokeDashoffset = String(-offset);
  }

  function updateStatsUI() {
    statOk.textContent = String(stats.ok);
    statMid.textContent = String(stats.mid);
    statBad.textContent = String(stats.bad);

    const total = stats.ok + stats.mid + stats.bad;
    if (total === 0) {
      setDonutArc(donutOk, 0, 0);
      setDonutArc(donutMid, 0, 0);
      setDonutArc(donutBad, 0, 0);
      statKd.textContent = "0.0";
      updateSyncStatusUI();
      updateMenuStatsUI();
      return;
    }

    const okLen = (stats.ok / total) * DONUT_C;
    const midLen = (stats.mid / total) * DONUT_C;
    const badLen = (stats.bad / total) * DONUT_C;

    setDonutArc(donutOk, okLen, 0);
    setDonutArc(donutMid, midLen, okLen);
    setDonutArc(donutBad, badLen, okLen + midLen);

    statKd.textContent = formatKd();
    updateSyncStatusUI();
    updateMenuStatsUI();
  }

  function formatKd() {
    if (stats.bad === 0) return stats.ok > 0 ? "∞" : "0.0";
    return (stats.ok / stats.bad).toFixed(1);
  }

  function updateMenuStatsUI() {
    if (!menuQuickStats) return;
    const total = stats.ok + stats.mid + stats.bad;
    if (total === 0) {
      menuQuickStats.hidden = true;
      return;
    }
    menuQuickStats.hidden = false;
    if (menuStatOk) menuStatOk.textContent = String(stats.ok);
    if (menuStatKd) menuStatKd.textContent = formatKd();
    if (menuStatTotal) menuStatTotal.textContent = String(total);
  }

  // Обнови статы из Supabase (вызывается когда Supabase клиент готов)
  window.updateGameStatsFromSupabase = function(supabaseStats) {
    if (!supabaseStats) return;
    stats.ok = supabaseStats.ok || 0;
    stats.mid = supabaseStats.mid || 0;
    stats.bad = supabaseStats.bad || 0;
    updateStatsUI();
    console.log('[Supabase] Статы загружены:', supabaseStats);
  };

  function updateSyncStatusUI() {
    if (!statsSyncEl || !window.StatsStore) return;
    const cloud = StatsStore.isCloudEnabled();
    const state = StatsStore.getSyncState();
    statsSyncEl.hidden = false;
    if (!cloud) {
      statsSyncEl.textContent = I18N ? I18N.t("syncLocal") : "Статистика сохраняется в этом браузере.";
      statsSyncEl.dataset.state = "local";
      return;
    }
    if (state === "syncing") {
      statsSyncEl.textContent = I18N ? I18N.t("syncSyncing") : "Синхронизация с облаком…";
    } else if (state === "cloud") {
      statsSyncEl.textContent = I18N ? I18N.t("syncCloud") : "Сохранено в облаке.";
    } else if (state === "error") {
      statsSyncEl.textContent = I18N ? I18N.t("syncError") : "Облако недоступно — данные только локально.";
    } else {
      statsSyncEl.textContent = I18N ? I18N.t("syncReady") : "Облако подключено. Синхронизация после проверки.";
    }
    statsSyncEl.dataset.state = state;
  }

  function showScreen(name) {
    const isMenu = name === "menu";
    const isGame = name === "game";
    const isStats = name === "stats";

    if (screenMenu) {
      screenMenu.classList.toggle("screen--active", isMenu);
      screenMenu.hidden = !isMenu;
    }
    screenGame.classList.toggle("screen--active", isGame);
    screenGame.hidden = !isGame;
    screenStats.classList.toggle("screen--active", isStats);
    screenStats.hidden = !isStats;

    if (appEl) appEl.classList.toggle("app--menu", isMenu);

    if (isMenu) {
      clearPick();
      updateMenuStatsUI();
    }
  }

  function startGame() {
    gameStarted = true;
    roundOrder = createRoundOrder();
    roundIndex = 0;
    checked = false;
    updateCheckButtonLabel();
    loadRound();
    showScreen("game");
  }

  function goToMenu() {
    clearPick();
    showScreen("menu");
  }

  function createChip(text, category) {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "chip";
    chip.textContent = chipDisplay(text, category);
    chip.dataset.text = text;
    chip.dataset.category = category;
    chip.title = text;
    wireChipPick(chip);
    return chip;
  }

  function buildSlots() {
    slotsRoot.innerHTML = "";
    DATA.categories.forEach((cat) => {
      const slot = document.createElement("article");
      slot.className = "slot";
      slot.dataset.category = cat.id;

      const head = document.createElement("div");
      head.className = "slot__head";
      const meta = I18N?.categoryMeta(cat.id) || { slotTitle: cat.slotTitle, name: cat.name };
      head.textContent = `${meta.slotTitle} · ${meta.name}`;

      const drop = document.createElement("div");
      drop.className = "slot__drop";
      drop.dataset.drop = cat.id;

      const ph = document.createElement("span");
      ph.className = "slot__placeholder";
      ph.textContent = I18N ? I18N.t("placeholderSlot") : "Клик сюда";
      drop.appendChild(ph);

      wireDropTarget(drop);
      slot.appendChild(head);
      slot.appendChild(drop);
      slotsRoot.appendChild(slot);
    });
  }

  function getChipInSlot(drop) {
    return drop.querySelector(".chip");
  }

  function returnChipToPool(chip) {
    chip.classList.remove("chip--in-slot");
    chip.style.position = "";
    chip.style.left = "";
    chip.style.top = "";
    chip.style.pointerEvents = "";
    chip.style.zIndex = "";
    const home = poolHomes[chip.dataset.category] || poolEl;
    home.appendChild(chip);
  }

  function isPoolContainer(el) {
    return el?.classList?.contains("pool-section__chips") || el?.closest?.(".pool-section__chips");
  }

  function placeChipInSlot(chip, drop) {
    const ph = drop.querySelector(".slot__placeholder");
    if (ph) ph.hidden = true;

    const existing = getChipInSlot(drop);
    if (existing && existing !== chip) returnChipToPool(existing);

    chip.classList.add("chip--in-slot");
    drop.appendChild(chip);
  }

  function clearSlotStates() {
    document.querySelectorAll(".slot__drop").forEach((drop) => {
      drop.classList.remove("slot__drop--ok", "slot__drop--mid", "slot__drop--bad", "slot__drop--over");
    });
  }

  function resetSlots() {
    clearPick();
    document.querySelectorAll(".slot__drop").forEach((drop) => {
      const chip = getChipInSlot(drop);
      if (chip) returnChipToPool(chip);
      const ph = drop.querySelector(".slot__placeholder");
      if (ph) ph.hidden = false;
    });
    clearSlotStates();
    clearCorrectHints();
  }

  function loadRound() {
    checked = false;
    btnCheck.disabled = false;
    if (btnShowCorrect) btnShowCorrect.hidden = true;
    clearPick();
    clearSlotStates();
    resetSlots();

    const round = getCurrentRound();
    const titleRu = round.title || "";
    const titleShown = I18N ? I18N.roundTitle(titleRu) : titleRu;
    roundTitle.textContent = titleShown;
    const imgUrl =
      round.image ||
      (window.ROUND_IMAGES && window.ROUND_IMAGES[titleRu]) ||
      SVG_PLACEHOLDER;
    roundImage.classList.add("round-image--loading");
    roundImage.onload = () => roundImage.classList.remove("round-image--loading");
    roundImage.onerror = () => {
      roundImage.classList.remove("round-image--loading");
      roundImage.src = SVG_PLACEHOLDER;
    };
    roundImage.src = imgUrl;
    roundImage.alt = titleShown || (I18N ? I18N.t("roundAlt") : "Объект");

    shufflePoolSection("type");

    btnBack.disabled = roundIndex === 0;
  }

  function checkAnswers() {
    if (checked) return;
    const round = getCurrentRound();
    let allFilled = true;
    let roundStats = { ok: 0, mid: 0, bad: 0 }; // Статы текущего раунда

    DATA.categories.forEach((cat) => {
      const drop = slotsRoot.querySelector(`[data-drop="${cat.id}"]`);
      const chip = getChipInSlot(drop);
      drop.classList.remove("slot__drop--ok", "slot__drop--mid", "slot__drop--bad");

      if (!chip) {
        allFilled = false;
        drop.classList.add("slot__drop--bad");
        const ph = drop.querySelector(".slot__placeholder");
        if (ph) ph.hidden = true;
        stats.bad += 1;
        roundStats.bad += 1;
        return;
      }

      const picked = chip.dataset.text || chip.textContent;
      const correct = round.answers[cat.id];
      const result = scoreField(cat.id, picked, correct);
      drop.classList.add(`slot__drop--${result}`);
      stats[result] += 1;
      roundStats[result] += 1;
    });

    updateStatsUI();
    if (window.StatsStore) StatsStore.save(stats);
    
    // Сохрани в Supabase
    if (window.saveGameStats && typeof saveGameStats === 'function') {
      saveGameStats(roundStats.ok, roundStats.mid, roundStats.bad);
    }
    
    checked = true;
    updateCheckButtonLabel();

    if (btnShowCorrect) {
      btnShowCorrect.hidden = false;
      btnShowCorrect.disabled = false;
    }

    if (!allFilled) {
      btnCheck.disabled = false;
    }
  }

  function revealCorrectAnswers() {
    const round = getCurrentRound();
    DATA.categories.forEach((cat) => {
      const drop = slotsRoot.querySelector(`[data-drop="${cat.id}"]`);
      const chip = getChipInSlot(drop);
      const correct = round.answers[cat.id];
      const correctText = chipDisplay(correct, cat.id);

      drop.classList.remove("slot__drop--ok", "slot__drop--mid", "slot__drop--bad");
      drop.classList.add("slot__drop--hint");

      let hint = drop.querySelector(".slot__hint");
      if (!hint) {
        hint = document.createElement("div");
        hint.className = "slot__hint";
        drop.appendChild(hint);
      }
      hint.textContent = `Правильно: ${correctText}`;

      if (chip) {
        const picked = chip.dataset.text || chip.textContent;
        const result = scoreField(cat.id, picked, correct);
        drop.classList.remove("slot__drop--hint");
        drop.classList.add(`slot__drop--${result}`);
      }
    });
  }

  function clearCorrectHints() {
    document.querySelectorAll(".slot__hint").forEach((hint) => hint.remove());
    document.querySelectorAll(".slot__drop--hint").forEach((drop) => drop.classList.remove("slot__drop--hint"));
  }

  function nextRound() {
    roundIndex += 1;
    if (roundIndex >= roundOrder.length) {
      roundOrder = createRoundOrder();
      roundIndex = 0;
    }
    updateCheckButtonLabel();
    loadRound();
  }

  btnCheck.addEventListener("click", () => {
    if (!checked) checkAnswers();
    else nextRound();
  });

  btnShowCorrect?.addEventListener("click", () => {
    if (!checked) return;
    revealCorrectAnswers();
  });

  btnBack.addEventListener("click", () => {
    if (roundIndex > 0) {
      roundIndex -= 1;
      updateCheckButtonLabel();
      loadRound();
    }
  });

  btnLang?.addEventListener("click", () => {
    if (window.I18N) I18N.toggleLang();
  });

  window.addEventListener("armortype-lang", () => {
    applyStaticI18n();
    updateSyncStatusUI();
    if (gameStarted && !screenGame.hidden) {
      const round = getCurrentRound();
      const titleRu = round.title || "";
      const titleShown = I18N ? I18N.roundTitle(titleRu) : titleRu;
      if (roundTitle) roundTitle.textContent = titleShown;
      if (roundImage) roundImage.alt = titleShown || (I18N ? I18N.t("roundAlt") : "Объект");
    }
  });

  btnPlay?.addEventListener("click", startGame);

  btnMenu?.addEventListener("click", goToMenu);

  btnMenuStats?.addEventListener("click", () => {
    statsReturnTo = "menu";
    updateSyncStatusUI();
    showScreen("stats");
  });

  btnStats.addEventListener("click", () => {
    statsReturnTo = "game";
    updateSyncStatusUI();
    showScreen("stats");
  });

  btnStatsMenu?.addEventListener("click", () => showScreen("menu"));

  window.addEventListener("stats-sync", () => updateSyncStatusUI());

  btnStatsBack.addEventListener("click", () => {
    showScreen(statsReturnTo === "game" && gameStarted ? "game" : "menu");
  });

  /* ——— Выбор кликом: взял → клик по полю/пулу → отпустил повторным кликом по кубику ——— */
  let pickedChip = null;
  let pickOrigParent = null;

  function setDropTargetsActive(active) {
    document.querySelectorAll(".slot__drop").forEach((drop) => {
      drop.classList.toggle("slot__drop--ready", active);
    });
    document.querySelectorAll(".pool-section__chips").forEach((el) => {
      el.classList.toggle("pool-section__chips--ready", active);
    });
  }

  function clearPick() {
    if (pickedChip) {
      pickedChip.classList.remove("chip--picked");
    }
    pickedChip = null;
    pickOrigParent = null;
    setDropTargetsActive(false);
  }

  function pickChip(chip) {
    clearPick();
    pickedChip = chip;
    pickOrigParent = chip.parentElement;
    chip.classList.add("chip--picked");
    setDropTargetsActive(true);
  }

  function placePickedInDrop(drop) {
    if (!pickedChip) return;
    const chip = pickedChip;
    if (pickOrigParent?.classList?.contains("slot__drop") && pickOrigParent !== drop) {
      const oldPh = pickOrigParent.querySelector(".slot__placeholder");
      if (oldPh) oldPh.hidden = false;
    }
    placeChipInSlot(chip, drop);
    clearPick();
  }

  function returnPickedToPool() {
    if (!pickedChip) return;
    if (pickOrigParent?.classList?.contains("slot__drop")) {
      const oldPh = pickOrigParent.querySelector(".slot__placeholder");
      if (oldPh) oldPh.hidden = false;
    }
    returnChipToPool(pickedChip);
    clearPick();
  }

  function wireChipPick(chip) {
    chip.addEventListener("click", (e) => {
      if (checked) return;
      e.stopPropagation();

      if (pickedChip === chip) {
        clearPick();
        return;
      }

      if (pickedChip) {
        clearPick();
      }
      pickChip(chip);
    });
  }

  function wireDropTarget(drop) {
    drop.addEventListener("click", (e) => {
      if (checked) return;
      e.stopPropagation();

      const currentChip = getChipInSlot(drop);
      if (!pickedChip && currentChip) {
        pickChip(currentChip);
        return;
      }

      if (!pickedChip) return;
      placePickedInDrop(drop);
    });
  }

  poolEl.addEventListener("click", (e) => {
    if (checked || !pickedChip) return;
    if (e.target.closest(".chip")) return;
    if (e.target.closest(".pool-section__chips") || e.target.closest(".pool-section")) {
      returnPickedToPool();
    }
  });

  buildSlots();
  buildPoolUI();
  applyStaticI18n();
  updateStatsUI();
  updateSyncStatusUI();
  updateMenuStatsUI();
  showScreen("menu");
})();

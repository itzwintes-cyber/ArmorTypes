(function () {
  const STORAGE_KEY = "armortype-lang";

  const UI = {
    ru: {
      pageTitle: "ArmorType — опознай технику",
      pageDesc: "ArmorType: угадай тип, эпоху и страну военной техники.",
      brandTag: "тип · эпоха · страна",
      menuTagline: "Опознай военную технику",
      menuSub: "Тип · эпоха · страна",
      statCorrect: "Верно",
      statMid: "Почти",
      statBad: "Неверно",
      statRounds: "Раундов",
      play: "Играть",
      stats: "Статистика",
      howToPlay: "Как играть",
      rule1: "Сверху — образец техники. Угадай три параметра.",
      rule2: "Клик по кубику в пуле — выбор, клик по полю — установка.",
      rule3: "Повторный клик по кубику — отмена выбора.",
      rule4: "«Проверить» — оценка. Пустое поле = неверно.",
      rule5: "Эпоха «почти» — соседняя в списке эпох.",
      poolTitle: "Категории · эпохи · страны",
      btnMenu: "Меню",
      btnBack: "Назад",
      btnCheck: "Проверить",
      btnNext: "Далее",
      btnStats: "Статистика",
      statsTitle: "Статистика",
      legendOk: "верно",
      legendMid: "почти",
      legendBad: "неверно",
      hintKd: "K/D = верно ÷ неверно. Пустое поле при проверке — неверно.",
      btnStatsMenu: "В меню",
      btnStatsBack: "К игре",
      placeholderSlot: "Клик сюда",
      roundAlt: "Объект",
      donutAria: "Верно, почти и неверно",
      syncLocal: "Статистика сохраняется в этом браузере.",
      syncSyncing: "Синхронизация с облаком…",
      syncCloud: "Сохранено в облаке.",
      syncError: "Облако недоступно — данные только локально.",
      syncReady: "Облако подключено. Синхронизация после проверки.",
      langBtn: "EN",
      langAria: "Переключить на английский",
      catType: "Тип",
      catEra: "Эпоха",
      catCountry: "Страна",
      slot1: "Поле 1",
      slot2: "Поле 2",
      slot3: "Поле 3",
      ariaMenu: "ArmorType — меню",
      ariaGame: "ArmorType — игра",
      ariaStats: "ArmorType — статистика",
    },
    en: {
      pageTitle: "ArmorType — identify the vehicle",
      pageDesc: "ArmorType: guess the type, era, and country of military equipment.",
      brandTag: "type · era · country",
      menuTagline: "Identify military vehicles",
      menuSub: "Type · era · country",
      statCorrect: "Correct",
      statMid: "Close",
      statBad: "Wrong",
      statRounds: "Rounds",
      play: "Play",
      stats: "Statistics",
      howToPlay: "How to play",
      rule1: "A vehicle is shown above. Guess three parameters.",
      rule2: "Click a chip in the pool to pick it, then click a field to place.",
      rule3: "Click the same chip again to cancel selection.",
      rule4: "«Check» scores your answers. An empty field counts as wrong.",
      rule5: "Era «close» means the neighboring era in the list.",
      poolTitle: "Categories · eras · countries",
      btnMenu: "Menu",
      btnBack: "Back",
      btnCheck: "Check",
      btnNext: "Next",
      btnStats: "Statistics",
      statsTitle: "Statistics",
      legendOk: "correct",
      legendMid: "close",
      legendBad: "wrong",
      hintKd: "K/D = correct ÷ wrong. Empty field on check counts as wrong.",
      btnStatsMenu: "Main menu",
      btnStatsBack: "Back to game",
      placeholderSlot: "Click here",
      roundAlt: "Vehicle",
      donutAria: "Correct, close, and wrong",
      syncLocal: "Stats are saved in this browser.",
      syncSyncing: "Syncing to cloud…",
      syncCloud: "Saved to cloud.",
      syncError: "Cloud unavailable — local data only.",
      syncReady: "Cloud connected. Syncs after each check.",
      langBtn: "RU",
      langAria: "Switch to Russian",
      catType: "Type",
      catEra: "Era",
      catCountry: "Country",
      slot1: "Field 1",
      slot2: "Field 2",
      slot3: "Field 3",
      ariaMenu: "ArmorType — menu",
      ariaGame: "ArmorType — game",
      ariaStats: "ArmorType — statistics",
    },
  };

  const CAT_META = {
    ru: {
      type: { slotTitle: "Поле 1", name: "Тип" },
      era: { slotTitle: "Поле 2", name: "Эпоха" },
      country: { slotTitle: "Поле 3", name: "Страна" },
    },
    en: {
      type: { slotTitle: "Field 1", name: "Type" },
      era: { slotTitle: "Field 2", name: "Era" },
      country: { slotTitle: "Field 3", name: "Country" },
    },
  };

  let lang = "ru";

  function loadLang() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "en" || saved === "ru") lang = saved;
    } catch (_) {}
  }

  function t(key) {
    return UI[lang][key] ?? UI.ru[key] ?? key;
  }

  function getLang() {
    return lang;
  }

  function setLang(next) {
    const value = next === "en" ? "en" : "ru";
    if (value === lang) return;
    lang = value;
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (_) {}
    document.documentElement.lang = lang;
    window.dispatchEvent(new CustomEvent("armortype-lang", { detail: { lang } }));
  }

  function toggleLang() {
    setLang(lang === "ru" ? "en" : "ru");
  }

  function categoryMeta(catId) {
    return CAT_META[lang][catId] || CAT_META.ru[catId];
  }

  function valueLabel(text, category) {
    if (!text || lang === "ru") return text;
    const maps = window.I18N_DATA || {};
    if (category === "type") return maps.typeEn?.[text] || text;
    if (category === "era") return maps.eraEn?.[text] || text;
    if (category === "country") return maps.countryEn?.[text] || text;
    return text;
  }

  function shortLabel(text) {
    if (!text || lang === "ru") {
      const ruShort = window.GAME_DATA?.shortLabels?.[text];
      return ruShort || text;
    }
    const maps = window.I18N_DATA || {};
    return maps.shortEn?.[text] || maps.countryEn?.[text] || maps.typeEn?.[text] || text;
  }

  function roundTitle(title) {
    if (!title || lang === "ru") return title || "";
    const maps = window.I18N_DATA || {};
    return maps.roundTitleEn?.[title] || title;
  }

  loadLang();
  document.documentElement.lang = lang;

  window.I18N = {
    t,
    getLang,
    setLang,
    toggleLang,
    categoryMeta,
    valueLabel,
    shortLabel,
    roundTitle,
  };
})();

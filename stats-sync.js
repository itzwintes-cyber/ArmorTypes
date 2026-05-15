/**
 * Статистика: localStorage на устройстве + опционально Supabase (см. config.example.js).
 */
(function () {
  const STORAGE_KEY = "armortype-stats-v1";
  const PLAYER_KEY = "armortype-player-id";

  function cfg() {
    return window.GAME_CONFIG || {};
  }

  function getPlayerId() {
    try {
      let id = localStorage.getItem(PLAYER_KEY);
      if (!id) {
        id =
          typeof crypto !== "undefined" && crypto.randomUUID
            ? crypto.randomUUID()
            : "p-" + Date.now() + "-" + Math.random().toString(36).slice(2, 9);
        localStorage.setItem(PLAYER_KEY, id);
      }
      return id;
    } catch {
      return "anonymous";
    }
  }

  function normalize(raw) {
    if (!raw || typeof raw !== "object") return { ok: 0, mid: 0, bad: 0 };
    return {
      ok: Math.max(0, Number(raw.ok) || 0),
      mid: Math.max(0, Number(raw.mid) || 0),
      bad: Math.max(0, Number(raw.bad) || 0),
    };
  }

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { ok: 0, mid: 0, bad: 0 };
      return normalize(JSON.parse(raw));
    } catch {
      return { ok: 0, mid: 0, bad: 0 };
    }
  }

  function save(stats) {
    const data = normalize(stats);
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ ...data, updatedAt: Date.now() })
      );
    } catch (_) {}
    queueCloudSync(data);
    return data;
  }

  function isCloudEnabled() {
    const c = cfg();
    return Boolean(c.supabaseUrl && c.supabaseAnonKey);
  }

  let syncTimer = null;
  let lastSyncState = "local";

  function getSyncState() {
    return lastSyncState;
  }

  function queueCloudSync(stats) {
    if (!isCloudEnabled()) {
      lastSyncState = "local";
      return;
    }
    clearTimeout(syncTimer);
    syncTimer = setTimeout(() => cloudSync(stats), 600);
  }

  async function cloudSync(stats) {
    const c = cfg();
    const table = c.statsTable || "player_stats";
    const url = `${c.supabaseUrl.replace(/\/$/, "")}/rest/v1/${table}`;
    const body = {
      player_id: getPlayerId(),
      ok: stats.ok,
      mid: stats.mid,
      bad: stats.bad,
      updated_at: new Date().toISOString(),
    };
    if (c.playerName) body.display_name = String(c.playerName).slice(0, 32);

    lastSyncState = "syncing";
    window.dispatchEvent(new CustomEvent("stats-sync", { detail: { state: lastSyncState } }));

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: c.supabaseAnonKey,
          Authorization: `Bearer ${c.supabaseAnonKey}`,
          Prefer: "resolution=merge-duplicates",
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(String(res.status));
      lastSyncState = "cloud";
    } catch (e) {
      console.warn("Облачная статистика:", e);
      lastSyncState = "error";
    }
    window.dispatchEvent(new CustomEvent("stats-sync", { detail: { state: lastSyncState } }));
  }

  window.StatsStore = {
    load,
    save,
    getPlayerId,
    isCloudEnabled,
    getSyncState,
    cloudSync,
  };
})();

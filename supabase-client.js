// Supabase клиент для работы с БД
const SUPABASE_URL = 'https://yeqxtrvenimfcjuyuhqu.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InllcXh0cnZlbmltZmNqdXl1aHF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk0NjI5MTAsImV4cCI6MjA1NTAzODkxMH0.cI6n8GlHDwFh3-_ZhLrjSmPXYiGVnLHO0Aq_VnvLJHI';

let currentPlayerId = null;
let currentUsername = null;

// Загруз Supabase SDK с CDN
const loadSupabaseSDK = () => {
  if (window.supabase) {
    initSupabase();
    return;
  }
  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
  script.onload = initSupabase;
  document.head.appendChild(script);
};

const initSupabase = () => {
  window.SupabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  restoreOrCreatePlayer().then(() => {
    // После инициализации игрока, загрузи статы из Supabase
    loadAndUpdateStats();
    if (window.updateGameStatsFromSupabase && window.supabaseLoadedPlayerSummary) {
      window.updateGameStatsFromSupabase(window.supabaseLoadedPlayerSummary);
      window.supabaseLoadedPlayerSummary = null;
    }
  });
};

// Загрузи статы и обнови глобальный объект stats в game.js
const loadAndUpdateStats = async () => {
  const summary = await loadPlayerSummary();
  if (!summary) return;
  if (window.updateGameStatsFromSupabase) {
    window.updateGameStatsFromSupabase(summary);
  } else {
    window.supabaseLoadedPlayerSummary = summary;
  }
};

// Восстанови или создай игрока
const restoreOrCreatePlayer = async () => {
  const stored = localStorage.getItem('playerData');
  if (stored) {
    const data = JSON.parse(stored);
    currentPlayerId = data.id;
    currentUsername = data.username;
    console.log(`[Supabase] Восстановлен игрок: ${currentUsername}`);
    return;
  }
  
  // Создай нового анонимного игрока
  currentUsername = `Player_${Math.random().toString(36).substr(2, 9)}`;
  try {
    const { data, error } = await window.SupabaseClient
      .from('players')
      .insert([{ username: currentUsername }])
      .select();
    
    if (error) throw error;
    currentPlayerId = data[0].id;
    localStorage.setItem('playerData', JSON.stringify({ id: currentPlayerId, username: currentUsername }));
    console.log(`[Supabase] Создан новый игрок: ${currentUsername}`);
  } catch (err) {
    console.error('[Supabase] Ошибка при создании игрока:', err);
  }
};

// Сохрани статистику раунда
const saveGameStats = async (ok, mid, bad) => {
  if (!currentPlayerId || !window.SupabaseClient) {
    console.warn('[Supabase] Игрок не инициализирован');
    return false;
  }

  try {
    const { data, error } = await window.SupabaseClient
      .from('game_stats')
      .insert([{ player_id: currentPlayerId, ok, mid, bad }]);
    
    if (error) throw error;
    console.log('[Supabase] Статистика сохранена:', { ok, mid, bad });
    return true;
  } catch (err) {
    console.error('[Supabase] Ошибка при сохранении:', err);
    return false;
  }
};

// Загрузи всю статистику игрока
const loadPlayerStats = async () => {
  if (!currentPlayerId || !window.SupabaseClient) return null;

  try {
    const { data, error } = await window.SupabaseClient
      .from('game_stats')
      .select('*')
      .eq('player_id', currentPlayerId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('[Supabase] Ошибка при загрузке статистики:', err);
    return null;
  }
};

// Загрузи сводку (всего ok/mid/bad)
const loadPlayerSummary = async () => {
  if (!currentPlayerId || !window.SupabaseClient) return null;

  try {
    const { data, error } = await window.SupabaseClient
      .from('game_stats')
      .select('ok, mid, bad')
      .eq('player_id', currentPlayerId);
    
    if (error) throw error;
    
    const summary = data.reduce(
      (acc, row) => ({
        ok: acc.ok + (row.ok || 0),
        mid: acc.mid + (row.mid || 0),
        bad: acc.bad + (row.bad || 0)
      }),
      { ok: 0, mid: 0, bad: 0 }
    );
    
    return summary;
  } catch (err) {
    console.error('[Supabase] Ошибка при загрузке сводки:', err);
    return null;
  }
};


// Сделай переменные доступными
Object.defineProperty(window, 'currentPlayerId', {
  get: () => currentPlayerId,
  set: (val) => { currentPlayerId = val; }
});

// Запусти загрузку SDK
loadSupabaseSDK();

/**
 * Локально: скопируйте в config.js (config.js в .gitignore).
 * На GitHub Pages: Settings → Secrets → SUPABASE_URL и SUPABASE_ANON_KEY.
 *
 * Supabase (бесплатный тариф): проект → SQL:
 *
 *   create table player_stats (
 *     player_id text primary key,
 *     display_name text,
 *     ok int default 0,
 *     mid int default 0,
 *     bad int default 0,
 *     updated_at timestamptz default now()
 *   );
 *   alter table player_stats enable row level security;
 *   create policy "anon upsert own" on player_stats for all
 *     using (true) with check (true);
 *
 * (для продакшена сузьте политики RLS под ваш сценарий)
 */
window.GAME_CONFIG = {
  supabaseUrl: "",
  supabaseAnonKey: "",
  statsTable: "player_stats",
  playerName: "",
};

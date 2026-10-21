// Fyll i från Supabase: Project Settings → API (Project URL och publishable/anon key).
// Nyckeln är publik och får ligga i koden – skyddet sköts av RLS i databasen.
window.SVAMP_CONFIG = {
  supabaseUrl: 'https://DITT-PROJEKT.supabase.co',
  supabaseAnonKey: 'DIN-PUBLISHABLE-ELLER-ANON-KEY'
};

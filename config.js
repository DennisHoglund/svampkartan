// Delar Supabase-projekt med Jaktvind. Svampkartans tabeller har prefixet svamp_
// och bucketen heter svamp-foton, så inget krockar med Jaktvinds data.
// Nyckeln är publik och får ligga i koden – skyddet sköts av RLS i databasen.
window.SVAMP_CONFIG = {
  supabaseUrl: 'https://sjdznlmnvubqscftdkoj.supabase.co',
  supabaseAnonKey: 'sb_publishable_bKrpOKc38I20NvhC2vjmhw_YyZbm94Q'
};

// =====================================================================
// data.js  -  PENGATURAN
// Data utama gunung, jalur, dan peralatan sekarang diedit di Google Sheets.
// =====================================================================

// ---------- 1. PENGATURAN SUPABASE (untuk ulasan) ----------
const SUPABASE_URL = "https://bmehetqlcxkyfobbonhf.supabase.co";
const SUPABASE_KEY = "sb_publishable_0bluMs-VWPrKliVLxJfjgQ_j6keGz_U";

// ---------- 2. GOOGLE SHEETS ----------
// A) MODE LANGSUNG (disarankan, perubahan hampir langsung terlihat setelah refresh):
//    Salin ID dari alamat Sheet: docs.google.com/spreadsheets/d/  ID-NYA-DI-SINI  /edit
//    Lalu di Sheets: Bagikan > Akses umum > "Siapa saja yang memiliki link" > Pelihat (Viewer).
//    Tab: Gunung, Jalur, Peralatan (website membacanya lewat nomor gid dari link di bawah)
const SHEET_ID = "1jj3MvT2C-Awf3GrjnLVHbbLdF5zJOlBTGI-BKVdRfBA";

// B) MODE TERBIT (cadangan): link dari File > Bagikan > Publikasikan di web (format CSV).
//    Perubahan bisa tertunda sekitar 5 menit.
const SHEET_GUNUNG = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ2YrDfwkMh6D-eSR1GY1AoVlULNqKWHkyL4uMK5OXAncoeKfTtYhikLQirlp8gX7ondhdimkkvj_zk/pub?gid=0&single=true&output=csv";
const SHEET_JALUR  = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ2YrDfwkMh6D-eSR1GY1AoVlULNqKWHkyL4uMK5OXAncoeKfTtYhikLQirlp8gX7ondhdimkkvj_zk/pub?gid=765965360&single=true&output=csv";
const SHEET_GEAR   = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ2YrDfwkMh6D-eSR1GY1AoVlULNqKWHkyL4uMK5OXAncoeKfTtYhikLQirlp8gX7ondhdimkkvj_zk/pub?gid=1682034692&single=true&output=csv";   // tab Peralatan

// ---------- 3. DATA CADANGAN ----------
// Data gunung, jalur, dan peralatan diambil dari Google Sheets.
// Baris di bawah ini JANGAN dihapus (dibutuhkan app.js).
const GUNUNG = {};

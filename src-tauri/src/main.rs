#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

use r2d2_sqlite::SqliteConnectionManager;

fn main() {
  let mut path = dirs::cache_dir().unwrap();
  path.push("tauri-app.sql");
  let manager = r2d2_sqlite::SqliteConnectionManager::file(path);
  let pool = r2d2::Pool::new(manager).unwrap();
  let conn = pool.get().unwrap();
  conn
    .execute(
      "CREATE TABLE IF NOT EXISTS kvs (k TEXT PRIMARY KEY, v TEXT NOT NULL)",
      [],
    )
    .unwrap();
  tauri::Builder::default()
    .manage(pool)
    .invoke_handler(tauri::generate_handler![persist_entry, fetch_entries])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

#[tauri::command]
fn fetch_entries(pool: tauri::State<r2d2::Pool<SqliteConnectionManager>>) -> Vec<(String, String)> {
  println!("fetching all entries");
  let conn = pool.get().unwrap();
  let mut stmt = conn.prepare("SELECT k, v FROM kvs ORDER BY k").unwrap();
  stmt
    .query_map([], |row| Ok((row.get_unwrap("k"), row.get_unwrap("v"))))
    .unwrap()
    .collect::<Result<_, _>>()
    .unwrap()
}

#[tauri::command]
fn persist_entry(
  pool: tauri::State<r2d2::Pool<SqliteConnectionManager>>,
  key: String,
  value: String,
) {
  println!("recording {} = {}", key, value);
  let conn = pool.get().unwrap();
  conn
    .execute(
      "INSERT OR REPLACE INTO kvs (k, v) VALUES (?, ?)",
      [key, value],
    )
    .unwrap();
}

#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

fn main() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![
      my_custom_command,
      persist_entry,
      fetch_entries
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

#[tauri::command]
fn my_custom_command(name: String) -> String {
  format!("Hello, {}", name)
}

#[tauri::command]
fn fetch_entries() -> Vec<(String, String)> {
  println!("fetching all entries");
  let mut path = dirs::cache_dir().unwrap();
  path.push("tauri-app.sql");
  let conn = rusqlite::Connection::open(path).unwrap();
  conn
    .execute(
      "CREATE TABLE IF NOT EXISTS kvs (k TEXT PRIMARY KEY, v TEXT NOT NULL)",
      [],
    )
    .unwrap();
  let mut stmt = conn.prepare("SELECT k, v FROM kvs").unwrap();
  stmt
    .query_map([], |row| Ok((row.get_unwrap("k"), row.get_unwrap("v"))))
    .unwrap()
    .collect::<Result<_, _>>()
    .unwrap()
}

#[tauri::command]
fn persist_entry(key: String, value: String) {
  println!("recording {} = {}", key, value);
  let mut path = dirs::cache_dir().unwrap();
  path.push("tauri-app.sql");
  let conn = rusqlite::Connection::open(path).unwrap();
  conn
    .execute(
      "CREATE TABLE IF NOT EXISTS kvs (k TEXT PRIMARY KEY, v TEXT NOT NULL)",
      [],
    )
    .unwrap();
  conn
    .execute(
      "INSERT OR REPLACE INTO kvs (k, v) VALUES (?, ?)",
      [key, value],
    )
    .unwrap();
}

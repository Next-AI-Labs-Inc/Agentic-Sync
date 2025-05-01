#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

use std::{process::Command, thread, time::Duration};

#[tauri::command]
fn launch_agent_terminal(command: String) -> Result<String, String> {
  // Platform-specific terminal launching
  #[cfg(target_os = "macos")]
  {
    // Add delay mechanism to Claude command to allow terminal to initialize
    // This creates a command that waits 2 seconds before executing Claude
    let command_with_delay = format!("sleep 2 && {}", command);
    
    let status = Command::new("osascript")
      .args(&["-e", &format!("tell application \"Terminal\" to do script \"{}\"", command_with_delay)])
      .status()
      .map_err(|e| e.to_string())?;
    
    if status.success() {
      Ok("Terminal launched successfully".to_string())
    } else {
      Err("Failed to launch terminal".to_string())
    }
  }

  #[cfg(target_os = "windows")]
  {
    // Add delay mechanism to Claude command to allow terminal to initialize
    let command_with_delay = format!("timeout /t 2 && {}", command);
    
    let status = Command::new("cmd")
      .args(&["/C", "start", "cmd", "/k", &command_with_delay])
      .status()
      .map_err(|e| e.to_string())?;
    
    if status.success() {
      Ok("Terminal launched successfully".to_string())
    } else {
      Err("Failed to launch terminal".to_string())
    }
  }

  #[cfg(target_os = "linux")]
  {
    // Add delay mechanism to Claude command to allow terminal to initialize
    let command_with_delay = format!("sleep 2 && {};bash", command);
    
    // Try common Linux terminals
    let terminals = vec![
      ("gnome-terminal", vec!["--", "bash", "-c", &command_with_delay]),
      ("xterm", vec!["-e", &command_with_delay]),
      ("konsole", vec!["--noclose", "-e", &command_with_delay])
    ];

    for (terminal, args) in terminals {
      if let Ok(status) = Command::new(terminal).args(args).status() {
        if status.success() {
          return Ok("Terminal launched successfully".to_string());
        }
      }
    }
    
    Err("Failed to launch terminal on Linux".to_string())
  }
}

fn main() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![launch_agent_terminal])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
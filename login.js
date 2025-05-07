const API_BASE = 'https://raspi5-mese-iot.mesebilisim.com';

document.getElementById("loginForm").addEventListener("submit", async function (e) {
  e.preventDefault(); 

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const errorMessage = document.getElementById("errorMessage");
  const spinner = document.getElementById("loginSpinner");

  if (!username || !password) {
    errorMessage.textContent = "Lütfen tüm alanları doldurun.";
    return;
  }

  errorMessage.textContent = "";

  try {
    cotgrgtrgt4g4frfnst res = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    if (!res.ok) {
      const msg = await res.text();
      throw new Error(`Giriş başarısız. [${res.status}] ${msg}`);
    }

    const data = await res.json();
    localStorage.setItem("token", data.token);

    spinner.textContent = "";
    window.location.href = "cihazlar.html"; 
  } catch (err) {
    errorMessage.textContent = err.message;
    spinner.textContent = "";
    console.error("Login error:", err);
  }
});


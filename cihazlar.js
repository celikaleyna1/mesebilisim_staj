const API_BASE = 'https://raspi5-mese-iot.mesebilisim.com';
const token = localStorage.getItem("token");

const cihazSec = document.getElementById('cihazlar');
const veriTablosu = document.getElementById('veriTablosu');
const loading = document.getElementById('loading');
const cihazBilgi = document.getElementById('cihazBilgi');
const secimYok = document.getElementById('secimYok');


const cihazIdMap = {
  "AracTakip": "c67edcc0-2821-11f0-80d8-0397a884a69d",
  "default": "f6574860-26a5-11f0-9843-970a8cb0383d"
};

document.addEventListener("DOMContentLoaded", () => {
  if (!token) {
    alert("Giriş yapmanız gerekiyor.");
    window.location.href = "login.html";
    return;
  }
});


document.getElementById("verileriGetir").addEventListener("click", async () => {
  const secilenKey = cihazSec.value;
  const secilenId = cihazIdMap[secilenKey];

  if (!secilenId) {
    cihazBilgi.style.display = "none";
    secimYok.style.display = "block";
    return;
  }

  secimYok.style.display = "none";
  cihazBilgi.style.display = "none";
  loading.style.display = "block";
  veriTablosu.innerHTML = "";

  try {
  
    const cihazRes = await fetch(`${API_BASE}/api/device/${secilenId}`, {
      headers: { 'X-Authorization': `Bearer ${token}` }
    });

    if (!cihazRes.ok) {
      throw new Error("Cihaz bilgisi alınamadı.");
    }

    const cihaz = await cihazRes.json();
    document.getElementById("cihazAdi").textContent = cihaz.name;
    document.getElementById("cihazId").textContent = cihaz.id.id;
    document.getElementById("deviceProfile").textContent = cihaz.type;
    document.getElementById("durum").textContent = cihaz.additionalInfo?.description || "Bilinmiyor";

    const telemetryRes = await fetch(`${API_BASE}/api/plugins/telemetry/DEVICE/${secilenId}/values/timeseries?keys=temperature,humidity,speed,latitude,longitude`, {
      headers: { 'X-Authorization': `Bearer ${token}` }
    });

    if (!telemetryRes.ok) {
      throw new Error("Telemetri verisi alınamadı.");
    }

    const telemetry = await telemetryRes.json();

    Object.entries(telemetry).forEach(([key, values]) => {
      values.forEach(item => {
        const tr = document.createElement("tr");
        const tarih = new Date(item.ts).toLocaleString();
        tr.innerHTML = `
          <td>${tarih}</td>
          <td>${key}</td>
          <td>${item.value}</td>
        `;
        veriTablosu.appendChild(tr);
      });
    });

    cihazBilgi.style.display = "block";
  } catch (err) {
    alert("Veriler alınamadı: " + err.message);
    console.error(err);
  } finally {
    loading.style.display = "none";
  }
});

document.querySelector(".cıkıs-buton").addEventListener("click", () => {
  localStorage.removeItem("token");
  location.href = "login.html";
});

document.getElementById("pdfAktar").addEventListener("click", function () {
    if (cihazBilgi.style.display === "none") {
        alert("PDF oluşturmak için önce bir cihaz seçin!");
        return;
    }

    const doc = new jspdf.jsPDF();
    doc.text("Cihaz Telemetri Verileri", 14, 10);

    const rows = [];
    document.querySelectorAll("#veriTablosu tr").forEach(tr => {
        const row = Array.from(tr.querySelectorAll("td")).map(td =>td.textContent);
        rows.push(row);
    });

    doc.autoTable({
        head: [['Tarih/Saat', 'Veri Tipi', 'Değer']],
        body: rows,
        startY: 20
    });

    doc.save("cihaz_verileri.pdf");
});

document.getElementById("excelbtn").addEventListener("click",function(){
    if (cihazBilgi.style.display ==="none") {
        alert("Excel oluşturmak için önce bir cihaz seçin!");
        return; 
    }

    const table = document.getElementById("veriTablo");

    const cihazAdi =document.getElementById("cihazAdi").textContent;
    const cihazId = document.getElementById("cihazId").textContent;
    const deviceProfile = document.getElementById("deviceProfile").textContent;
    const durum = document.getElementById("durum").textContent;

    const cihazBilgiData = [
        ["Cihaz Bilgileri"],
        ["Cihaz Adı", cihazAdi],
        ["Cihaz ID", cihazId],
        ["Device Profile", deviceProfile],
        ["Durum", durum],
        [],
        ["Telemetri Verileri"],
        ["Tarih/Saat", "Veri Tipi", "Değer"]
    ];

    const veriSatirlari = [];
    document.querySelectorAll("#veriTablosu tr").forEach(tr => {
        const satir = Array.from(tr.querySelectorAll("td")).map(td => td.textContent.trim());
        veriSatirlari.push(satir);
    });

    const finalVeri = cihazBilgiData.concat(veriSatirlari);

    const ws = XLSX.utils.aoa_to_sheet(finalVeri); 
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Cihaz Verileri");
    XLSX.writeFile(wb, "cihaz_verileri.xlsx");
});

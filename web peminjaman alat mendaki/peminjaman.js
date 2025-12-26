/* ========================================================= 
   peminjaman.js — FINAL FIX + NOTIFIKASI ADMIN REAL-TIME 
   Multi alat + No HP + Admin clean + GAMBAR + NOTIFIKASI 
   ========================================================= */ 
 
/* ========== DARK MODE ========== */ 
function toggleDarkMode() { 
  document.body.classList.toggle("dark"); 
  localStorage.setItem("darkMode", document.body.classList.contains("dark")); 
} 
if (localStorage.getItem("darkMode") === "true") { 
  document.body.classList.add("dark"); 
} 
 
/* ========== DEFAULT ALAT + FOTO ========== */ 
const defaultAlat = [ 
  "Tenda Dome 2 Orang", 
  "Carrier 60L",  
  "Sleeping Bag", 
  "Tracking Pole", 
  "Sepatu Hiking", 
  "Kompor Portable", 
  "Jaket Gunung", 
  "Headlamp" 
]; 
 
const fotoAlat = { 
  "Tenda Dome 2 Orang": "gambar/tenda.jpg", 
  "Carrier 60L": "gambar/carrier.jpg", 
  "Sleeping Bag": "gambar/sleepingbag.jpg", 
  "Tracking Pole": "gambar/trackingpole.jpg", 
  "Sepatu Hiking": "gambar/sepatu.jpg", 
  "Kompor Portable": "gambar/kompor.jpg", 
  "Jaket Gunung": "gambar/jaket.jpg", 
  "Headlamp": "gambar/headlamp.jpg" 
}; 
 
/* ========== FALLBACK IMAGE ========== */ 
const fallbackImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjUiIGN5PSIyNSIgcj0iMjUiIGZpbGw9IiNGRkYiLz4KPHRleHQgeD0iMjUiIHk9IjMyIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOUM5OUM5IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4K'; 
 
/* ========== STORAGE ========== */ 
let daftar = (() => { 
  try { 
    const d = JSON.parse(localStorage.getItem("peminjaman")); 
    return Array.isArray(d) ? d : []; 
  } catch { 
    return []; 
  } 
})(); 
 
daftar = daftar.map(item => ({ 
  ...item, 
  alat: Array.isArray(item.alat) 
    ? item.alat 
    : String(item.alat || "").split(",").map(a => a.trim()) 
})); 
localStorage.setItem("peminjaman", JSON.stringify(daftar)); 
 
let daftarAlat = (() => { 
  try { 
    const raw = JSON.parse(localStorage.getItem("daftarAlat")); 
    if (Array.isArray(raw) && raw.length) return raw; 
  } catch {} 
  localStorage.setItem("daftarAlat", JSON.stringify(defaultAlat)); 
  return [...defaultAlat]; 
})(); 
 
/* ========== STATE ========== */ 
let selectedAlat = []; 
let isAdmin = false; 
 
/* ========== HELPER ========== */ 
const $ = (id) => document.getElementById(id); 
const escapeHtml = (s) => 
  String(s || "") 
    .replaceAll("&", "&amp;") 
    .replaceAll("<", "&lt;") 
    .replaceAll(">", "&gt;"); 
 
/* ========== NOTIFIKASI ADMIN (BROWSER + TOAST) ========== */ 
async function kirimNotifikasiAdmin(pesananBaru) { 
  // 1. BROWSER NOTIFICATION (kalau permission granted) 
  if ("Notification" in window && Notification.permission === "granted") { 
    const notif = new Notification("🔔 PEMINJAMAN BARU!", { 
      body: `${pesananBaru.nama} memesan ${pesananBaru.alat.join(", ")}`, 
      icon: "gambar/icon.png", // Icon notifikasi (opsional) 
      badge: "gambar/icon.png", 
      tag: "peminjaman-baru" 
    }); 
     
    // Auto close setelah 8 detik 
    setTimeout(() => notif.close(), 8000); 
  } 
 
  // 2. TOAST NOTIFICATION (selalu muncul) 
  tampilkanToast(`🔔 PEMINJAMAN BARU: ${pesananBaru.nama}`, "success"); 
 
  // 3. SOUND NOTIFICATION (beep!) 
  playNotificationSound(); 
 
  // 4. AUTO REFRESH TABLE ADMIN (kalau admin sudah login) 
  if (isAdmin) { 
    setTimeout(loadData, 500); 
  } 
} 
 
function tampilkanToast(pesan, tipe = "success") { 
  // Hapus toast lama 
  const oldToast = document.querySelector(".toast"); 
  if (oldToast) oldToast.remove(); 
 
  // Buat toast baru 
  const toast = document.createElement("div"); 
  toast.className = `toast ${tipe === "error" ? "error" : "show"}`; 
  toast.textContent = pesan; 
   
  document.body.appendChild(toast); 
   
  // Auto hide setelah 5 detik 
  setTimeout(() => { 
    toast.classList.remove("show"); 
    setTimeout(() => toast.remove(), 300); 
  }, 5000); 
} 
 
function playNotificationSound() { 
  // Beep sound menggunakan Web Audio API 
  const audioContext = new (window.AudioContext || window.webkitAudioContext)(); 
  const oscillator = audioContext.createOscillator(); 
  const gainNode = audioContext.createGain(); 
   
  oscillator.connect(gainNode); 
  gainNode.connect(audioContext.destination); 
   
  oscillator.frequency.value = 800; // Nada tinggi 
  oscillator.type = "sine"; 
   
  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime); 
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5); 
   
  oscillator.start(audioContext.currentTime); 
  oscillator.stop(audioContext.currentTime + 0.5); 
} 
 
// Request permission untuk browser notification saat load 
async function requestNotificationPermission() { 
  if ("Notification" in window && Notification.permission === "default") { 
    const permission = await Notification.requestPermission(); 
    console.log("📱 Notification permission:", permission); 
  } 
} 
 
/* ========== POPUP PILIH ALAT ========== */ 
function bukaPopup() { 
  if (isAdmin) return; 
 
  const popup = $("popupAlat"); 
  const overlay = $("overlay"); 
  const list = $("listPopupAlat"); 
 
  overlay.classList.add("visible"); 
  popup.classList.remove("hidden"); 
  list.innerHTML = ""; 
 
  daftarAlat.forEach(nama => { 
    const item = document.createElement("div"); 
    item.className = "alat-item"; 
    if (selectedAlat.includes(nama)) item.classList.add("selected"); 
 
    const img = document.createElement("img"); 
    const imageSrc = fotoAlat[nama] || fallbackImage; 
    img.src = imageSrc; 
    img.alt = nama; 
     
    img.onerror = () => { img.src = fallbackImage; }; 
    img.onload = () => { console.log(`✅ ${nama} loaded`); }; 
 
    const span = document.createElement("span"); 
    span.textContent = nama; 
 
    item.appendChild(img); 
    item.appendChild(span); 
 
    item.onclick = () => { 
      if (selectedAlat.includes(nama)) { 
        selectedAlat = selectedAlat.filter(a => a !== nama); 
        item.classList.remove("selected"); 
      } else { 
        selectedAlat.push(nama); 
        item.classList.add("selected"); 
      } 
      $("alat").value = selectedAlat.join(", "); 
    }; 
 
    list.appendChild(item); 
  }); 
} 
 
function tutupPopup() { 
  $("popupAlat").classList.add("hidden"); 
  $("overlay").classList.remove("visible"); 
} 
 
/* ========== SIMPAN DATA USER + NOTIFIKASI ADMIN ========== */ 
function simpanData() { 
  const nama = $("nama").value.trim(); 
  const nohp = $("nohp").value.trim(); 
  const pinjam = $("tglPinjam").value; 
  const kembali = $("tglKembali").value; 
 
  if (!nama || !nohp || !pinjam || !kembali || selectedAlat.length === 0) { 
    tampilkanToast("❌ Lengkapi semua data dan pilih alat", "error"); 
    return; 
  } 
 
  if (new Date(kembali) < new Date(pinjam)) { 
    tampilkanToast("❌ Tanggal kembali tidak valid", "error"); 
    return; 
  } 
 
  const pesananBaru = { 
    id: Date.now(), 
    nama, 
    nohp, 
    alat: [...selectedAlat], 
    pinjam, 
    kembali 
  }; 
 
  daftar.push(pesananBaru); 
  localStorage.setItem("peminjaman", JSON.stringify(daftar)); 
 
  // 🚀 KIRIM NOTIFIKASI KE ADMIN 
  kirimNotifikasiAdmin(pesananBaru); 
 
  // RESET FORM 
  $("nama").value = ""; 
  $("nohp").value = ""; 
  $("alat").value = ""; 
  $("tglPinjam").value = ""; 
  $("tglKembali").value = ""; 
  selectedAlat = []; 
 
  tampilkanToast("✅ Peminjaman berhasil diajukan!"); 
} 
 
/* ========== TABLE ADMIN ========== */ 
function loadData() { 
  const tbody = document.querySelector("#dataTable tbody"); 
  if (!tbody) return; 
  tbody.innerHTML = ""; 
 
  daftar.forEach(item => { 
    const tr = document.createElement("tr"); 
    tr.innerHTML = ` 
      <td>${escapeHtml(item.nama)}</td> 
      <td>${escapeHtml(item.nohp)}</td> 
      <td>${escapeHtml(item.alat.join(", "))}</td> 
      <td>${item.pinjam}</td> 
      <td>${item.kembali}</td> 
      <td><button class="hapus-btn">Hapus</button></td> 
    `; 
 
    tr.querySelector("button").onclick = () => { 
      if (!confirm("Hapus data ini?")) return; 
      daftar = daftar.filter(d => d.id !== item.id); 
      localStorage.setItem("peminjaman", JSON.stringify(daftar)); 
      loadData(); 
      tampilkanToast("✅ Data dihapus"); 
    }; 
 
    tbody.appendChild(tr); 
  }); 
} 
 
/* ========== LOGIN ADMIN ========== */ 
function loginAdmin() { 
  if ($("adminPass").value === "admin123") { 
    isAdmin = true; 
    $("loginSection").classList.add("hidden"); 
    $("dataPanel").classList.remove("hidden"); 
    loadData(); 
    tampilkanToast("✅ Admin login berhasil"); 
  } else { 
    tampilkanToast("❌ Password salah", "error"); 
  } 
} 
 
/* ========== INIT ========== */ 
document.addEventListener("DOMContentLoaded", () => { 
  $("alat")?.addEventListener("click", bukaPopup); 
  $("overlay")?.addEventListener("click", tutupPopup); 
   
  // 🚀 REQUEST NOTIFICATION PERMISSION 
  requestNotificationPermission(); 
   
  if (isAdmin) loadData(); 
   
  console.log("🚀 Peminjaman App + Admin Notification READY!"); 
});
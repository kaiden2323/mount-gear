/* =========================================================
   peminjaman.js — FIREBASE VERSION (MULTI DEVICE FIX)
   ========================================================= */

import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  deleteDoc,
  doc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

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

const fallbackImage =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0ibm9uZSI+PC9zdmc+';

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

/* ========== POPUP PILIH ALAT ========== */
function bukaPopup() {
  if (isAdmin) return;

  const popup = $("popupAlat");
  const overlay = $("overlay");
  const list = $("listPopupAlat");

  overlay.classList.add("visible");
  popup.classList.remove("hidden");
  list.innerHTML = "";

  defaultAlat.forEach((nama) => {
    const item = document.createElement("div");
    item.className = "alat-item";
    if (selectedAlat.includes(nama)) item.classList.add("selected");

    const img = document.createElement("img");
    img.src = fotoAlat[nama] || fallbackImage;
    img.onerror = () => (img.src = fallbackImage);

    const span = document.createElement("span");
    span.textContent = nama;

    item.appendChild(img);
    item.appendChild(span);

    item.onclick = () => {
      if (selectedAlat.includes(nama)) {
        selectedAlat = selectedAlat.filter((a) => a !== nama);
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

/* ========== SIMPAN DATA KE FIRESTORE ========== */
async function simpanData() {
  const nama = $("nama").value.trim();
  const nohp = $("nohp").value.trim();
  const pinjam = $("tglPinjam").value;
  const kembali = $("tglKembali").value;

  if (!nama || !nohp || !pinjam || !kembali || selectedAlat.length === 0) {
    alert("Lengkapi semua data");
    return;
  }

  if (new Date(kembali) < new Date(pinjam)) {
    alert("Tanggal kembali tidak valid");
    return;
  }

  await addDoc(collection(window.db, "peminjaman"), {
    nama,
    nohp,
    alat: selectedAlat,
    pinjam,
    kembali,
    createdAt: serverTimestamp()
  });

  $("nama").value = "";
  $("nohp").value = "";
  $("alat").value = "";
  $("tglPinjam").value = "";
  $("tglKembali").value = "";
  selectedAlat = [];

  alert("Peminjaman berhasil disimpan");
}

/* ========== ADMIN REALTIME TABLE ========== */
function loadDataAdmin() {
  const tbody = document.querySelector("#dataTable tbody");
  tbody.innerHTML = "";

  const q = query(
    collection(window.db, "peminjaman"),
    orderBy("createdAt", "desc")
  );

  onSnapshot(q, (snapshot) => {
    tbody.innerHTML = "";

    snapshot.forEach((docSnap) => {
      const d = docSnap.data();
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${escapeHtml(d.nama)}</td>
        <td>${escapeHtml(d.nohp)}</td>
        <td>${escapeHtml((d.alat || []).join(", "))}</td>
        <td>${d.pinjam}</td>
        <td>${d.kembali}</td>
        <td><button>Hapus</button></td>
      `;

      tr.querySelector("button").onclick = async () => {
        if (!confirm("Hapus data ini?")) return;
        await deleteDoc(doc(window.db, "peminjaman", docSnap.id));
      };

      tbody.appendChild(tr);
    });
  });
}

/* ========== LOGIN ADMIN ========== */
function loginAdmin() {
  if ($("adminPass").value === "admin123") {
    isAdmin = true;
    $("loginSection").classList.add("hidden");
    $("dataPanel").classList.remove("hidden");
    loadDataAdmin();
  } else {
    alert("Password salah");
  }
}

/* ========== INIT ========== */
document.addEventListener("DOMContentLoaded", () => {
  $("alat")?.addEventListener("click", bukaPopup);
  $("overlay")?.addEventListener("click", tutupPopup);
});

/* EXPORT KE HTML */
window.simpanData = simpanData;
window.loginAdmin = loginAdmin;
window.toggleDarkMode = toggleDarkMode;
window.tutupPopup = tutupPopup;

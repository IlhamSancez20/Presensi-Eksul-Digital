const CONFIG = {
  GAS_API_URL: "https://script.google.com/macros/s/AKfycbyjuNGHKUu5w4uteGIB-7DOGvffIRfz6kEa5LjTUZj1vddx4kN1TVgPYqQYnbn_VkB0/exec",
  LOCAL_STORAGE_QUEUE_KEY: "presensi_offline_queue",
  MAX_PHOTO_SIZE_BYTES: 500 * 1024,
};

let state = {
  currentLang: 'id',
  userLocation: { lat: null, lng: null, formatted: 'Mencari lokasi...' },
  isCameraActive: false,
  isFaceDetected: false,
  selfieBase64: null,
  pendingQueue: JSON.parse(localStorage.getItem(CONFIG.LOCAL_STORAGE_QUEUE_KEY) || '[]'),
  adminData: null,
  allPresensiData: [],
};

const i18n = {
  id: {
    nav_login: "Login Pembina",
    form_title: "Form Presensi Siswa",
    form_subtitle: "Silakan isi data dan lakukan verifikasi wajah untuk hadir kegiatan ekstrakurikuler.",
    label_nama: "Nama Lengkap",
    label_ekskul: "Nama Ekstrakurikuler",
    label_kelas: "Kelas",
    label_kehadiran: "Status Kehadiran",
    label_camera: "Verifikasi Wajah (Live Selfie)",
    gps_title: "Lokasi GPS Terdeteksi:",
    camera_gate_msg: "Klik tombol di bawah untuk membuka kamera selfie.",
    btn_open_camera: "Buka Kamera",
    face_status_loading: "Mendeteksi Wajah Manusia...",
    btn_snap: "Ambil Foto Selfie",
    btn_retake: "Foto Ulang",
    btn_submit: "Kirim Presensi Sekarang",
    btn_logout: "Keluar",
    metric_total: "Total Presensi",
    metric_verified: "Siswa Terdaftar",
    metric_unverified: "Siswa Tidak Terdaftar",
    filter_label: "Periode:",
    opt_all: "Semua Riwayat",
    opt_weekly: "Minggu Ini",
    opt_monthly: "Bulan Ini",
    opt_semester: "Semester Ini",
    btn_export: "Export Excel / CSV",
    th_tanggal: "Tanggal",
    th_nama: "Nama",
    th_kelas: "Kelas",
    th_ekskul: "Ekskul",
    th_verif_siswa: "Verifikasi Siswa",
    th_verif_ekskul: "Verifikasi Ekskul",
    th_kehadiran: "Kehadiran",
    th_lokasi: "GPS",
    th_foto: "Foto Selfie",
    login_title: "Login Pembina / Admin",
    login_subtitle: "Masukkan nama ekskul dan kata sandi untuk mengakses dashboard.",
    label_password: "Kata Sandi",
    btn_login_submit: "Masuk Dashboard",
    msg_face_found: "Wajah Terdeteksi! Silakan Ambil Foto.",
    msg_face_not_found: "Wajah Tidak Terdeteksi! Pastikan Wajah Terlihat Jelas.",
    msg_duplicate: "Anda sudah melakukan presensi hari ini untuk ekskul ini!",
    msg_offline_saved: "Koneksi offline. Presensi disimpan di antrean lokal.",
    msg_sync_success: "Data antrean offline berhasil terkirim!",
  },
  en: {
    nav_login: "Coach Login",
    form_title: "Student Attendance Form",
    form_subtitle: "Please complete details and perform face verification for extracurricular attendance.",
    label_nama: "Full Name",
    label_ekskul: "Extracurricular Name",
    label_kelas: "Class",
    label_kehadiran: "Attendance Status",
    label_camera: "Face Verification (Live Selfie)",
    gps_title: "Detected GPS Location:",
    camera_gate_msg: "Click the button below to open selfie camera.",
    btn_open_camera: "Open Camera",
    face_status_loading: "Detecting Human Face...",
    btn_snap: "Take Selfie Photo",
    btn_retake: "Retake Photo",
    btn_submit: "Submit Attendance Now",
    btn_logout: "Logout",
    metric_total: "Total Attendance",
    metric_verified: "Verified Students",
    metric_unverified: "Unverified Students",
    filter_label: "Period:",
    opt_all: "All History",
    opt_weekly: "This Week",
    opt_monthly: "This Month",
    opt_semester: "This Semester",
    btn_export: "Export Excel / CSV",
    th_tanggal: "Date",
    th_nama: "Name",
    th_kelas: "Class",
    th_ekskul: "Ekskul",
    th_verif_siswa: "Student Verif",
    th_verif_ekskul: "Ekskul Verif",
    th_kehadiran: "Attendance",
    th_lokasi: "GPS",
    th_foto: "Selfie Photo",
    login_title: "Coach / Admin Login",
    login_subtitle: "Enter extracurricular name and password to access dashboard.",
    label_password: "Password",
    btn_login_submit: "Login to Dashboard",
    msg_face_found: "Face Detected! You can take the photo.",
    msg_face_not_found: "No Human Face Detected! Please center your face.",
    msg_duplicate: "You have already submitted attendance today for this activity!",
    msg_offline_saved: "Offline mode. Attendance queued locally.",
    msg_sync_success: "Offline queue synchronized successfully!",
  }
};

document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

function initApp() {
  setupLanguage();
  setupGPS();
  setupNetworkListener();
  setupEventListeners();
  loadMasterAutocomplete();
  updatePendingBadge();
}

function setupLanguage() {
  document.getElementById('btn-lang-toggle').addEventListener('click', () => {
    state.currentLang = state.currentLang === 'id' ? 'en' : 'id';
    document.getElementById('current-lang').textContent = state.currentLang.toUpperCase();
    applyLanguage();
  });
}

function applyLanguage() {
  const lang = i18n[state.currentLang];
  document.querySelectorAll('[data-i18n]').forEach(elem => {
    const key = elem.getAttribute('data-i18n');
    if (lang[key]) {
      elem.textContent = lang[key];
    }
  });
}

function setupGPS() {
  if (!navigator.geolocation) {
    state.userLocation.mapsUrl = "GPS Tidak Didukung Browser";
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const lat = pos.coords.latitude.toFixed(6);
      const lng = pos.coords.longitude.toFixed(6);
      state.userLocation.mapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
    },
    (err) => {
      state.userLocation.mapsUrl = "GPS Terkunci / Izinkan Akses Lokasi";
    },
    { enableHighAccuracy: true, timeout: 10000 }
  );
}

async function setupCamera() {
  const video = document.getElementById('webcam');
  const gate = document.getElementById('camera-gate');
  const container = document.getElementById('camera-container');

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: "user",
        width: { ideal: 720 },
        height: { ideal: 1280 }
      },
      audio: false
    });
    
    video.srcObject = stream;
    state.isCameraActive = true;
    
    gate.classList.add('hidden');
    container.classList.remove('hidden');

    startFaceDetectionLoop();
  } catch (err) {
    showToast("Gagal mengakses kamera: " + err.message, "error");
  }
}

async function startFaceDetectionLoop() {
  const video = document.getElementById('webcam');
  const canvas = document.getElementById('face-canvas');
  const statusBox = document.getElementById('face-status');
  const btnSnap = document.getElementById('btn-snap');

  canvas.width = video.videoWidth || 480;
  canvas.height = video.videoHeight || 320;
  const ctx = canvas.getContext('2d');

  setInterval(async () => {
    if (!state.isCameraActive) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let hasFace = false;

    if (window.faceapi && faceapi.nets.tinyFaceDetector.params) {
      const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions());
      if (detections.length > 0) {
        hasFace = true;
        const box = detections[0].box;
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 3;
        ctx.strokeRect(box.x, box.y, box.width, box.height);
      }
    } else {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
      let skinPixels = 0;
      for (let i = 0; i < frame.data.length; i += 16) {
        const r = frame.data[i], g = frame.data[i+1], b = frame.data[i+2];
        if (r > 95 && g > 40 && b > 20 && r > g && r > b && Math.abs(r - g) > 15) {
          skinPixels++;
        }
      }
      if (skinPixels > 1200) hasFace = true;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    state.isFaceDetected = hasFace;
    const lang = i18n[state.currentLang];

    if (hasFace) {
      statusBox.className = "face-status success";
      statusBox.innerHTML = `<i class="fa-solid fa-face-smile"></i> ${lang.msg_face_found}`;
      btnSnap.disabled = false;
    } else {
      statusBox.className = "face-status error";
      statusBox.innerHTML = `<i class="fa-solid fa-face-frown"></i> ${lang.msg_face_not_found}`;
      btnSnap.disabled = true;
    }
  }, 500);
}

function takeSelfieSnapshot() {
  if (!state.isFaceDetected) {
    showToast(i18n[state.currentLang].msg_face_not_found, "error");
    return;
  }

  const video = document.getElementById('webcam');
  const snapCanvas = document.getElementById('snapshot-canvas');
  
  const vWidth = video.videoWidth || 640;
  const vHeight = video.videoHeight || 480;

  let targetWidth, targetHeight, sx, sy, sWidth, sHeight;

  if (vWidth > vHeight) {
    sHeight = vHeight;
    sWidth = Math.round(vHeight * (3 / 4));
    sx = Math.round((vWidth - sWidth) / 2);
    sy = 0;
    targetWidth = sWidth;
    targetHeight = sHeight;
  } else {
    sWidth = vWidth;
    sHeight = vHeight;
    sx = 0;
    sy = 0;
    targetWidth = vWidth;
    targetHeight = vHeight;
  }

  snapCanvas.width = targetWidth;
  snapCanvas.height = targetHeight;

  const ctx = snapCanvas.getContext('2d');
  
  ctx.setTransform(1, 0, 0, 1, 0, 0);

  ctx.translate(targetWidth, 0);
  ctx.scale(-1, 1);

  ctx.drawImage(video, sx, sy, sWidth, sHeight, 0, 0, targetWidth, targetHeight);

  state.selfieBase64 = snapCanvas.toDataURL('image/jpeg', 0.92);

  stopCamera();

  document.getElementById('selfie-preview').src = state.selfieBase64;
  document.getElementById('camera-container').classList.add('hidden');
  document.getElementById('preview-container').classList.remove('hidden');
  document.getElementById('btn-submit-presensi').disabled = false;

  showToast("Foto selfie berhasil diambil!", "success");
}

function stopCamera() {
  const video = document.getElementById('webcam');
  if (video && video.srcObject) {
    video.srcObject.getTracks().forEach(track => track.stop());
    video.srcObject = null;
  }
  state.isCameraActive = false;
}

function setupNetworkListener() {
  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  updateOnlineStatus();
}

function updateOnlineStatus() {
  const badge = document.getElementById('connection-status');
  const statusText = document.getElementById('status-text');

  if (navigator.onLine) {
    badge.className = "status-badge online";
    statusText.textContent = "Online";
    syncOfflineQueue();
  } else {
    badge.className = "status-badge offline";
    statusText.textContent = "Offline";
  }
}

function updatePendingBadge() {
  const pendingBadge = document.getElementById('pending-badge');
  const pendingCount = document.getElementById('pending-count');
  const count = state.pendingQueue.length;

  if (count > 0) {
    pendingBadge.classList.remove('hidden');
    pendingCount.textContent = count;
  } else {
    pendingBadge.classList.add('hidden');
  }
}

async function syncOfflineQueue() {
  if (state.pendingQueue.length === 0) return;

  showToast("Mengirim antrean presensi offline...", "info");
  const remaining = [];

  for (const item of state.pendingQueue) {
    try {
      const res = await sendToGASBackend(item);
      if (res.status !== 'success') remaining.push(item);
    } catch (err) {
      remaining.push(item);
    }
  }

  state.pendingQueue = remaining;
  localStorage.setItem(CONFIG.LOCAL_STORAGE_QUEUE_KEY, JSON.stringify(remaining));
  updatePendingBadge();

  if (remaining.length === 0) {
    showToast(i18n[state.currentLang].msg_sync_success, "success");
  }
}

async function fetchWithRetry(url, options, maxRetries = 3, delay = 1000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) return await response.json();
    } catch (err) {
      if (i === maxRetries - 1) throw err;
      await new Promise(res => setTimeout(res, delay * Math.pow(2, i)));
    }
  }
}

async function sendToGASBackend(payload) {
  return await fetchWithRetry(CONFIG.GAS_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload)
  });
}

async function handlePresensiSubmit() {
  const nama = document.getElementById('input-nama').value.trim();
  const ekskul = document.getElementById('input-ekskul').value.trim();
  const kelas = document.getElementById('input-kelas').value.trim();
  const foto = state.selfieBase64;

  if (!nama || !ekskul || !kelas || !foto) {
    showToast("Gagal! Nama Lengkap, Kelas, Ekstrakurikuler, dan Foto Wajah WAJIB diisi!", "error");
    return;
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const submissionKey = `presensi_${nama.toLowerCase()}_${ekskul.toLowerCase()}_${todayStr}`;

  if (localStorage.getItem(submissionKey)) {
    showToast(i18n[state.currentLang].msg_duplicate, "error");
    return;
  }

  const payload = {
    action: 'submit_presensi',
    nama: nama,
    ekskul: ekskul,
    kelas: kelas,
    lokasi: state.userLocation.mapsUrl || "GPS Tidak Terdeteksi", // Tautkan link Google Maps di backend
    fotoBase64: foto,
    timestamp: new Date().toISOString()
  };

  const btnSubmit = document.getElementById('btn-submit-presensi');
  btnSubmit.disabled = true;
  btnSubmit.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Memproses...`;

  if (!navigator.onLine) {
    state.pendingQueue.push(payload);
    localStorage.setItem(CONFIG.LOCAL_STORAGE_QUEUE_KEY, JSON.stringify(state.pendingQueue));
    localStorage.setItem(submissionKey, 'true');
    updatePendingBadge();
    showToast(i18n[state.currentLang].msg_offline_saved, "info");
    resetForm();
    return;
  }

  try {
    const response = await sendToGASBackend(payload);
    if (response.status === 'success') {
      localStorage.setItem(submissionKey, 'true');
      showToast("Presensi Berhasil Terkirim!", "success");
      resetForm();
    } else if (response.status === 'duplicate') {
      showToast(response.message || i18n[state.currentLang].msg_duplicate, "error");
    } else {
      showToast("Gagal mengirim presensi: " + response.message, "error");
    }
  } catch (err) {
    showToast("Jaringan terganggu, menyimpan ke antrean offline...", "info");
    state.pendingQueue.push(payload);
    localStorage.setItem(CONFIG.LOCAL_STORAGE_QUEUE_KEY, JSON.stringify(state.pendingQueue));
    updatePendingBadge();
    resetForm();
  } finally {
    btnSubmit.disabled = false;
    btnSubmit.innerHTML = `<i class="fa-solid fa-paper-plane"></i> ${i18n[state.currentLang].btn_submit}`;
  }
}

function resetForm() {
  stopCamera();
  document.getElementById('presensi-form').reset();
  state.selfieBase64 = null;
  document.getElementById('preview-container').classList.add('hidden');
  document.getElementById('camera-gate').classList.remove('hidden');
  document.getElementById('btn-submit-presensi').disabled = true;
}

async function loadMasterAutocomplete() {
  if (!navigator.onLine || CONFIG.GAS_API_URL.includes("YOUR_GOOGLE_APPS")) return;

  try {
    const data = await fetchWithRetry(`${CONFIG.GAS_API_URL}?action=get_master`);
    if (data.status === 'success') {
      const siswaList = document.getElementById('siswa-list');
      const ekskulList = document.getElementById('ekskul-list');

      siswaList.innerHTML = (data.siswa || []).map(s => `<option value="${s.nama}">`).join('');
      ekskulList.innerHTML = (data.ekskul || []).map(e => `<option value="${e.nama}">`).join('');
    }
  } catch (e) {
    console.warn("Autocompletion master offline/unavailable");
  }
}

async function handleAdminLogin() {
  const ekskul = document.getElementById('login-ekskul').value.trim();
  const password = document.getElementById('login-password').value.trim();

  try {
    const res = await sendToGASBackend({ action: 'login', ekskul, password });
    if (res.status === 'success') {
      state.adminData = { ekskul };
      document.getElementById('admin-ekskul-name').textContent = ekskul;
      document.getElementById('login-modal').classList.add('hidden');
      document.getElementById('guest-section').classList.add('hidden');
      document.getElementById('admin-section').classList.remove('hidden');
      loadDashboardData();
    } else {
      showToast("Login gagal: " + res.message, "error");
    }
  } catch (e) {
    showToast("Gagal menghubungi server login.", "error");
  }
}

async function loadDashboardData() {
  try {
    const res = await fetchWithRetry(`${CONFIG.GAS_API_URL}?action=get_presensi&ekskul=${encodeURIComponent(state.adminData.ekskul)}`);
    if (res.status === 'success') {
      state.allPresensiData = res.data;
      renderTable(res.data);
    }
  } catch (e) {
    showToast("Gagal memuat data presensi dashboard.", "error");
  }
}

function renderTable(data) {
  const tbody = document.getElementById('table-body');
  let total = data.length, verifSiswa = 0, unverifSiswa = 0;

  if (total === 0) {
    tbody.innerHTML = `<tr><td colspan="10" class="text-center">Belum ada data presensi.</td></tr>`;
    return;
  }

  tbody.innerHTML = data.map((row, idx) => {
    if (row.verifSiswa === 'Terdaftar') verifSiswa++; else unverifSiswa++;
    
    // Render kolom lokasi sebagai link Google Maps yang dapat diklik
    const gpsLink = (row.lokasi && row.lokasi.startsWith('http'))
      ? `<a href="${row.lokasi}" target="_blank" rel="noopener" class="maps-link"><i class="fa-solid fa-map-location-dot"></i> Buka Maps</a>`
      : row.lokasi;

    return `
      <tr>
        <td>${idx + 1}</td>
        <td>${row.tanggal}</td>
        <td><strong>${row.nama}</strong></td>
        <td>${row.kelas}</td>
        <td>${row.ekskul}</td>
        <td><span class="pill ${row.verifSiswa === 'Terdaftar' ? 'success' : 'danger'}">${row.verifSiswa}</span></td>
        <td><span class="pill ${row.verifEkskul === 'Terdaftar' ? 'success' : 'danger'}">${row.verifEkskul}</span></td>
        <td>${row.kehadiran}</td>
        <td>${gpsLink}</td>
        <td><a href="${row.urlFoto}" target="_blank" rel="noopener"><i class="fa-solid fa-image"></i> Lihat Foto</a></td>
      </tr>
    `;
  }).join('');

  document.getElementById('stat-total').textContent = total;
  document.getElementById('stat-verified').textContent = verifSiswa;
  document.getElementById('stat-unverified').textContent = unverifSiswa;
}

function exportToExcel() {
  if (state.allPresensiData.length === 0) {
    showToast("Tidak ada data untuk diexport!", "error");
    return;
  }

  const exportArray = state.allPresensiData.map(item => ({
    "ID Presensi": item.id,
    "Tanggal": item.tanggal,
    "Nama Siswa": item.nama,
    "Kelas": item.kelas,
    "Ekskul": item.ekskul,
    "Status Siswa": item.verifSiswa,
    "Status Ekskul": item.verifEkskul,
    "Kehadiran": item.kehadiran,
    "Lokasi GPS": item.lokasi,
    "URL Foto": item.urlFoto
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportArray);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Presensi");
  XLSX.writeFile(workbook, `Laporan_Presensi_${state.adminData.ekskul}_${new Date().toISOString().split('T')[0]}.xlsx`);
}

function setupEventListeners() {
  document.getElementById('btn-open-camera').addEventListener('click', setupCamera);
  document.getElementById('btn-snap').addEventListener('click', takeSelfieSnapshot);
  document.getElementById('presensi-form').addEventListener('submit', handlePresensiSubmit);

  document.getElementById('btn-open-login').addEventListener('click', () => {
    document.getElementById('login-modal').classList.remove('hidden');
  });
  document.getElementById('btn-close-modal').addEventListener('click', () => {
    document.getElementById('login-modal').classList.add('hidden');
  });
  document.getElementById('btn-submit-login').addEventListener('click', handleAdminLogin);
  document.getElementById('btn-admin-logout').addEventListener('click', () => {
    location.reload();
  });
  document.getElementById('btn-export-excel').addEventListener('click', exportToExcel);
  document.getElementById('btn-refresh-gps').addEventListener('click', setupGPS);
}

function showToast(message, type = "info") {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<i class="fa-solid fa-circle-info"></i> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 4000);
}

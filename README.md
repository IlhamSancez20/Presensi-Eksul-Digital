# 🚀 Aplikasi Web Absensi Ekstrakurikuler 

Aplikasi web modern, responsif, dan serverless untuk pencatatan presensi ekstrakurikuler sekolah dengan verifikasi wajah *real-time*, validasi lokasi GPS, penanganan sinkronisasi *offline*, serta backend terintegrasi Google Sheets & Google Drive.

---

## 🇲🇨 BAHASA INDONESIA

### 📌 Deskripsi & Tujuan Pembuatan
Aplikasi ini dibuat untuk menggantikan pencatatan presensi manual menjadi otomatis dan transparan. Sistem ini berjalan sepenuhnya secara **Serverless** (tanpa biaya server bulanan) menggunakan kombinasi GitHub Pages (Hosting) dan Google Apps Script (Backend REST API).

### 👥 Pembuat / Penulis Website
- **Pengembang**: Senior Full-Stack Web Developer & Solution Architect
- **Lisensi**: Open Source (MIT License)
- **Pembuat**: Ilham M Furqon

### ⚙️ Fitur Utama
1. **Verifikasi Wajah Live (AI Canvas Detector)**: Mencegah foto palsu/tanpa wajah manusia.
2. **Auto-Matching Backend**: Verifikasi otomatis kesesuaian data siswa dan nama ekskul di database Google Sheets.
3. **Penyimpanan Foto Otomatis**: Hasil foto selfie diunggah langsung ke folder Google Drive (`ID: 1Ai9kAsShEhw1rHJKIPetb_SSaDDq8M_f`).
4. **Dukungan Offline (Offline Sync Queue)**: Tetap dapat melakukan presensi saat internet terputus. Data dikirim otomatis saat online kembali.
5. **Anti-Duplication & High Traffic Handling**: Mencegah pengiriman ganda pada hari yang sama dan menggunakan `LockService.getScriptLock()` untuk menangani >100 user bersamaan.
6. **Dashboard Interaktif Pembina**: Filter data presensi dan download laporan Excel (`.xlsx`).
7. **Dukungan Multi-Bahasa (i18n)**: Mode Bahasa Indonesia & English.

### 📖 Panduan Penggunaan
1. **Guest (Siswa)**:
   - Buka halaman web.
   - Isi Nama Lengkap, Nama Ekskul, dan Kelas.
   - Klik **"Buka Kamera"** dan arahkan wajah ke kamera.
   - Setelah sistem mendeteksi wajah, klik **"Ambil Foto Selfie"**.
   - Klik **"Kirim Presensi Sekarang"**.
2. **Admin / Pembina**:
   - Klik tombol **"Login Pembina"** di pojok kanan atas.
   - Masukkan Nama Ekskul dan Password.
   - Lihat ringkasan data, cari siswa, dan klik **"Export Excel / CSV"** untuk mengunduh laporan.

---

## 🇬🇧 ENGLISH

### 📌 Description & Purpose
A modern, serverless web application designed to automate school extracurricular attendance taking. Built with face detection, GPS validation, offline synchronization, and Google Workspace integration.

### ⚙️ Key Features
- **Live Face Verification**: Ensures valid face detection before capture.
- **Auto-Matching Verification**: Matches student and club names against Google Sheets database.
- **Offline Mode & Queue Sync**: Allows attendance logging without internet connection.
- **Google Drive Storage**: Directly uploads selfies to designated Google Drive folder.
- **Coach Dashboard & Export**: Interactive reporting with SheetJS Excel export.

---

## 📝 LISENSI
Hak Cipta (c) 2026. Lisensi MIT - Bebas digunakan dan dikembangkan untuk keperluan edukasi dan non-komersial.

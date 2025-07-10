# Catatan Pendek: Masalah Umum & Penyelesaian dalam Proyek MCP Server TypeScript

Dokumen ini merangkum masalah-masalah umum yang mungkin Anda temui saat mengembangkan dan men-debug proyek MCP Server berbasis TypeScript ini, serta langkah-langkah untuk menyelesaikannya.

---

## Daftar Masalah Umum & Penyelesaian

### 1. Masalah: `ERROR: MCP_TOOL_NAME tidak didefinisikan dalam variabel lingkungan.` (saat startup server)

* **Penyebab:** Server tidak dapat menemukan variabel lingkungan `MCP_TOOL_NAME` yang penting untuk identifikasi tool Anda. Ini bisa terjadi jika file `.env` tidak dibuat, salah tempat, atau variabel tersebut tidak didefinisikan di dalamnya.
* **Deteksi:** Anda akan melihat pesan error ini di konsol server segera setelah mencoba menjalankan `npx ts-node src/server.ts`. Server akan langsung berhenti (exit).
* **Penyelesaian:**
    1.  Pastikan Anda telah membuat file bernama `.env` di **root direktori proyek** (`mcp-debugging-project/`).
    2.  Tambahkan baris berikut di dalam file `.env`:
        ```env
        MCP_TOOL_NAME=WeatherCheckerTool # Pastikan nama ini sesuai dengan yang Anda harapkan
        ```
    3.  Restart server Anda.

### 2. Masalah: Respon MCP `status: "error"`, `code: "MISSING_ENV_VAR"`, `message: "Variabel lingkungan WEATHER_API_KEY tidak ditemukan."`

* **Penyebab:** Fungsi `executeToolAction` untuk aksi `getWeather` secara sengaja memeriksa keberadaan `WEATHER_API_KEY`. Jika variabel lingkungan ini tidak disetel di `.env`, error ini akan terpicu. Ini adalah simulasi error "environment variable tidak lengkap".
* **Deteksi:**
    * **Dari Klien (misal Postman/MCP Inspector):** Anda akan menerima respons JSON dengan `status: "error"`, `code: "MISSING_ENV_VAR"`, dan pesan yang relevan.
    * **Dari Log Server:** Anda akan melihat entri log `[ERROR] Error saat eksekusi aksi "getWeather": Variabel lingkungan WEATHER_API_KEY tidak ditemukan.`
* **Penyelesaian:**
    1.  Buka file `.env`.
    2.  Tambahkan baris berikut (Anda bisa menggunakan string placeholder):
        ```env
        WEATHER_API_KEY=ini_adalah_api_key_simulasi_anda
        ```
    3.  Restart server Anda dan coba lagi permintaan `getWeather`.

### 3. Masalah: Respon MCP `status: "error"`, `code: "TOOL_NAME_MISMATCH"`

* **Penyebab:** Payload permintaan MCP yang Anda kirim ke server memiliki `toolName` yang berbeda dari `MCP_TOOL_NAME` yang dikonfigurasi di server Anda (`.env`). Server sengaja dirancang untuk memvalidasi ini sebagai salah satu skenario error.
* **Deteksi:**
    * **Dari Klien:** Respons JSON akan memiliki `status: "error"`, `code: "TOOL_NAME_MISMATCH"`, dan pesan yang menjelaskan perbedaan nama tool.
    * **Dari Log Server:** Anda akan melihat `[ERROR] Nama tool tidak cocok. Diharapkan '...', diterima '...'.`
* **Penyelesaian:**
    1.  Periksa nilai `MCP_TOOL_NAME` di file `.env` server Anda.
    2.  Saat mengirim permintaan MCP dari klien (Postman/MCP Inspector), pastikan `toolName` di payload Anda **persis sama** dengan nilai di `.env`.

### 4. Masalah: Respon MCP `status: "error"`, `code: "INVALID_ACTION_PATH"` atau `code: "UNSUPPORTED_ACTION"`

* **Penyebab:** Aksi (`action`) yang diminta dalam payload MCP tidak dikenali atau ditandai sebagai tidak valid oleh fungsi `isValidToolAction` atau blok `switch` di `executeToolAction`. Ini adalah simulasi error "konfigurasi path yang salah".
* **Deteksi:**
    * **Dari Klien:** Respons JSON akan menampilkan `status: "error"`, dengan kode `INVALID_ACTION_PATH` atau `UNSUPPORTED_ACTION` dan pesan yang sesuai.
    * **Dari Log Server:** Anda akan melihat `[ERROR] Aksi "..." tidak valid atau tidak dikenal.` atau `[ERROR] Aksi "..." tidak didukung...`
* **Penyelesaian:**
    1.  Periksa payload permintaan Anda dan pastikan `action` yang dikirim adalah salah satu yang didukung oleh server (`getWeather`, `getForecast`).
    2.  Jika Anda sengaja mensimulasikan error, pastikan `action` di payload Anda adalah `wrong-action` atau `unknown-path`.
    3.  Jika Anda ingin menambahkan aksi baru, Anda perlu memperbarui logika di `src/mcp-utils.ts` (`isValidToolAction` dan `executeToolAction`).

### 5. Masalah: Tidak ada log debugging di respons klien (`"log": []`)

* **Penyebab:** Fitur log di respons MCP hanya aktif jika `DEBUG_MODE` diatur ke `true` di konfigurasi server.
* **Deteksi:** Bidang `log` dalam respons JSON dari server selalu kosong, meskipun server sedang memproses permintaan.
* **Penyelesaian:**
    1.  Buka file `.env`.
    2.  Pastikan Anda memiliki baris berikut:
        ```env
        DEBUG_MODE=true
        ```
    3.  Restart server Anda. Log sekarang akan dimasukkan ke dalam respons (terutama untuk error).

### 6. Masalah: Error TypeScript atau Kompilasi

* **Penyebab:** Kesalahan penulisan kode, tipe yang tidak cocok, atau konfigurasi `tsconfig.json` yang salah.
* **Deteksi:** Pesan error di terminal saat menjalankan `npx ts-node src/server.ts` atau `npm run build`.
* **Penyelesaian:**
    1.  Baca pesan error TypeScript dengan cermat. Mereka biasanya sangat informatif tentang lokasi dan jenis masalahnya.
    2.  Pastikan semua dependensi (`@types/*` untuk library JavaScript) sudah terinstal.
    3.  Verifikasi `tsconfig.json` sudah diatur dengan benar (misalnya `strict: true` dapat menangkap banyak masalah).

---

## Masalah

Saat dijalankan lokal hasil `git clone`, fitur AI (chat, art, voice) error karena `LOVABLE_API_KEY` tidak ada. Key ini memang **tidak ikut ke repo** — sengaja, karena bersifat rahasia (server-side secret). Di environment Lovable Cloud key ini auto-inject ke runtime, tapi kalau jalan di mesin sendiri kamu harus menyediakannya sendiri.

## Cara mendapatkan & memakainya secara lokal

1. **Ambil key dari Lovable**
   - Buka project ini di lovable.dev → Settings / Cloud → **Secrets**.
   - Cari entry bernama `LOVABLE_API_KEY` lalu copy value-nya.
   - (Kalau belum ada, nanti pas balik ke build mode aku bisa provision pakai tool `ai_gateway--create`.)

2. **Taruh di `.env` lokal** (file `.env` di-ignore git, jadi memang kosong setelah clone)
   Tambahkan baris berikut di `.env` root project:

   ```
   LOVABLE_API_KEY="<paste value dari step 1>"
   ```

   Catatan penting:
   - **Tanpa prefix `VITE_`**. Key ini server-only, tidak boleh masuk ke browser bundle.
   - Dibaca di `src/lib/ai.functions.ts` dan `src/routes/api/generate-image.ts` lewat `process.env.LOVABLE_API_KEY` — hanya jalan di sisi server TanStack Start.

3. **Restart dev server** (`bun dev` / `npm run dev`) supaya env baru ke-load.

4. **Verifikasi**: coba generate chat / art / voice. Kalau masih error, cek terminal server — biasanya akan muncul status code:
   - `401/403` → key salah / sudah dirotate, ambil ulang dari Settings.
   - `402` → kredit AI Gateway workspace habis, perlu top-up di billing.
   - `429` → rate limit, tunggu sebentar.

## Hal yang TIDAK perlu dilakukan

- Jangan commit `.env` ke git.
- Jangan rename ke `VITE_LOVABLE_API_KEY` — itu akan bocor ke client dan tetap tidak dipakai server.
- Jangan ganti ke API key OpenAI/Gemini langsung; seluruh kode sekarang lewat Lovable AI Gateway (`ai.gateway.lovable.dev`) yang otentikasinya pakai `LOVABLE_API_KEY`.

## Kalau key-nya belum ada di Settings

Bilang saja, nanti aku switch ke build mode dan jalankan provisioning supaya key di-generate untuk project ini, lalu kamu tinggal copy ke `.env` lokal.

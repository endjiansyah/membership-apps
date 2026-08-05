# Sidomunclut Membership App - Project State
**Tech Stack:** Nuxt 3, Vue 3, Prisma ORM, PostgreSQL, Bootstrap 5 (Mobile-first UI).

## Fitur yang Sudah Selesai
1. **CRUD Fields Dinamis:** Pengaturan kolom custom (`/settings`) dengan tipe data fleksibel. Data tersimpan di kolom JSON `dynamicData` pada tabel Member.
2. **Scanner Kehadiran (`/scanner`):**
   - Integrasi kamera `html5-qrcode`.
   - Menampilkan preview statistik (Bulan ini, Tahun ini, Total).
   - Pencegahan double check-in (Failsafe konfirmasi).
   - Fitur aktivasi membership langsung dari scanner dengan konfirmasi 2 langkah.

## Fitur yang Sedang/Akan Dikerjakan (Current Focus)
1. **Halaman Detail Member (`/members/[id]`):** 
   - Menampilkan data lengkap, log kehadiran, dan log aktivitas.
   - Fitur update profil manual.
   - Fitur catat kehadiran manual (tanpa scanner).
   - Fitur toggle status Aktif/Non-Aktif manual.
2. **Sistem Audit Trail:** Mencatat setiap perubahan data (siapa yang mengubah, lewat jalur mana, kapan).
3. **Dashboard & Rekap Log Global:** Tampilan statistik dan tabel ekspor data.

## Catatan Aturan Khusus (AI Guidelines)
- Desain wajib *mobile-first* (Bottom navigation di HP, Sidebar di Desktop).
- Jangan gunakan istilah hiperbola dalam komunikasi UI atau komentar kode.
- Semua aksi yang mengubah data member harus tercatat di `AuditLog` atau `AttendanceLog` (jelaskan `entryMethod` atau `source`-nya).
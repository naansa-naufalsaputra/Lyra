PRD (Product Requirements Document) - Lyra

A. Ringkasan Produk

Lyra adalah aplikasi manajemen tugas dan jadwal (to-do list \& scheduler) berbasis Progressive Web App (PWA) yang dirancang untuk produktivitas tingkat tinggi dengan antarmuka ganda (Dark Mode ala Linear, Light Mode ala Amie) serta interaksi yang mulus.



B. Target Pengguna

Mahasiswa, developer, dan profesional yang membutuhkan pencatatan tugas harian yang cepat, tanpa distraksi, dan estetik.



C. Fitur Utama (Core Features)

Manajemen Tugas: Tambah, edit, centang (selesai), dan hapus tugas.
- Priority Levels: High (#C11B11), Medium (#F59E0B), Low (Muted).

Dual Theme System: Peralihan mode terang dan gelap secara instan tanpa flicker.
- Glassmorphism: Efek backdrop-blur pada header dan navigasi.

Micro-interactions: Animasi checkbox, strikethrough, dan transisi layout yang mulus (Todoist feel).

Scheduler (Fase 1): Fitur "Due Date" sederhana yang terintegrasi dengan tampilan kalender bulanan.

Local-First & Sync: Data disimpan di localStorage (fase 1), dengan kapabilitas sinkronisasi ke BaaS (Supabase/Firebase) di fase berikutnya.

PWA Ready: Dapat diinstal di home screen smartphone.



D. Tech Stack

Frontend: React, Next.js (App Router) atau Vite.

Styling: Tailwind CSS v4.

Animasi: Framer Motion.

Ikon: Lucide React.

Deployment: Cloudflare Pages / Vercel.

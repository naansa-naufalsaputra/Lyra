---
name: Lyra Design System
colors:
  surface: '#121319'
  surface-dim: '#121319'
  surface-bright: '#393840'
  surface-container-lowest: '#0d0e14'
  surface-container-low: '#1b1b22'
  surface-container: '#1f1f26'
  surface-container-high: '#292930'
  surface-container-highest: '#34343b'
  on-surface: '#e4e1eb'
  on-surface-variant: '#c6c5d5'
  inverse-surface: '#e4e1eb'
  inverse-on-surface: '#303037'
  outline: '#908f9e'
  outline-variant: '#454652'
  surface-tint: '#bdc2ff'
  primary: '#bdc2ff'
  on-primary: '#121f8b'
  primary-container: '#5e6ad2'
  on-primary-container: '#fdfaff'
  inverse-primary: '#4854bb'
  secondary: '#95ccff'
  on-secondary: '#003352'
  secondary-container: '#03a5fc'
  on-secondary-container: '#00385a'
  tertiary: '#ffb867'
  on-tertiary: '#482900'
  tertiary-container: '#a56500'
  on-tertiary-container: '#fffaf8'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#dfe0ff'
  primary-fixed-dim: '#bdc2ff'
  on-primary-fixed: '#000965'
  on-primary-fixed-variant: '#2e3aa2'
  secondary-fixed: '#cde5ff'
  secondary-fixed-dim: '#95ccff'
  on-secondary-fixed: '#001d32'
  on-secondary-fixed-variant: '#004a75'
  tertiary-fixed: '#ffddbb'
  tertiary-fixed-dim: '#ffb867'
  on-tertiary-fixed: '#2b1700'
  on-tertiary-fixed-variant: '#673d00'
  background: '#121319'
  on-background: '#e4e1eb'
  surface-variant: '#34343b'
  dark-bg: '#08090A'
  dark-surface: '#0F1011'
  dark-text-primary: '#F7F8F8'
  dark-text-muted: '#8A8F98'
  dark-border: rgba(255, 255, 255, 0.05)
  light-bg: '#FAFAFA'
  light-surface: '#FFFFFF'
  light-text-primary: '#000000'
  light-text-muted: '#4A4A4A' # Adjusted for WCAG AA
  light-border: '#EBEBEB'
  status-error: '#C11B11'
  priority-high: '#C11B11'
  priority-medium: '#F59E0B'
  priority-low: '#8A8F98'
  glass-light: 'rgba(250, 250, 250, 0.8)'
  glass-dark: 'rgba(8, 9, 10, 0.8)'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  body-base:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  button:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 16px
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container-max: 1200px
  gutter: 1.5rem
  margin-mobile: 1rem
  stack-sm: 0.5rem
  stack-md: 1rem
  stack-lg: 2rem
---

# Design System: Lyra

## 1. Konsep Utama
Aplikasi jadwal dan to-do list yang mengutamakan fokus dan efisiensi. Menggunakan arsitektur dual-theme:
- **Dark Mode (Linear-inspired):** Mengurangi beban kognitif dengan warna latar `#0F1011`, teks `#F7F8F8`, dan border super tipis `rgba(255, 255, 255, 0.05)`.
- **Light Mode (Amie-inspired):** Terang, lega, dan membumi dengan latar `#FAFAFA` atau `#FFFFFF`, aksen `#11A8FF`, dan bayangan (*shadow*) yang lembut.
- **Interaksi (Todoist-inspired):** Animasi centang yang mulus, coretan teks (*strikethrough*) beranimasi, dan transisi *hover* yang memuaskan.

## 2. Tipografi & Radius
* **Font Family:** `Inter, sans-serif` (digunakan di kedua referensi).
* **Base Size:** `16px` untuk *body*, `14px` untuk tombol, dengan *line-height* `24px` di mode gelap agar nyaman dibaca.
* **Border Radius:**
  * Komponen/Card: `8px` (standar di Linear dan Amie).
  * Input Form: `6px`.
  * Tombol Aksi Sekunder: `9999px` (Pill-shaped ala Linear).

## 3. Palet Warna & Semantic Tokens (CSS Variables)

Sistem ini wajib diimplementasikan via Tailwind `extend` atau CSS murni di `@layer base`.

### Aksen & Primary
* **Light Mode Action:** `#11A8FF` (Amie Primary Blue) - Untuk tombol tambah dan checkbox aktif.
* **Dark Mode Action:** `#5E6AD2` (Linear Brand Primary) - Untuk tombol tambah dan checkbox aktif.
* **Destructive/Error:** `#C11B11` (Amie Error Red) - Untuk ikon hapus tugas.

### Background & Surface
* **Light Mode:** * App Background: `#FAFAFA`
  * Card/Input Surface: `#FFFFFF`
* **Dark Mode:**
  * App Background: `#08090A`
  * Card/Input Surface: `#0F1011`

### Teks & Konten
* **Light Mode:**
  * Teks Utama: `#000000`
  * Teks Sekunder/Muted: `#5C5C5C`
* **Dark Mode:**
  * Teks Utama: `#F7F8F8`
  * Teks Sekunder/Muted: `#8A8F98`

### Borders & Dividers
* **Light Mode:** `#CDCDCD` atau `#EBEBEB` (sangat halus).
* **Dark Mode:** `rgba(255, 255, 255, 0.05)` atau `#23252A`.

## 4. Interaksi & Animasi (The Todoist Feel)
* **Checkbox:** Saat diklik, lakukan scale down sedikit (`scale: 0.9`) lalu kembali normal dengan warna *fill* primary.
* **Strikethrough:** Jangan langsung muncul. Gunakan transisi CSS `width` dari 0% ke 100% pada elemen garis (*pseudo-element* atau span).
* **List Hover:** Berikan sedikit pergeseran latar belakang (`bg-opacity`) atau pergeseran posisi X (`translate-x-1`) saat *hover* item tugas.
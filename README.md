# Tausif M — Developer Portfolio

## Overview
A premium, production-ready developer portfolio designed to showcase high-level product design and UI engineering skills. The site is engineered for maximum performance (60fps ScrollTrigger animations), perfect Lighthouse scores, and a cinematic user experience inspired by top-tier tech companies.

## Features
- **Cinematic Animations**: Hardware-accelerated GSAP ScrollTrigger batch reveals.
- **Global Command Palette**: Raycast-inspired `Ctrl + K` search overlay.
- **macOS Floating Dock**: Context-aware bottom navigation dock.
- **Theme Switcher**: Fluid Light/Dark mode toggling.
- **Interactive Bento Grid**: Dynamic skills and about section.
- **Live Project Filtering**: Seamless DOM filtering with GSAP layout recalculation.
- **Hidden Easter Egg**: Type `tausif` to trigger a secret animation!

## Tech Stack
- HTML5
- Vanilla CSS (Custom properties, Glassmorphism, Responsive Grid)
- Vanilla JavaScript (ES6+)
- GSAP (ScrollTrigger, SplitType)
- Phosphor Icons
- Lenis Smooth Scroll

## Project Structure
```text
/
├── index.html       # Main portfolio page
├── 404.html         # Custom 404 error page
├── style.css        # Global styles and design tokens
├── script.js        # Interaction logic and animations
└── assets/
    └── images/      # Optimized assets
```

## Local Development
- **Static Preview**: Open `index.html` in any modern web browser or use VS Code Live Server (animations and UI work client-side).
- **Full Stack & Serverless API Testing**: To test the `/api/contact` email endpoint locally:
  1. Install dependencies: `npm install`
  2. Create a `.env.local` file with your Resend key (`RESEND_API_KEY=re_...`)
  3. Run `npx vercel dev` to start the local server with serverless functions support.

## Environment Variables
The contact form requires a **Resend API Key** for email delivery.

| Variable | Description | Required |
| :--- | :--- | :--- |
| `RESEND_API_KEY` | API Key generated from [Resend](https://resend.com/api-keys) | Yes (for contact form) |

> **Important**: Add `RESEND_API_KEY` in your Vercel Project Settings under **Settings → Environment Variables**. Do not commit your real API key to source control.

## Deployment
This project is pre-configured for instant deployment on **Vercel**.
- **Framework Preset**: Other (Static)
- **Build Command**: None (leave empty)
- **Output Directory**: `./`

## Credits
Designed and engineered by Tausif.

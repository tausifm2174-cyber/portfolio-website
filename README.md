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
Since this is a lightweight static site without a bundler, no installation is required!
1. Clone the repository: `git clone https://github.com/tausif/tausif-portfolio.git`
2. Open `index.html` in any modern web browser or use VS Code Live Server.

## Environment Variables
This project requires **NO environment variables**. It is entirely client-side and static.

## Deployment
This project is pre-configured for instant deployment on **Vercel**.
- **Framework Preset**: Other (Static)
- **Build Command**: None (leave empty)
- **Output Directory**: `./`

## Credits
Designed and engineered by Tausif.

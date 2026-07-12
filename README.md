# Flora — Flower Bouquet Shop

**Author:** Serhii Babiian

## Live Demo
[GitHub Pages](https://serhii-babiian-bachelor.github.io/UMT-markup-practice_P1-Babiian-S-S/)

## Figma Design
[Flora Figma](https://www.figma.com/design/CgeaYCIbMfmWL1bXFMwS6W/Flora)

---

## Local Development

### Requirements
- Node.js v18+

### Installation
```bash
npm install
```

### Run the project

**Terminal 1 — Start mock API (json-server):**
```bash
npx json-server --watch db.json --port 3001
```

**Terminal 2 — Start local server:**
```bash
npx serve . -l 3000
```

Then open: [http://localhost:3000](http://localhost:3000)

> ⚠️ The site must be opened via a local server (not file://) because it uses ES modules and API requests.

---

## API Endpoints (json-server)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/bouquets` | Get all bouquets |
| GET | `/bouquets?_page=1&_per_page=4` | Paginated bouquets |
| GET | `/bouquets?category=classic` | Filtered by category |
| GET | `/bestsellers` | Get top-selling bouquets |
| POST | `/orders` | Submit an order |

---

## Project Structure

```
flora/
├── index.html          # Main HTML file
├── db.json             # Mock API database (json-server)
├── package.json        # Node.js dependencies
├── css/
│   └── styles.css      # All styles (mobile-first)
├── js/
│   └── main.js         # App logic (axios, modals, pagination)
└── images/
    ├── icons.svg        # SVG sprite
    ├── logo.svg         # Header logo
    ├── logo-large.svg   # Footer logo
    ├── hero/            # Hero section images
    ├── about/           # About section images
    ├── bestsellers/     # Top-selling bouquet images
    ├── bouquets/        # Catalogue bouquet images
    └── contacts/        # Contact section images
```

## Features Implemented

### Scope 1
- ✅ Semantic HTML (header, main, footer, nav, h1-h2)
- ✅ Mobile-first CSS (375px / 768px / 1440px)
- ✅ CSS variables for all colors
- ✅ SVG sprite with `<use>`
- ✅ Mobile menu with `is-open` class
- ✅ Hover/focus transitions (250ms cubic-bezier)
- ✅ Deployed on GitHub Pages

### Scope 2
- ✅ `srcset` with 1x/2x for all `<img>`
- ✅ Modal windows with backdrop and `is-open`
- ✅ Order form with semantic markup (label, name, type="submit")
- ✅ Custom SVG checkbox for Privacy Policy
- ✅ axios for HTTP requests (async/await)
- ✅ json-server mock API
- ✅ Dynamic markup via `insertAdjacentHTML`
- ✅ Pagination with "Show More" button
- ✅ Category filtering with page reset
- ✅ Error handling for failed requests

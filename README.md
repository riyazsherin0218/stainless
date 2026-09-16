# THE STAINLESS (INDIA) — Website

A premium, animated static website for THE STAINLESS (INDIA), a stainless steel & metal scrap trading company in Madurai, Tamil Nadu.

## How to view it
Just open `index.html` in a browser — no build step, no server required for basic viewing. For the full experience (fonts, 3D hero, animations) an internet connection is needed, since those load from CDNs (Google Fonts, cdnjs for Three.js/GSAP). Everything degrades gracefully without internet: content stays fully visible, just without motion/3D.

To preview it exactly as a visitor would (recommended), serve the folder locally, e.g.:
```
python -m http.server 8000
```
then open `http://localhost:8000/`.

## Structure
- `index.html`, `about.html`, `products.html`, `what-we-buy.html`, `what-we-supply.html`, `applications.html`, `certificates.html`, `contact.html`, `privacy-policy.html`, `terms-and-conditions.html` — the final pages. **These are generated — edit the source instead (see below).**
- `body/` — the actual editable content for each page (just the `<section>` markup, no header/footer boilerplate).
- `build.py` — assembles `body/*.html` + the shared header/nav/footer/scripts into the final pages above. Run `python3 build.py` after editing anything in `body/` to regenerate the site.
- `css/style.css` — the entire design system (colors, type, components, animations).
- `js/main.js` — navigation, forms, WhatsApp links, modals, lightbox, cursor.
- `js/animations.js` — GSAP scroll reveals, counters, process-step activation.
- `js/three-hero.js` — the abstract 3D metallic hero/visuals (Three.js).
- `certificates/` — your real GST, Udyam, ZED, IEC and ISO certificates (PDF + web-ready preview images).
- `images/` — your logo (background removed) and favicon.
- `images/products/` — product/category photography used on the Home, Products, What We Supply and Applications pages (see "Product photography" below).

## Theme
The site uses a light / white theme (charcoal text on white/graphite surfaces, steel-teal accent `#0e7490`) per client feedback. All colors live as CSS variables at the top of `css/style.css` (`:root`) — change values there to re-theme site-wide rather than editing individual rules.

## Editing content
Open the relevant file in `body/`, make your change, then run:
```
python3 build.py
```
This regenerates all the final `.html` files with your header/nav/footer intact.

## Key facts already wired in (from your documents)
- Main Branch — Madurai: 18B, Gate Lock Road, New Ramnad Road, Anuppanadi, Madurai – 625009, Tamil Nadu
- Registered Office — Ahmedabad: Block-A, 606 Prahladnagar Trade Center, B/H Titanium City Center, Vejalpur, Ahmedabad, Gujarat – 380051
- Processing Plants: Tiruchirappalli (Trichy), Kollam, Thiruvananthapuram, Nagercoil, Dadra, Pondicherry
- Phone / WhatsApp: +91 93677 25423 — Contact Person: Silver Surya
- Email: thestainlessindia@gmail.com
- Godown (warehouse): 18, Gate Lock Road, Anuppanadi, Madurai – 625009, Tamil Nadu (near SNR Super Market) — see the "View Godown On Map" link on the Contact page
- GSTIN: 33BAIPB9194B1ZX
- Udyam Registration: UDYAM-TN-12-0010253
- IEC: BAIPB9194B
- ISO 9001:2015 (DQS Polska), ISO 14001:2015 (IQCS UK), ISO 9001:2008 (Sira) — see Certificates page for full details
- Map coordinates are the exact ones from your Udyam certificate (9.911391, 78.137966) — not guessed. The map shows the Main Branch (Madurai); the Registered Office and Processing Plants are listed as text (About + Contact + Footer) since no verified coordinates were supplied for them.

## Product photography
The Home, Products, What We Supply and Applications pages now show real photographs behind each product/category card instead of the earlier abstract gradient visuals. Since no real yard/product photos had been supplied yet, these are professional stock photos (Pexels, free commercial-use license) chosen to closely match each category — used as realistic placeholders, per your request to go ahead with stock photos for now.

To swap any of them for your own real photos later: just replace the matching file in `images/products/` with your photo (keep the same filename, e.g. `stainless-steel-scrap.jpg`), and it will update everywhere that image is used — no HTML/CSS editing needed. Recommended: landscape orientation, at least 1200px wide, JPG format.

## Forms
There's no backend. Every enquiry form builds a WhatsApp message from what the visitor typed and opens `wa.me` with it pre-filled to +91 93677 25423, with a "Call Now" fallback. If you later want form submissions emailed to you directly, that would need a small backend or a service like Formspree — happy to wire that in if you want it.

## Certificates page
Shows your eight real documents (Udyam, GST, ZED Bronze, ZED Pledge, IEC, ISO 9001:2015, ISO 14001:2015, ISO 9001:2008) with view + download. Add a new one later by dropping the file in `certificates/` and adding a card in `body/certificates.html`.

## Going live
This is a static site — it can be hosted as-is on any standard web host (Netlify, Vercel, GitHub Pages, or ordinary shared hosting) by uploading this whole folder. Say the word if you'd like it deployed to a live URL.

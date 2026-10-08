# Screenshot capture

Regenerates `assets/*.png` and the portfolio's `img/*.jpg` from the local
build, using Chrome.

```bash
npm install                 # once (puppeteer-core only)
node capture.js              # regenerate every image
node capture.js vendors.png  # regenerate just one
```

Reuses a server on `:8765` or starts one. See `CHROME_PATH`, `PORTFOLIO_IMG_DIR`.

Two review passes, for checking layout rather than for the README or the portfolio: `--phone` screenshots every tool full-page at a phone viewport (390x844, @2x), and `--dark` screenshots every tool at 1440x900 with the dark theme forced; `--phone --dark` runs both. Both write into `assets/review/`, a scratch folder that nothing in this README references and that can be committed or left untracked, whichever is more convenient at the time.

Link-preview cards: `og-workbench.html` and `og-portfolio.html` are the sources. Render each at 1200x630 with the installed Chrome:
`"C:\Program Files\Google\Chrome\Application\chrome.exe" --headless=new --hide-scrollbars --window-size=1200,630 --virtual-time-budget=8000 --screenshot=out.png file:///<path>/og-workbench.html`
then copy to `docs/og-image.png` (workbench) or `stevenmacchia.github.io/og-image.png` (portfolio).

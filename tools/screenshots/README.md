# Screenshot capture

Regenerates `assets/*.png` and the portfolio's `img/*.jpg` from the local
build, using Chrome.

```bash
npm install                 # once (puppeteer-core only)
node capture.js              # regenerate every image
node capture.js vendors.png  # regenerate just one
```

Reuses a server on `:8765` or starts one. See `CHROME_PATH`, `PORTFOLIO_IMG_DIR`.

Link-preview cards: `og-workbench.html` and `og-portfolio.html` are the sources. Render each at 1200x630 with the installed Chrome:
`"C:\Program Files\Google\Chrome\Application\chrome.exe" --headless=new --hide-scrollbars --window-size=1200,630 --virtual-time-budget=8000 --screenshot=out.png file:///<path>/og-workbench.html`
then copy to `docs/og-image.png` (workbench) or `stevenmacchia.github.io/og-image.png` (portfolio).

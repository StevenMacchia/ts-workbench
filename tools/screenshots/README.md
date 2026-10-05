# Screenshot capture

Regenerates `assets/*.png` and the portfolio's `img/*.jpg` from the local
build, using Chrome.

```bash
npm install                 # once (puppeteer-core only)
node capture.js              # regenerate every image
node capture.js vendors.png  # regenerate just one
```

Reuses a server on `:8765` or starts one. See `CHROME_PATH`, `PORTFOLIO_IMG_DIR`.

"use strict";
// Shared by measure.js and smoke.js: a static server for docs/ that gzips text like GitHub Pages does, and answers an
// unknown path with 404.html (status 404), like Pages. opts.noStore (default true) keeps the browser cache out of the numbers.
const fs = require("fs"), path = require("path"), http = require("http"), zlib = require("zlib");
const MIME = {".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css", ".png": "image/png", ".xml": "application/xml", ".txt": "text/plain", ".json": "application/json"};
module.exports = function serve(docs, port, opts){
  opts = opts || {};
  const DOCS = path.resolve(docs);
  const stats = {requests: [], reset(){ this.requests = []; }};
  return new Promise(res => {
    const srv = http.createServer((req, rsp) => {
      let p = decodeURIComponent(req.url.split("?")[0]); if(p.endsWith("/")) p += "index.html";
      let f = path.join(DOCS, p), status = 200;
      if(!f.startsWith(DOCS) || !fs.existsSync(f) || fs.statSync(f).isDirectory()){ f = path.join(DOCS, "404.html"); status = 404; }
      stats.requests.push(req.url);
      if(opts.delay && /\.js$/.test(f)) return setTimeout(() => send(), opts.delay);
      if(opts.failParts && /\/parts\//.test(req.url) && opts.failParts()){ rsp.writeHead(503); return rsp.end("down"); }
      send();
      function send(){
        const ext = path.extname(f), body = fs.readFileSync(f), h = {"content-type": MIME[ext] || "application/octet-stream", "cache-control": opts.noStore === false ? "max-age=600" : "no-store"};
        if(/\.(html|js|css|xml|txt|json)$/.test(ext) && /gzip/.test(req.headers["accept-encoding"] || "")){
          const z = zlib.gzipSync(body, {level: 6}); h["content-encoding"] = "gzip"; h["content-length"] = z.length; rsp.writeHead(status, h); rsp.end(z);
        } else { h["content-length"] = body.length; rsp.writeHead(status, h); rsp.end(body); }
      }
    }).listen(port, () => res(Object.assign(srv, {stats})));
  });
};

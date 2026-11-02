// Label preview: finds a PDF or ZPL label anywhere in the response and shows it in the Visualize view
const raw = res.getBody();
const text = typeof raw === 'string' ? raw : JSON.stringify(raw);

let html = null;
const isRawPdf = text.trimStart().startsWith('%PDF-');           // whole response is a PDF: Bruno already previews it
const pdfB64 = text.match(/JVBERi0[A-Za-z0-9+/=\s]+/);          // base64 of "%PDF-"
const zplRaw = text.match(/\^XA[\s\S]*?\^XZ/);                   // plain ZPL
const zplB64 = text.match(/XlhB[A-Za-z0-9+/=]+/);                // base64 of "^XA"

if (isRawPdf) {
  // nothing to do, use Bruno's built-in response preview
} else if (pdfB64) {
  const b64 = pdfB64[0].replace(/\s/g, '');
  html = `
    <div style="position:relative;height:620px;overflow:auto;background:#fff">
      <div id="msg" style="position:absolute;top:8px;left:8px;color:#888;font-family:sans-serif">Rendering PDF...</div>
      <canvas id="c" style="width:100%;display:block"></canvas>
    </div>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
    <script>
      try {
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        const bin = atob('${b64}');
        const bytes = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
        pdfjsLib.getDocument({ data: bytes }).promise
          .then(pdf => pdf.getPage(1))
          .then(page => {
            const v = page.getViewport({ scale: 2 });
            const c = document.getElementById('c');
            c.width = v.width; c.height = v.height;
            return page.render({ canvasContext: c.getContext('2d'), viewport: v }).promise;
          })
          .then(() => document.getElementById('msg').remove())
          .catch(e => { document.getElementById('msg').innerText = 'PDF error: ' + e.message; });
      } catch (e) { document.getElementById('msg').innerText = 'PDF error: ' + e.message; }
    </script>`;
} else if (zplRaw || zplB64) {
  const zpl = zplRaw ? zplRaw[0] : atob(zplB64[0]);
  html = `<img src="https://api.labelary.com/v1/printers/8dpmm/labels/4x6/0/${encodeURIComponent(zpl)}" style="max-width:100%;background:#fff">`;
} else {
  html = '<div style="color:#aaa;font-family:sans-serif">No PDF or ZPL label found in this response.</div>';
}

if (html) {
  bru.visualize('html', { name: 'Label', content: html });
}

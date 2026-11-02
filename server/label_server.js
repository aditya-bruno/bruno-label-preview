// Sample label server for the Bruno Label Preview workaround. Run: node server/label_server.js (port 8010)
const http = require('http');

function makePdf(text) {
  const content = `BT /F1 24 Tf 40 120 Td (${text}) Tj ET`;
  const objs = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 288 216] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>'
  ];
  let pdf = '%PDF-1.4\n';
  const offsets = [];
  objs.forEach((o, i) => { offsets.push(pdf.length); pdf += `${i + 1} 0 obj\n${o}\nendobj\n`; });
  const xref = pdf.length;
  pdf += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n`;
  offsets.forEach(off => { pdf += `${String(off).padStart(10, '0')} 00000 n \n`; });
  pdf += `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(pdf, 'latin1');
}

const pdf = makePdf('SHIP TO: Jane Doe');
const zpl = '^XA^CF0,40^FO50,50^FDSHIP TO: Jane Doe^FS^FO50,110^FD221B Baker St, London^FS^BY3^FO50,180^BCN,100,Y,N,N^FD123456789^FS^XZ';
const b64pdf = pdf.toString('base64');
const b64zpl = Buffer.from(zpl).toString('base64');

const routes = {
  '/label.pdf': ['application/pdf', pdf],
  '/label.zpl': ['text/plain', zpl],
  '/json-pdf': ['application/json', JSON.stringify({ trackingNumber: '123456789', label: { format: 'PDF', data: b64pdf } }, null, 2)],
  '/json-zpl': ['application/json', JSON.stringify({ trackingNumber: '123456789', label: { format: 'ZPL', data: b64zpl } }, null, 2)],
  '/xml-pdf': ['text/xml', `<?xml version="1.0"?>\n<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><ShipmentResponse><TrackingNumber>123456789</TrackingNumber><GraphicImage>${b64pdf}</GraphicImage></ShipmentResponse></soap:Body></soap:Envelope>`],
  '/json-plain': ['application/json', JSON.stringify({ trackingNumber: '123456789', status: 'created' }, null, 2)]
};

http.createServer((req, res) => {
  const r = routes[req.url];
  if (!r) { res.writeHead(404, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ routes: Object.keys(routes) })); }
  res.writeHead(200, { 'Content-Type': r[0] });
  res.end(r[1]);
}).listen(8010, () => console.log('label server on http://localhost:8010  routes:', Object.keys(routes).join(' ')));

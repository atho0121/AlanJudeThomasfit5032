// CSV needs no library. jsPDF and autotable are loaded on demand (below).

function cellValue(row, col) {
  const v = col.exportValue ? col.exportValue(row) : row[col.key]
  return v === null || v === undefined ? '' : String(v)
}

function csvEscape(text) {
  // Stop spreadsheet apps treating text as a formula (CSV injection).
  const s = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export function buildCSV(columns, rows) {
  const header = columns.map(c => csvEscape(c.label)).join(',')
  const lines = rows.map(row =>
    columns.map(c => csvEscape(cellValue(row, c))).join(',')
  )
  return [header, ...lines].join('\r\n')
}

function downloadBlob(filename, blob) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export function downloadCSV(filename, columns, rows) {
  // BOM so Excel opens UTF-8 correctly.
  const blob = new Blob(['\uFEFF' + buildCSV(columns, rows)], {
    type: 'text/csv;charset=utf-8'
  })
  downloadBlob(filename, blob)
}

// jsPDF's built-in fonts only cover Latin-1 (accents like é and ñ are fine).
// Swap common punctuation for safe equivalents and replace anything the font
// can't draw with '?' so the PDF never shows garbled symbols.
function pdfSafe(text) {
  return String(text)
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[^\x00-\xFF]/g, '?')
}

// Loaded only when a PDF is requested, so it isn't part of the main bundle.
async function loadPdfLibs() {
  const [jspdf, autotable] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable')
  ])
  return {
    jsPDF: jspdf.jsPDF,
    autoTable: autotable.default ?? autotable.autoTable
  }
}

export async function buildPDF(title, columns, rows) {
  const { jsPDF, autoTable } = await loadPdfLibs()
  const doc = new jsPDF({ orientation: 'landscape' })
  doc.setFontSize(16)
  doc.text(pdfSafe(title), 14, 16)
  doc.setFontSize(9)
  doc.text(`Generated ${new Date().toLocaleString('en-AU')}`, 14, 22)
  autoTable(doc, {
    startY: 27,
    margin: { left: 14, right: 14 },
    head: [columns.map(c => pdfSafe(c.label))],
    body: rows.map(row => columns.map(c => pdfSafe(cellValue(row, c)))),
    styles: { fontSize: 9, overflow: 'linebreak' },
    headStyles: { fillColor: [40, 122, 69] }
  })
  return doc
}

export async function downloadPDF(filename, title, columns, rows) {
  const doc = await buildPDF(title, columns, rows)
  doc.save(filename)
}

// Helpers for email attachments (SendGrid wants base64 content).
export function pdfToBase64(doc) {
  return doc.output('datauristring').split(',')[1]
}

export function textToBase64(text) {
  const bytes = new TextEncoder().encode(text)
  let binary = ''
  bytes.forEach(b => (binary += String.fromCharCode(b)))
  return btoa(binary)
}
// Utilities to render a common PDF header and footer across Staff Manager downloads

/**
 * Draws a common header on the current page
 * @param {jsPDF} pdf
 * @param {{title?: string, subtitle?: string}} options
 */
export function drawCommonHeader(pdf, options = {}) {
  const { title = 'Fire Brigade Staff Manager', subtitle = new Date().toLocaleDateString() } = options;

  // Use mm units consistently; leave top margin clear
  const left = 15;
  const right = pdf.internal.pageSize.getWidth() - 15;

  // Title
  pdf.setTextColor(20, 20, 20);
  pdf.setFontSize(18);
  pdf.text(title, (left + right) / 2, 18, { align: 'center' });

  // Subtitle
  pdf.setTextColor(100, 100, 100);
  pdf.setFontSize(10);
  pdf.text(subtitle, (left + right) / 2, 24, { align: 'center' });

  // Divider
  pdf.setDrawColor(178, 34, 34);
  pdf.setLineWidth(0.4);
  pdf.line(left, 28, right, 28);
}

/**
 * Draws a common footer on the current page
 * @param {jsPDF} pdf
 * @param {{leftText?: string, page?: number, pageCount?: number}} options
 */
export function drawCommonFooter(pdf, options = {}) {
  const { leftText = 'Fire Brigade • Staff Management System', page = 1, pageCount = 1 } = options;

  const left = 15;
  const right = pdf.internal.pageSize.getWidth() - 15;
  const bottom = pdf.internal.pageSize.getHeight() - 12; // margin from bottom

  // Divider
  pdf.setDrawColor(220, 220, 220);
  pdf.line(left, bottom - 6, right, bottom - 6);

  // Left text
  pdf.setTextColor(120, 120, 120);
  pdf.setFontSize(9);
  pdf.text(leftText, left, bottom);

  // Page numbers centered
  const pageLabel = `Page ${page} of ${pageCount}`;
  pdf.text(pageLabel, (left + right) / 2, bottom, { align: 'center' });
}

/**
 * After content is written, iterate pages to apply footers with page numbers
 * @param {jsPDF} pdf
 * @param {{leftText?: string}} options
 */
export function applyFootersToAllPages(pdf, options = {}) {
  const total = pdf.internal.getNumberOfPages();
  for (let p = 1; p <= total; p++) {
    pdf.setPage(p);
    drawCommonFooter(pdf, { ...options, page: p, pageCount: total });
  }
}



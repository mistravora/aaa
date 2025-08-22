export function printElement(elementId: string, title: string = 'Print') {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id '${elementId}' not found`);
    return;
  }

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    console.error('Unable to open print window');
    return;
  }

  // Copy styles and content
  const styles = Array.from(document.styleSheets)
    .map(styleSheet => {
      try {
        return Array.from(styleSheet.cssRules)
          .map(rule => rule.cssText)
          .join('');
      } catch (e) {
        return '';
      }
    })
    .join('');

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <style>
          ${styles}
          @media print {
            body { margin: 0; }
            .no-print { display: none !important; }
          }
        </style>
      </head>
      <body>
        ${element.innerHTML}
      </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();
  
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 250);
}

export function setupPrintStyles() {
  if (typeof document === 'undefined') return;
  
  const style = document.createElement('style');
  style.textContent = `
    @media print {
      /* 80mm Receipt */
      .receipt-80mm {
        width: 80mm !important;
        font-family: 'Courier New', monospace !important;
        font-size: 10px !important;
        line-height: 1.2 !important;
        margin: 0 !important;
        padding: 2mm !important;
      }
      
      /* A4 Invoice */
      .invoice-a4 {
        width: 210mm !important;
        min-height: 297mm !important;
        margin: 0 !important;
        padding: 15mm !important;
        font-size: 12px !important;
        line-height: 1.4 !important;
      }
      
      /* Label 50x30 */
      .label-50x30 {
        width: 50mm !important;
        height: 30mm !important;
        margin: 0 !important;
        padding: 1mm !important;
        font-size: 8px !important;
        line-height: 1.1 !important;
        page-break-after: always !important;
      }
      
      /* Common print rules */
      * {
        -webkit-print-color-adjust: exact !important;
        color-adjust: exact !important;
      }
      
      .no-print {
        display: none !important;
      }
      
      @page {
        margin: 0 !important;
      }
    }
  `;
  
  document.head.appendChild(style);
}
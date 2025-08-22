// Simple Code-128 barcode generator
export function generateCode128SVG(text: string, width: number = 200, height: number = 50): string {
  // This is a simplified version - in production you'd use a proper Code-128 library
  const bars = generateCode128Pattern(text);
  const barWidth = width / bars.length;
  
  let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`;
  svg += `<rect width="${width}" height="${height}" fill="white"/>`;
  
  let x = 0;
  for (let i = 0; i < bars.length; i++) {
    if (bars[i] === '1') {
      svg += `<rect x="${x}" y="0" width="${barWidth}" height="${height * 0.8}" fill="black"/>`;
    }
    x += barWidth;
  }
  
  // Add text
  svg += `<text x="${width / 2}" y="${height * 0.95}" text-anchor="middle" font-family="monospace" font-size="8">${text}</text>`;
  svg += '</svg>';
  
  return svg;
}

function generateCode128Pattern(text: string): string {
  // Simplified pattern generation - in production use a proper Code-128 implementation
  const patterns = {
    '0': '11011001100',
    '1': '11001101100',
    '2': '11001100110',
    '3': '10010011000',
    '4': '10010001100',
    '5': '10001001100',
    '6': '10011001000',
    '7': '10011000100',
    '8': '10001100100',
    '9': '11001001000',
  };
  
  let result = '11010000100'; // Start code B
  
  for (const char of text) {
    if (char in patterns) {
      result += (patterns as any)[char];
    } else {
      result += '11001001000'; // Default pattern
    }
  }
  
  result += '1100011101011'; // Stop pattern
  return result;
}

export function generateInternalBarcode(sku: string): string {
  // Generate internal barcode based on SKU
  const prefix = '200'; // Internal prefix
  const skuNum = sku.replace(/[^0-9]/g, '').padEnd(8, '0').slice(0, 8);
  const checkDigit = calculateCheckDigit(prefix + skuNum);
  return prefix + skuNum + checkDigit;
}

function calculateCheckDigit(code: string): string {
  let sum = 0;
  for (let i = 0; i < code.length; i++) {
    const digit = parseInt(code[i]);
    sum += i % 2 === 0 ? digit : digit * 3;
  }
  return ((10 - (sum % 10)) % 10).toString();
}
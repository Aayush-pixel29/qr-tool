import qrcode from 'qrcode-generator';

export type QRDesign = 'classic' | 'rounded' | 'dots' | 'gradient' | 'logo';

export interface QRMatrix {
  count: number;
  isDark: (row: number, col: number) => boolean;
}

/**
 * Check if the given module position is inside one of the 3 standard 7x7 finder patterns.
 */
export function isFinderPattern(row: number, col: number, count: number): boolean {
  // Top-left
  if (row < 7 && col < 7) return true;
  // Top-right
  if (row < 7 && col >= count - 7) return true;
  // Bottom-left
  if (row >= count - 7 && col < 7) return true;
  return false;
}

/**
 * Check if the given module position is inside the center logo cutout area.
 */
export function isCenterLogoArea(row: number, col: number, count: number): boolean {
  const marginFactor = 0.28; // ~28% center cutout
  const centerStart = Math.floor(count * (0.5 - marginFactor / 2));
  const centerEnd = Math.ceil(count * (0.5 + marginFactor / 2));
  return row >= centerStart && row < centerEnd && col >= centerStart && col < centerEnd;
}

/**
 * Classic style: Crisp black squares on white background for ultimate scan reliability.
 */
export function renderClassic(matrix: QRMatrix, size = 300): string {
  const { count, isDark } = matrix;
  const padding = 2; // modules of quiet zone
  const totalModules = count + padding * 2;
  const moduleSize = size / totalModules;

  let rects = '';
  for (let r = 0; r < count; r++) {
    for (let c = 0; c < count; c++) {
      if (isDark(r, c)) {
        const x = ((c + padding) * moduleSize).toFixed(2);
        const y = ((r + padding) * moduleSize).toFixed(2);
        const s = (moduleSize + 0.1).toFixed(2); // slight bleed prevents pixel gaps
        rects += `<rect x="${x}" y="${y}" width="${s}" height="${s}" fill="#0f172a" />`;
      }
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" shape-rendering="crispEdges">
    <rect width="${size}" height="${size}" fill="#ffffff" rx="12" />
    ${rects}
  </svg>`;
}

/**
 * Rounded style: Softly rounded square modules with smooth modern appearance.
 */
export function renderRounded(matrix: QRMatrix, size = 300): string {
  const { count, isDark } = matrix;
  const padding = 2;
  const totalModules = count + padding * 2;
  const moduleSize = size / totalModules;
  const rx = (moduleSize * 0.28).toFixed(2);

  let rects = '';
  for (let r = 0; r < count; r++) {
    for (let c = 0; c < count; c++) {
      if (isDark(r, c)) {
        const x = ((c + padding) * moduleSize + 0.3).toFixed(2);
        const y = ((r + padding) * moduleSize + 0.3).toFixed(2);
        const s = (moduleSize - 0.6).toFixed(2);
        rects += `<rect x="${x}" y="${y}" width="${s}" height="${s}" rx="${rx}" fill="#0f172a" />`;
      }
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
    <rect width="${size}" height="${size}" fill="#ffffff" rx="16" />
    ${rects}
  </svg>`;
}

/**
 * Dots style: Circular modules with solid rounded squares for the 3 finder pattern corners.
 */
export function renderDots(matrix: QRMatrix, size = 300): string {
  const { count, isDark } = matrix;
  const padding = 2;
  const totalModules = count + padding * 2;
  const moduleSize = size / totalModules;
  const radius = (moduleSize * 0.44).toFixed(2);
  const finderRx = (moduleSize * 0.25).toFixed(2);

  let elements = '';
  for (let r = 0; r < count; r++) {
    for (let c = 0; c < count; c++) {
      if (isDark(r, c)) {
        const inFinder = isFinderPattern(r, c, count);
        if (inFinder) {
          // Keep finder pattern corners as solid rounded squares for instant optical scanning
          const x = ((c + padding) * moduleSize + 0.2).toFixed(2);
          const y = ((r + padding) * moduleSize + 0.2).toFixed(2);
          const s = (moduleSize - 0.4).toFixed(2);
          elements += `<rect x="${x}" y="${y}" width="${s}" height="${s}" rx="${finderRx}" fill="#0f172a" />`;
        } else {
          // Regular data modules as dots
          const cx = ((c + padding + 0.5) * moduleSize).toFixed(2);
          const cy = ((r + padding + 0.5) * moduleSize).toFixed(2);
          elements += `<circle cx="${cx}" cy="${cy}" r="${radius}" fill="#0f172a" />`;
        }
      }
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
    <rect width="${size}" height="${size}" fill="#ffffff" rx="16" />
    ${elements}
  </svg>`;
}

/**
 * Gradient style: Modern rounded modules filled with a smooth linear gradient.
 */
export function renderGradient(matrix: QRMatrix, size = 300): string {
  const { count, isDark } = matrix;
  const padding = 2;
  const totalModules = count + padding * 2;
  const moduleSize = size / totalModules;
  const rx = (moduleSize * 0.25).toFixed(2);

  let rects = '';
  for (let r = 0; r < count; r++) {
    for (let c = 0; c < count; c++) {
      if (isDark(r, c)) {
        const x = ((c + padding) * moduleSize + 0.2).toFixed(2);
        const y = ((r + padding) * moduleSize + 0.2).toFixed(2);
        const s = (moduleSize - 0.4).toFixed(2);
        rects += `<rect x="${x}" y="${y}" width="${s}" height="${s}" rx="${rx}" fill="url(#qr-grad)" />`;
      }
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
    <defs>
      <linearGradient id="qr-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#4f46e5" />
        <stop offset="50%" stop-color="#7c3aed" />
        <stop offset="100%" stop-color="#ec4899" />
      </linearGradient>
    </defs>
    <rect width="${size}" height="${size}" fill="#ffffff" rx="16" />
    ${rects}
  </svg>`;
}

/**
 * Logo style: Rounded modules with a central cutout reserved for custom branding or logo overlay.
 * Uses high error-correction 'H' so the code scans flawlessly despite the center cutout.
 */
export function renderLogo(matrix: QRMatrix, size = 300): string {
  const { count, isDark } = matrix;
  const padding = 2;
  const totalModules = count + padding * 2;
  const moduleSize = size / totalModules;
  const rx = (moduleSize * 0.25).toFixed(2);

  let rects = '';
  for (let r = 0; r < count; r++) {
    for (let c = 0; c < count; c++) {
      if (isDark(r, c)) {
        // Skip modules inside the center logo cutout area
        if (isCenterLogoArea(r, c, count)) {
          continue;
        }
        const x = ((c + padding) * moduleSize + 0.2).toFixed(2);
        const y = ((r + padding) * moduleSize + 0.2).toFixed(2);
        const s = (moduleSize - 0.4).toFixed(2);
        rects += `<rect x="${x}" y="${y}" width="${s}" height="${s}" rx="${rx}" fill="#0f172a" />`;
      }
    }
  }

  // Calculate center badge dimensions
  const centerBoxSize = size * 0.24;
  const centerBoxPos = (size - centerBoxSize) / 2;
  const iconSize = centerBoxSize * 0.55;
  const iconPos = (size - iconSize) / 2;

  // Center logo badge with a sleek spark/qr icon placeholder
  const centerBadge = `
    <g>
      <rect x="${centerBoxPos.toFixed(2)}" y="${centerBoxPos.toFixed(2)}" width="${centerBoxSize.toFixed(2)}" height="${centerBoxSize.toFixed(2)}" rx="10" fill="#ffffff" stroke="#e2e8f0" stroke-width="2" />
      <svg x="${iconPos.toFixed(2)}" y="${iconPos.toFixed(2)}" width="${iconSize.toFixed(2)}" height="${iconSize.toFixed(2)}" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        <circle cx="12" cy="12" r="3" fill="#6366f1" />
      </svg>
    </g>
  `;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
    <rect width="${size}" height="${size}" fill="#ffffff" rx="16" />
    ${rects}
    ${centerBadge}
  </svg>`;
}

/**
 * Generate a styled SVG string for the specified text and design.
 */
export function generateQRCodeSvg(text: string, design: QRDesign = 'classic', size = 300): string {
  // Always use Level 'H' (30% recovery) for logo cutout design, 'M' (15% recovery) by default
  const errorCorrection = design === 'logo' ? 'H' : 'M';
  const typeNumber = 0; // 0 = automatic type selection based on data length

  const qr = qrcode(typeNumber, errorCorrection);
  qr.addData(text);
  qr.make();

  const count = qr.getModuleCount();
  const matrix: QRMatrix = {
    count,
    isDark: (row: number, col: number) => qr.isDark(row, col)
  };

  switch (design) {
    case 'rounded':
      return renderRounded(matrix, size);
    case 'dots':
      return renderDots(matrix, size);
    case 'gradient':
      return renderGradient(matrix, size);
    case 'logo':
      return renderLogo(matrix, size);
    case 'classic':
    default:
      return renderClassic(matrix, size);
  }
}

/**
 * CSV Exporter for KDP Metadata
 * Saves generated metadata to CSV files for easy import to spreadsheets
 */

import { createWriteStream } from 'fs';
import { Metadata } from '../types/index.js';

export class CSVExporter {
  /**
   * Export metadata to CSV file
   */
  static async exportMetadata(
    metadata: Metadata[],
    outputPath: string
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const stream = createWriteStream(outputPath, { encoding: 'utf8' });

      stream.on('error', reject);
      stream.on('finish', resolve);

      // Write header
      const headers = [
        'Title',
        'Subtitle',
        'Author',
        'Niche',
        'Keywords',
        'Description',
      ];
      stream.write(headers.map((h) => this.escapeCSV(h)).join(',') + '\n');

      // Write rows
      metadata.forEach((item) => {
        const row = [
          item.title,
          item.subtitle,
          item.author,
          item.niche,
          item.keywords.join('; '),
          item.description,
        ];

        stream.write(row.map((cell) => this.escapeCSV(cell)).join(',') + '\n');
      });

      stream.end();
    });
  }

  /**
   * Export metadata with HTML descriptions to separate files
   */
  static async exportWithHTML(
    metadata: Metadata[],
    csvPath: string,
    htmlDir: string
  ): Promise<void> {
    // Export CSV
    await this.exportMetadata(metadata, csvPath);

    // Export HTML descriptions
    const fs = await import('fs').then((m) => m.promises);

    for (let i = 0; i < metadata.length; i++) {
      const item = metadata[i];
      const filename = `${htmlDir}/${item.title.replace(/[^a-z0-9]+/gi, '_').toLowerCase()}_${i + 1}.html`;

      const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${this.escapeHTML(item.title)}</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }
    h1 { color: #333; }
    .metadata { background: #f4f4f4; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
    .keywords { display: flex; flex-wrap: wrap; gap: 8px; }
    .keyword { background: #007bff; color: white; padding: 5px 10px; border-radius: 3px; font-size: 14px; }
  </style>
</head>
<body>
  <h1>${this.escapeHTML(item.title)}</h1>
  <h2>${this.escapeHTML(item.subtitle)}</h2>

  <div class="metadata">
    <p><strong>Author:</strong> ${this.escapeHTML(item.author)}</p>
    <p><strong>Niche:</strong> ${this.escapeHTML(item.niche)}</p>
    <div>
      <strong>Keywords:</strong>
      <div class="keywords">
        ${item.keywords.map((k) => `<span class="keyword">${this.escapeHTML(k)}</span>`).join('')}
      </div>
    </div>
  </div>

  <h3>Description</h3>
  ${item.description}

  <hr>
  <p><small>Generated with KDP Generator</small></p>
</body>
</html>`;

      await fs.writeFile(filename, htmlContent);
    }

    console.log(`✅ Exported ${metadata.length} HTML files to ${htmlDir}/`);
  }

  /**
   * Escape CSV values
   */
  private static escapeCSV(value: string): string {
    if (typeof value !== 'string') {
      value = String(value);
    }

    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }

    return value;
  }

  /**
   * Escape HTML entities
   */
  private static escapeHTML(text: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };

    return text.replace(/[&<>"']/g, (char) => map[char]);
  }
}

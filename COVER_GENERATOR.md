# KDP Cover PDF Generator

Generate professional, print-ready book covers for Amazon KDP with precise dimensions, bleed, and spine calculations.

## Features

✅ **KDP-Compliant Dimensions**
- Automatic spine width calculation (page_count × 0.002252")
- 0.125" bleed on all sides
- Supports all standard KDP trim sizes (5"×8" to 8.5"×11")

✅ **Multi-Region Layout**
- Back cover
- Spine (with vertical text)
- Front cover
- Bleed guides (visual reference)

✅ **Customizable Design**
- Custom background colors
- Text color control
- Adjustable font sizes
- Cover image support (PNG/JPEG)
- Title, subtitle, and author text

✅ **Smart Text Positioning**
- **Automatic line height calculation** based on font size (1.3x multiplier)
- **Text wrapping detection** for long titles and subtitles
- **Dynamic spacing** between title, subtitle, and author
- Proper vertical positioning even with multi-line text
- Prevents text overflow and overlap

✅ **Professional Output**
- Vector-based PDF (scalable)
- Print-ready quality
- Minimal file size (~1-2 KB for text-only)

## Configuration

Create a JSON file with your cover specifications:

```json
{
  "title": "Mindful Moments: A Guided Journaling Journey",
  "subtitle": "Cultivate Inner Peace and Clarity Through Reflective Writing",
  "author": "Your Name",
  "description": "A guided journal for meditation and mindfulness",
  "width": 6,
  "height": 9,
  "pageCount": 100,
  "backgroundColor": "#F5F5DC",
  "textColor": "#2C3E50",
  "coverImagePath": "./path/to/image.png",
  "fontSize": {
    "title": 48,
    "subtitle": 24,
    "author": 16
  }
}
```

### Configuration Options

| Option | Type | Description | Default |
|--------|------|-------------|---------|
| `title` | string | Main book title | Required |
| `subtitle` | string | Subtitle (appears below title) | Optional |
| `author` | string | Author name (appears at bottom) | Optional |
| `width` | number | Interior width in inches (2.5-8.5") | Required |
| `height` | number | Interior height in inches (4-11") | Required |
| `pageCount` | number | Total page count (24-828) | Required |
| `backgroundColor` | string | Hex color for background | #FFFFFF |
| `textColor` | string | Hex color for text | #000000 |
| `coverImagePath` | string | Path to cover image (PNG/JPEG) | null |
| `fontSize.title` | number | Title font size in points | 48 |
| `fontSize.subtitle` | number | Subtitle font size in points | 24 |
| `fontSize.author` | number | Author font size in points | 16 |

## Usage

### CLI

```bash
# Generate cover from config
node dist/cli.js generate-cover examples/cover-config.json -o my-cover.pdf

# Calculate dimensions first
node dist/cli.js cover-dims 6 9 100
```

### Programmatically

```typescript
import { KDPGenerator } from './src/index.js';

const generator = new KDPGenerator();

const coverConfig = {
  title: 'My Book Title',
  subtitle: 'A compelling subtitle',
  author: 'Your Name',
  width: 6,
  height: 9,
  pageCount: 100,
  backgroundColor: '#FFFFFF',
  textColor: '#000000',
};

await generator.generateCover(coverConfig, 'cover.pdf');
```

## Output Specifications

### Dimensions (6×9" example with 100 pages)

```
Total Width:  12.475" (front + spine + back + bleeds)
Total Height: 9.250" (height + top/bottom bleeds)

Layout:
- Back Cover:  0.13" - 6.13" (6" wide)
- Spine:       6.13" - 6.36" (0.2252" wide)
- Front Cover: 6.36" - 12.36" (6" wide)
- Bleeds:      0.125" on all sides
```

### File Size

- Text-only covers: ~1-2 KB
- With cover images: ~50-200 KB (depending on image resolution)

## KDP Requirements

✅ **Print-Ready Format**
- PDF version 1.7
- RGB or CMYK color space
- Embedded fonts (optional for system fonts)
- No transparency

✅ **Bleed & Safe Area**
- Bleed: 0.125" (built-in)
- Safe area: 0.25" from content edge
- Spine text: centered horizontally

✅ **Resolution**
- Minimum 300 DPI (built-in with vector format)
- Images: recommend 300 DPI

## Color Recommendations

### Professional Palettes

**Warm & Welcoming**
```json
{
  "backgroundColor": "#F5F5DC",
  "textColor": "#2C3E50"
}
```

**Dark & Modern**
```json
{
  "backgroundColor": "#2C3E50",
  "textColor": "#ECF0F1"
}
```

**Serene & Calm**
```json
{
  "backgroundColor": "#E8F4F8",
  "textColor": "#1A5C6B"
}
```

**Energetic & Bold**
```json
{
  "backgroundColor": "#FFF8DC",
  "textColor": "#D32F2F"
}
```

## Examples

### Basic Text-Only Cover

```bash
node dist/cli.js generate-cover examples/cover-config.json -o cover.pdf
```

### With Custom Colors

```json
{
  "title": "Productivity Mastery",
  "subtitle": "Your Complete Guide to Time Management",
  "author": "Jane Doe",
  "width": 6,
  "height": 9,
  "pageCount": 120,
  "backgroundColor": "#2C3E50",
  "textColor": "#ECF0F1",
  "fontSize": {
    "title": 52,
    "subtitle": 28,
    "author": 18
  }
}
```

### Complete Book Generation

```bash
npx ts-node examples/complete-book-generation.ts
```

This generates:
- Interior PDF with lined pages
- Cover PDF with spine
- Metadata CSV for KDP listing

## Text Positioning & Line Height

The cover generator automatically calculates proper spacing based on font sizes:

### Line Height Calculation

```
Line Height = Font Size × 1.3
```

**Example:**
- Title (48pt) → Line height: 62.4pt
- Subtitle (24pt) → Line height: 31.2pt
- Author (16pt) → Line height: 20.8pt

### Text Wrapping

The generator estimates text lines based on:
- Font size
- Average character width (0.55× font size)
- Available width on cover

**Example (6" width):**
- Title at 48pt: ~10 characters per line
- Subtitle at 24pt: ~20 characters per line
- Longer text automatically wraps to next line

### Spacing Between Elements

Default spacing:
- Between title and subtitle: 20pt
- Between subtitle and author: 20pt
- Top/bottom margins: 30pt

---

## Tips & Best Practices

1. **Title Length**: Keep titles under 100 characters for readability
2. **Multi-line Titles**: Longer titles wrap automatically - no manual breaks needed
3. **Color Contrast**: Ensure good contrast between text and background
4. **Font Sizes**: Larger sizes (44+) work better for titles
5. **Cover Image**: Use high-quality images at least 3000×4500px
6. **Testing**: Download your PDF and check bleed guides in print preview
7. **File Organization**: Store configs in `examples/` for reusability

### Text Sizing Guide

| Element | Recommended Size | Max Characters | Notes |
|---------|-----------------|-----------------|-------|
| **Title** | 36-52pt | 50-100 | Main hook, eye-catching |
| **Subtitle** | 18-28pt | 100-200 | Descriptive, complements title |
| **Author** | 12-18pt | 50+ | Name only recommended |

## Troubleshooting

### "Cannot find module" error
```bash
npm run build
```

### Cover looks distorted
- Check that width/height/pageCount are valid KDP specs
- Run `node dist/cli.js validate <width> <height> <pageCount>`

### Text not visible
- Verify textColor has enough contrast with backgroundColor
- Check font sizes aren't too small

### File too large
- Remove or compress cover images
- Use solid background colors instead of gradients

## Related Commands

```bash
# Validate print specifications
node dist/cli.js validate 6 9 100

# Calculate exact cover dimensions
node dist/cli.js cover-dims 6 9 100

# Generate interior PDF
node dist/cli.js generate-interior examples/lined-notebook-config.json

# Generate complete book with metadata
npx ts-node examples/complete-book-generation.ts
```

## See Also

- [Interior PDF Generator](./README.md#interior-pdf-generator)
- [Metadata Generator](./README.md#metadata-generation-module)
- [KDP Math Utilities](./README.md#kdp-math-utilities)

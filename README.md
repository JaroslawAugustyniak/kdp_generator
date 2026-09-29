# KDP Generator

A scalable, modular Node.js CLI automation tool for generating mass assets (PDFs and metadata) for Amazon KDP low-content books (notebooks, journals, planners).

## Architecture

```
src/
├── kdp-math/           # KDP dimension calculations & validation
├── pdf-generator/      # PDF generation modules
│   └── interior.ts    # Interior PDF generator
├── metadata/          # Metadata generation (OpenAI integration)
├── types/             # TypeScript interfaces
├── index.ts           # Main orchestrator
└── cli.ts             # CLI commands
```

## Features

### Core Components

1. **KDP Math Utilities** (`src/kdp-math/`)
   - Precise dimension calculations with bleed and spine width
   - Interior page dimension conversion (inches → points)
   - Cover layout calculation (front, spine, back)
   - Print specification validation

2. **Interior PDF Generator** (`src/pdf-generator/interior.ts`)
   - Multiple content types: lined, dotted, graph, blank, checkboxes
   - Customizable margins and line heights
   - Paper color options: white, cream, yellow
   - Supports batch page generation

3. **Docker Setup**
   - MySQL database for storing metadata
   - Node.js API server for future integrations
   - CLI runner for batch generation
   - Integrated with nginx-proxy-network

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Build TypeScript

```bash
npm run build
```

### 3. Create .env file

```bash
cp .env.example .env
# Edit .env with your settings
```

### 4. Run with Docker

```bash
docker-compose up
```

### 5. Generate Interior PDF

```bash
node dist/cli.js generate-interior examples/lined-notebook-config.json -o notebook.pdf
```

## CLI Commands

### Generate Interior PDF
```bash
node dist/cli.js generate-interior <config-file> [--output output.pdf]
```

Example:
```bash
node dist/cli.js generate-interior examples/lined-notebook-config.json -o my-notebook.pdf
```

### Validate Print Specifications
```bash
node dist/cli.js validate <width> <height> <page-count>
```

Example:
```bash
node dist/cli.js validate 6 9 100
```

### Calculate Cover Dimensions
```bash
node dist/cli.js cover-dims <width> <height> <page-count>
```

Example:
```bash
node dist/cli.js cover-dims 6 9 100
```

## Configuration

### Interior Config JSON

```json
{
  "title": "My Notebook",
  "pageCount": 100,
  "width": 6,
  "height": 9,
  "pages": [
    {
      "contentType": "blank"
    },
    {
      "contentType": "lined",
      "paperColor": "white",
      "lineHeight": 14,
      "lineColor": "#CCCCCC"
    }
  ],
  "marginTop": 36,
  "marginBottom": 36,
  "marginLeft": 36,
  "marginRight": 36
}
```

### Supported Content Types

- **lined**: Horizontal lines for writing
- **dotted**: Dot grid pattern
- **graph**: Grid squares
- **blank**: Plain pages
- **checkboxes**: Checkbox + line pattern

### Supported Paper Colors

- white
- cream
- yellow

## KDP Specifications

### Trim Sizes (Supported)

- 5" × 8"
- 5.5" × 8.5"
- 6" × 9" (Most common for KDP)
- 7" × 10"
- 8" × 10"
- 8.5" × 11"

### Constraints

- **Width**: 2.5" - 8.5"
- **Height**: 4" - 11"
- **Page Count**: 24 - 828
- **Bleed**: 0.125" (all sides)
- **Spine Width**: page_count × 0.002252" (standard white paper)

## Development

### Watch mode

```bash
npm run dev
```

### Lint

```bash
npm run lint
```

### Clean build

```bash
npm run clean && npm run build
```

## Next Steps

1. **Cover PDF Generator** - Generate print-ready covers with bleed & spine
2. **Metadata Module** - OpenAI integration for titles, subtitles, keywords
3. **CSV Export** - Save metadata to CSV files
4. **Database Layer** - Persist generated assets and metadata
5. **Batch Processing** - Handle multiple book generation

## Dependencies

- **pdf-lib**: Pure JavaScript PDF generation
- **openai**: Official OpenAI SDK
- **csv-writer**: CSV file generation
- **mysql2**: MySQL database driver
- **yargs**: CLI command parsing
- **dotenv**: Environment variables
- **typescript**: Type safety

## License

MIT

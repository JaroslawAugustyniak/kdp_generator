# Cover Generator Examples

Practical examples showing different cover configurations with proper line height calculations.

## Example 1: Short Title & Subtitle

**File:** `cover-config.json`

```json
{
  "title": "Mindful Moments: A Guided Journaling Journey",
  "subtitle": "Cultivate Inner Peace and Clarity Through Reflective Writing",
  "author": "Your Name",
  "width": 6,
  "height": 9,
  "pageCount": 100,
  "backgroundColor": "#F5F5DC",
  "textColor": "#2C3E50",
  "fontSize": {
    "title": 48,
    "subtitle": 24,
    "author": 16
  }
}
```

**Text Analysis:**
- Title: "Mindful Moments: A Guided Journaling Journey" (44 chars)
  - Font size: 48pt
  - Line height: 48 × 1.3 = 62.4pt
  - Estimated lines: 1
  - Total height: 62.4pt

- Subtitle: "Cultivate Inner Peace and Clarity Through Reflective Writing" (60 chars)
  - Font size: 24pt
  - Line height: 24 × 1.3 = 31.2pt
  - Estimated lines: 1
  - Total height: 31.2pt

**Spacing:**
- Top margin: 30pt
- Title to subtitle: 20pt
- Subtitle to author: 20pt
- Bottom margin: 30pt

---

## Example 2: Long Title (Multi-line)

**File:** `cover-config-long-text.json`

```json
{
  "title": "The Complete Guide to Productivity, Time Management, and Goal Achievement in Your Personal and Professional Life",
  "subtitle": "Proven strategies and techniques to maximize your efficiency, overcome procrastination, and achieve your dreams",
  "author": "Your Name",
  "width": 6,
  "height": 9,
  "pageCount": 150,
  "backgroundColor": "#F5F5DC",
  "textColor": "#2C3E50",
  "fontSize": {
    "title": 36,
    "subtitle": 18,
    "author": 14
  }
}
```

**Text Analysis:**
- Title: 107 characters
  - Font size: 36pt
  - Line height: 36 × 1.3 = 46.8pt
  - Avg char width: 36 × 0.55 = 19.8pt
  - Chars per line (6" = 432pt): ~21 chars
  - Estimated lines: 107 ÷ 21 = **~5 lines**
  - Total height: 46.8 × 5 = **234pt**

- Subtitle: 100 characters
  - Font size: 18pt
  - Line height: 18 × 1.3 = 23.4pt
  - Avg char width: 18 × 0.55 = 9.9pt
  - Chars per line: ~43 chars
  - Estimated lines: 100 ÷ 43 = **~2-3 lines**
  - Total height: 23.4 × 2.5 = **~58pt**

---

## Example 3: Minimal Style (Short & Bold)

```json
{
  "title": "Success",
  "subtitle": "A practical guide to winning",
  "author": "Jane Doe",
  "width": 5.5,
  "height": 8.5,
  "pageCount": 80,
  "backgroundColor": "#2C3E50",
  "textColor": "#ECF0F1",
  "fontSize": {
    "title": 64,
    "subtitle": 28,
    "author": 16
  }
}
```

**Text Analysis:**
- Title: 7 characters (very short)
  - Line height: 64 × 1.3 = 83.2pt
  - Estimated lines: 1
  - Total: 83.2pt

- Subtitle: 25 characters
  - Line height: 28 × 1.3 = 36.4pt
  - Estimated lines: 1
  - Total: 36.4pt

---

## Example 4: Educational Book (Dense Content)

```json
{
  "title": "Advanced Python Programming: Design Patterns, Data Structures, and Optimization Techniques for Production-Ready Applications",
  "subtitle": "Master advanced concepts including concurrency, async/await, metaclasses, and performance optimization with real-world examples",
  "author": "Dr. Software Engineer",
  "width": 6,
  "height": 9,
  "pageCount": 400,
  "backgroundColor": "#FFFFFF",
  "textColor": "#000000",
  "fontSize": {
    "title": 32,
    "subtitle": 16,
    "author": 12
  }
}
```

**Text Analysis:**
- Title: 122 characters
  - Font size: 32pt
  - Line height: 32 × 1.3 = 41.6pt
  - Estimated lines: ~8 lines
  - Total: ~332.8pt

- Subtitle: 126 characters
  - Font size: 16pt
  - Line height: 16 × 1.3 = 20.8pt
  - Estimated lines: ~6-7 lines
  - Total: ~145.6pt

---

## Example 5: Fiction Novel (Artistic)

```json
{
  "title": "The Midnight Prophecy",
  "subtitle": "A tale of mystery, magic, and unexpected destiny",
  "author": "Author Name",
  "width": 5,
  "height": 8,
  "pageCount": 250,
  "backgroundColor": "#1A1A2E",
  "textColor": "#EAEAEA",
  "fontSize": {
    "title": 52,
    "subtitle": 22,
    "author": 14
  }
}
```

**Layout:**
- Clean, centered design
- Generous spacing for artistic feel
- Bold title, elegant subtitle

---

## Example 6: Fitness/Health (Energetic)

```json
{
  "title": "Transform Your Body: 90-Day Fitness Challenge",
  "subtitle": "Scientifically-proven workouts, nutrition plans, and accountability strategies for real results",
  "author": "Fitness Coach",
  "width": 6,
  "height": 9,
  "pageCount": 120,
  "backgroundColor": "#FF6B35",
  "textColor": "#FFFFFF",
  "fontSize": {
    "title": 44,
    "subtitle": 20,
    "author": 14
  }
}
```

**Features:**
- Bold, energetic colors
- Clear, motivational messaging
- Readable on dark background

---

## Line Height Reference Table

| Font Size | Line Height | Best For |
|-----------|------------|----------|
| 12pt | 15.6pt | Small text, author names |
| 14pt | 18.2pt | Author, small subtitles |
| 16pt | 20.8pt | Subtitles, body text |
| 18pt | 23.4pt | Small subtitles |
| 20pt | 26pt | Medium subtitles |
| 24pt | 31.2pt | Subtitles |
| 28pt | 36.4pt | Large subtitles |
| 32pt | 41.6pt | Large titles |
| 36pt | 46.8pt | Titles (multi-line) |
| 44pt | 57.2pt | Main titles |
| 48pt | 62.4pt | Large titles |
| 52pt | 67.6pt | Extra large titles |
| 64pt | 83.2pt | Massive titles |

---

## Testing Your Covers

After generating, verify the layout:

1. **Open in PDF viewer** to see actual rendering
2. **Check spacing** - text shouldn't overlap
3. **Review bleed areas** - guides help with alignment
4. **Test printing** - use draft mode first
5. **Compare with actual books** - ensure competitive look

---

## Common Issues & Solutions

### Issue: Text overlapping

**Cause:** Font size too large or subtitle too long

**Solution:**
- Reduce font sizes by 4-8pt
- Shorten subtitle text
- Use smaller font size for subtitle

### Issue: Too much empty space

**Cause:** Short title with large font size

**Solution:**
- Increase font size by 4-8pt
- Longer, more descriptive title
- Smaller margins

### Issue: Text cut off at edges

**Cause:** Text exceeds available width

**Solution:**
- Reduce font size
- Use shorter text
- Check your PDF margins

### Issue: Uneven spacing

**Cause:** Line height calculation differences

**Solution:**
- Use standard font sizes from reference table
- Maintain consistent font ratios (title 2-3x subtitle)
- Test in PDF viewer before print

---

## Generating Your Covers

```bash
# Simple title & subtitle
node dist/cli.js generate-cover examples/cover-config.json -o my-cover.pdf

# Long, complex text
node dist/cli.js generate-cover examples/cover-config-long-text.json -o complex-cover.pdf

# With custom config
node dist/cli.js generate-cover my-config.json -o output.pdf
```

---

## Pro Tips

1. **Shorter is better** - Punchy titles work better than long ones
2. **Test wrapping** - Use `estimateTextLines()` to preview
3. **White space matters** - Don't cram all text in center
4. **Color contrast** - Ensure 7:1 ratio for accessibility
5. **Consistency** - Match your book's genre and tone
6. **Competition** - Research similar books' cover designs

---

**Happy designing! 🎨**

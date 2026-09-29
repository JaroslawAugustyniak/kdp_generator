# KDP Generator - Testing Guide

Complete guide to test the entire workflow from metadata generation to PDF output.

## Prerequisites

```bash
# Ensure dependencies are installed
npm install

# Build the project
npm run build

# Verify .env has OPENAI_API_KEY
cat .env
```

## 1️⃣ Unit Tests: Individual Components

### Test 1A: KDP Math Utilities

```bash
node dist/cli.js validate 6 9 100
```

**Expected Output:**
```
✓ Print specifications validated
```

**Test Different Specs:**
```bash
# Valid specs
node dist/cli.js validate 5 8 50
node dist/cli.js validate 8.5 11 200

# Invalid specs (should fail)
node dist/cli.js validate 2 4 10      # Too small
node dist/cli.js validate 10 12 500   # Too large
```

---

### Test 1B: Cover Dimension Calculations

```bash
node dist/cli.js cover-dims 6 9 100
```

**Expected Output:**
```
📐 Cover Dimensions (in inches):
  Width: 12.475"
  Height: 9.250"
  Spine Width: 0.2252"
  Bleed: 0.125"

📍 Layout Regions:
  backCover:    Position: (0.13", 0.13"), Size: 6.00" x 9.00"
  spine:        Position: (6.13", 0.13"), Size: 0.23" x 9.00"
  frontCover:   Position: (6.35", 0.13"), Size: 6.00" x 9.00"
```

**Verify Math:**
- Total width = 6 + 0.2252 + 6 + (0.125 × 2) = 12.475" ✓
- Spine = 100 × 0.002252 = 0.2252" ✓

---

### Test 1C: OpenAI API Connection

```bash
npx ts-node test-openai.ts
```

**Expected Output:**
```
🧪 Testing OpenAI API connection...
📝 API Key: sk-proj-Z5...
✅ Connection successful!
📬 Response: OpenAI API is working!
💰 Model: gpt-4o-mini-2024-07-18
```

---

### Test 1D: Metadata Generation

```bash
node dist/cli-metadata.js generate "meditation and mindfulness" --style "guided journal"
```

**Expected Output:**
```
📝 Generating metadata for niche: "meditation and mindfulness"
  ⏳ Generating titles...
  ⏳ Generating subtitle...
  ⏳ Generating keywords...
  ⏳ Generating description...
✅ Metadata generation complete!

✅ Metadata Generated!

Title:      Mindful Moments: A Guided Journaling Journey
Subtitle:   Cultivate Inner Peace and Clarity Through Reflective Writing
Keywords:   guided journaling, mindfulness exercises, meditation journal, ...
Description: <h2>Discover Your Path...</h2>...
```

---

## 2️⃣ PDF Generation Tests

### Test 2A: Interior PDF Generation

```bash
node dist/cli.js generate-interior examples/lined-notebook-config.json -o test-interior.pdf
```

**Expected Output:**
```
✓ Print specifications validated
✓ Interior PDF generated: test-interior.pdf
✓ Done!
```

**Verify File:**
```bash
ls -lh test-interior.pdf
file test-interior.pdf
```

**Expected:**
- File size: 30-50 KB
- Type: PDF document, version 1.7

---

### Test 2B: Cover PDF Generation

```bash
node dist/cli.js generate-cover examples/cover-config.json -o test-cover.pdf
```

**Expected Output:**
```
✓ Print specifications validated
✓ Cover PDF generated: test-cover.pdf
✓ Done!
```

**Verify File:**
```bash
ls -lh test-cover.pdf
file test-cover.pdf
```

**Expected:**
- File size: 1-3 KB (text-only)
- Type: PDF document, version 1.7

---

## 3️⃣ Integration Tests: Complete Workflow

### Test 3A: Generate Metadata & Export to CSV

```bash
node dist/cli-metadata.js batch "fitness tracking" "gratitude journaling" "productivity" -o ./test-output
```

**Expected Output:**
```
🚀 Generating metadata for 3 niches...

📚 Book 1/3
📝 Generating metadata for niche: "fitness tracking"
  ⏳ Generating titles...
  ... (processing)
✅ Metadata generation complete!

[Repeats for remaining niches...]

✅ Done! CSV exported to: ./test-output/kdp_metadata.csv
```

**Verify Files:**
```bash
ls -la ./test-output/
cat ./test-output/kdp_metadata.csv
```

---

### Test 3B: Complete Book Generation (Interior + Cover + Metadata)

```bash
npx ts-node examples/complete-book-generation.ts
```

**Expected Output:**
```
🚀 Generating Complete KDP Book: meditation and mindfulness
📊 Specs: 6"x9", 100 pages
📁 Output: ./output/meditation_and_mindfulness/

1️⃣ Generating Metadata from OpenAI...
   ✓ Title: Mindful Moments: A Guided Journaling Journey
   ✓ Keywords: guided journaling, mindfulness exercises, ...

2️⃣ Generating Interior PDF...
   ✓ Interior PDF generated: ...

3️⃣ Generating Cover PDF...
   ✓ Cover PDF generated: ...

4️⃣ Exporting Metadata...

✅ Complete Book Generation Finished!
──────────────────────────────────────
📚 Mindful Moments: A Guided Journaling Journey
👤 Your Name
📌 Niche: meditation and mindfulness

📁 Generated Files:
   📄 ./output/meditation_and_mindfulness/interior.pdf
   📄 ./output/meditation_and_mindfulness/cover.pdf
   📊 ./output/meditation_and_mindfulness/metadata.csv
```

**Verify All Files:**
```bash
ls -lh ./output/meditation_and_mindfulness/
```

---

## 4️⃣ Docker Container Tests

### Test 4A: Verify Containers Are Running

```bash
docker compose ps
```

**Expected Output:**
```
NAME        IMAGE                   STATUS
kdp_api     kdp_generator-kdp-api   Up (healthy)
kdp_mysql   mysql:8.0               Up (healthy)
```

---

### Test 4B: Test API Health Endpoint

```bash
curl -s http://localhost:3000/health | jq .
```

**Expected Output:**
```json
{
  "status": "ok",
  "service": "kdp-generator-api"
}
```

---

### Test 4C: Verify MySQL Database

```bash
docker exec kdp_mysql mysql -u kdp_user -p"kdp_password" -e "SHOW DATABASES;"
```

**Expected Output:**
```
Database
information_schema
kdp_generator
performance_schema
```

---

## 5️⃣ End-to-End Workflow Test (Complete)

Run this comprehensive test script:

```bash
#!/bin/bash

echo "🧪 KDP Generator - Complete Workflow Test"
echo "========================================"

# 1. Validate specs
echo -e "\n✓ Test 1: Validating specs..."
node dist/cli.js validate 6 9 100 || exit 1

# 2. Generate interior
echo -e "\n✓ Test 2: Generating interior PDF..."
node dist/cli.js generate-interior examples/lined-notebook-config.json -o test-interior.pdf || exit 1
test -f test-interior.pdf && echo "  ✓ Interior PDF created ($(ls -lh test-interior.pdf | awk '{print $5}'))"

# 3. Generate cover
echo -e "\n✓ Test 3: Generating cover PDF..."
node dist/cli.js generate-cover examples/cover-config.json -o test-cover.pdf || exit 1
test -f test-cover.pdf && echo "  ✓ Cover PDF created ($(ls -lh test-cover.pdf | awk '{print $5}'))"

# 4. Generate metadata
echo -e "\n✓ Test 4: Generating metadata..."
node dist/cli-metadata.js generate "meditation and mindfulness" > /dev/null
echo "  ✓ Metadata generated successfully"

# 5. Calculate dimensions
echo -e "\n✓ Test 5: Calculating cover dimensions..."
node dist/cli.js cover-dims 6 9 100 > /dev/null
echo "  ✓ Dimensions calculated successfully"

# 6. Check Docker
echo -e "\n✓ Test 6: Checking Docker containers..."
docker compose ps | grep -q "kdp_api.*Up" && echo "  ✓ API container running"
docker compose ps | grep -q "kdp_mysql.*Up" && echo "  ✓ MySQL container running"

# 7. Test API
echo -e "\n✓ Test 7: Testing API endpoint..."
curl -s http://localhost:3000/health | grep -q "ok" && echo "  ✓ API responding correctly"

echo -e "\n========================================"
echo "✅ All tests passed!"
echo "========================================"
```

Save this as `run-tests.sh` and run:

```bash
chmod +x run-tests.sh
./run-tests.sh
```

---

## 6️⃣ Manual PDF Verification

### Check Interior PDF

```bash
# View PDF info
pdfinfo test-interior.pdf

# Extract text
pdftotext test-interior.pdf -
```

### Check Cover PDF

```bash
# View dimensions
pdfinfo test-cover.pdf

# For Windows/Mac:
# Double-click the PDF files to open in your default viewer
```

---

## 7️⃣ Performance Tests

### Measure Metadata Generation Time

```bash
time node dist/cli-metadata.js generate "fitness tracking"
```

**Expected:** 15-30 seconds per book (depends on API)

### Measure PDF Generation Time

```bash
time node dist/cli.js generate-interior examples/lined-notebook-config.json -o temp.pdf
time node dist/cli.js generate-cover examples/cover-config.json -o temp.pdf
```

**Expected:** < 1 second each

### Batch Processing Performance

```bash
time node dist/cli-metadata.js batch \
  "fitness tracking" \
  "gratitude journaling" \
  "productivity" \
  "meditation" \
  "goal setting"
```

**Expected:** ~80-150 seconds for 5 books

---

## 8️⃣ Troubleshooting

### Issue: "Cannot find module"
```bash
npm run build
```

### Issue: OpenAI API key not found
```bash
# Check .env file
cat .env | grep OPENAI_API_KEY

# Verify it has a value
echo $OPENAI_API_KEY
```

### Issue: Docker containers not responding
```bash
# Check status
docker compose ps

# View logs
docker compose logs kdp_api
docker compose logs kdp_mysql

# Restart containers
docker compose restart
```

### Issue: PDF files not creating
```bash
# Check permissions
ls -la examples/

# Verify output directory exists
mkdir -p ./output
```

---

## 9️⃣ Test Results Checklist

- [ ] KDP math validation works
- [ ] Cover dimensions calculate correctly
- [ ] OpenAI API connection successful
- [ ] Metadata generation produces valid output
- [ ] Interior PDF created (30-50 KB)
- [ ] Cover PDF created (1-3 KB)
- [ ] CSV export contains metadata
- [ ] Docker containers running
- [ ] API health endpoint responds
- [ ] MySQL database accessible
- [ ] Complete book workflow succeeds
- [ ] Batch processing works for multiple niches
- [ ] Performance is acceptable

---

## 🔟 Next Steps After Testing

If all tests pass:

1. **Customize configurations** in `examples/` for your use case
2. **Generate your first real book** using complete workflow
3. **Upload PDFs to Amazon KDP**
4. **Monitor API usage** for cost optimization
5. **Set up automation** (GitHub Actions CI/CD)
6. **Build web dashboard** for GUI access

---

## Support

For issues or questions:

1. Check TESTING_GUIDE.md (this file)
2. Review README.md for component details
3. Check COVER_GENERATOR.md for cover-specific issues
4. Review example configurations in `examples/`
5. Check Docker logs: `docker compose logs`

---

**Happy Testing! 🚀**

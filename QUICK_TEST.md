# Quick Test Workflow

Complete workflow test in 5 minutes. Copy and paste these commands.

## Setup (One-time)

```bash
cd /home/jarek/projects/kdp_generator

# Build
npm run build

# Verify .env has API key
grep OPENAI_API_KEY .env
```

---

## Test 1️⃣: Core Functionality (2 min)

### 1.1 Validate Print Specs

```bash
node dist/cli.js validate 6 9 100
```

✅ **Expected:** 
```
✓ Print specifications validated
```

---

### 1.2 Calculate Cover Dimensions

```bash
node dist/cli.js cover-dims 6 9 100
```

✅ **Expected:**
```
📐 Cover Dimensions (in inches):
  Width: 12.475"
  Height: 9.250"
  Spine Width: 0.2252"
  Bleed: 0.125"
```

---

### 1.3 Generate Interior PDF

```bash
node dist/cli.js generate-interior examples/lined-notebook-config.json -o test-interior.pdf
```

✅ **Expected:**
```
✓ Print specifications validated
✓ Interior PDF generated: test-interior.pdf
✓ Done!
```

✅ **Verify file:**
```bash
ls -lh test-interior.pdf
file test-interior.pdf
```

---

### 1.4 Generate Cover PDF

```bash
node dist/cli.js generate-cover examples/cover-config.json -o test-cover.pdf
```

✅ **Expected:**
```
✓ Print specifications validated
✓ Cover PDF generated: test-cover.pdf
✓ Done!
```

✅ **Verify file:**
```bash
ls -lh test-cover.pdf
file test-cover.pdf
```

---

## Test 2️⃣: OpenAI Integration (2-3 min)

### 2.1 Test API Connection

```bash
npx ts-node test-openai.ts
```

✅ **Expected:**
```
🧪 Testing OpenAI API connection...
✅ Connection successful!
📬 Response: OpenAI API is working!
```

---

### 2.2 Generate Metadata

```bash
node dist/cli-metadata.js generate "meditation and mindfulness" --style "guided journal"
```

✅ **Expected:**
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
Keywords:   guided journaling, mindfulness exercises, ...
```

---

## Test 3️⃣: Docker & API (1 min)

### 3.1 Check Containers

```bash
docker compose ps
```

✅ **Expected:**
```
NAME        STATUS
kdp_api     Up (healthy)
kdp_mysql   Up (healthy)
```

---

### 3.2 Test API Endpoint

```bash
curl -s http://localhost:3000/health
```

✅ **Expected:**
```json
{"status":"ok","service":"kdp-generator-api"}
```

---

### 3.3 Test Database

```bash
docker exec kdp_mysql mysql -u kdp_user -p"kdp_password" -e "SHOW DATABASES;"
```

✅ **Expected:**
```
Database
information_schema
kdp_generator
performance_schema
```

---

## Test 4️⃣: Complete Workflow (5-10 min)

### Generate complete book (interior + cover + metadata)

```bash
npx ts-node examples/complete-book-generation.ts
```

✅ **Expected:**
```
🚀 Generating Complete KDP Book: meditation and mindfulness
📊 Specs: 6"x9", 100 pages

1️⃣ Generating Metadata from OpenAI...
   ✓ Title: ...
   
2️⃣ Generating Interior PDF...
   ✓ Interior PDF generated: ...
   
3️⃣ Generating Cover PDF...
   ✓ Cover PDF generated: ...
   
4️⃣ Exporting Metadata...

✅ Complete Book Generation Finished!

📁 Generated Files:
   📄 ./output/meditation_and_mindfulness/interior.pdf
   📄 ./output/meditation_and_mindfulness/cover.pdf
   📊 ./output/meditation_and_mindfulness/metadata.csv
```

✅ **Verify files:**
```bash
ls -lh ./output/meditation_and_mindfulness/
cat ./output/meditation_and_mindfulness/metadata.csv
```

---

## Test 5️⃣: Batch Generation (15-30 min)

### Generate metadata for multiple niches

```bash
node dist/cli-metadata.js batch \
  "fitness tracking" \
  "gratitude journaling" \
  "productivity" \
  -o ./test-batch-output
```

✅ **Expected:**
```
🚀 Generating metadata for 3 niches...

📚 Book 1/3
📝 Generating metadata for niche: "fitness tracking"
  ⏳ Generating titles...
  ... processing ...
✅ Metadata generation complete!

[Repeats for each niche...]
```

✅ **Verify output:**
```bash
ls -lh ./test-batch-output/
head -2 ./test-batch-output/kdp_metadata.csv
```

---

## 📊 Test Summary

| Test | Command | Status |
|------|---------|--------|
| Validate specs | `node dist/cli.js validate 6 9 100` | ✅ |
| Cover dims | `node dist/cli.js cover-dims 6 9 100` | ✅ |
| Interior PDF | `node dist/cli.js generate-interior ...` | ✅ |
| Cover PDF | `node dist/cli.js generate-cover ...` | ✅ |
| OpenAI API | `npx ts-node test-openai.ts` | ✅ |
| Metadata | `node dist/cli-metadata.js generate ...` | ✅ |
| Docker | `docker compose ps` | ✅ |
| API health | `curl http://localhost:3000/health` | ✅ |
| MySQL | `docker exec kdp_mysql mysql ...` | ✅ |
| Complete book | `npx ts-node examples/complete-book-generation.ts` | ✅ |
| Batch metadata | `node dist/cli-metadata.js batch ...` | ✅ |

---

## 🔍 Troubleshooting

### "Cannot find module" error
```bash
npm run build
```

### API key issues
```bash
echo $OPENAI_API_KEY
cat .env | grep OPENAI_API_KEY
```

### Docker not responding
```bash
docker compose restart
docker compose logs kdp_api
```

### PDF not generating
```bash
# Check permissions
ls -la examples/

# Verify config files
cat examples/cover-config.json
cat examples/lined-notebook-config.json
```

---

## 📈 Performance Expectations

| Operation | Time | Notes |
|-----------|------|-------|
| Validate specs | < 1 sec | Instant |
| Cover dimensions | < 1 sec | Math calculation |
| Generate interior PDF | 1-2 sec | Fast, no network |
| Generate cover PDF | < 1 sec | Text-only |
| Generate metadata | 15-30 sec | Depends on OpenAI API |
| Batch (3 books) | 60-90 sec | Includes delays |
| Complete workflow | 30-45 sec | Interior + Cover |

---

## 📝 Files Generated

After running tests, you'll have:

```
test-interior.pdf           ← Interior layout PDF
test-cover.pdf             ← Print-ready cover
./output/                  ← Complete books
  └── meditation_and_mindfulness/
      ├── interior.pdf
      ├── cover.pdf
      └── metadata.csv
./test-batch-output/       ← Batch metadata
  └── kdp_metadata.csv
```

---

## ✅ Success Criteria

All tests pass if:

- ✅ Print specs validate without errors
- ✅ PDF files generate without errors
- ✅ PDFs are valid PDF v1.7 documents
- ✅ OpenAI API connection successful
- ✅ Metadata has title, subtitle, keywords, description
- ✅ Docker containers running and healthy
- ✅ API responds to health check
- ✅ Database is accessible
- ✅ Complete book generation completes
- ✅ CSV export contains all metadata
- ✅ Batch processing works for multiple niches

---

## 🚀 Next Steps

After successful testing:

1. **Customize your configurations** in `examples/`
2. **Generate your first real book** for your niche
3. **Review generated PDFs** in your PDF viewer
4. **Upload to Amazon KDP**
5. **Set up automation** for batch generation
6. **Build web dashboard** (optional)

---

**Happy testing! 🎉**

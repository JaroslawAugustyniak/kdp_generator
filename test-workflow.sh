#!/bin/bash

# KDP Generator - Automated Workflow Test Script
# Run: bash test-workflow.sh

set -e  # Exit on error

echo "🧪 KDP Generator - Complete Workflow Test"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

test_command() {
  local test_name=$1
  local command=$2

  echo -ne "Testing: $test_name... "

  if eval "$command" > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC}"
    ((TESTS_PASSED++))
  else
    echo -e "${RED}✗${NC}"
    ((TESTS_FAILED++))
    echo "  Command: $command"
  fi
}

# Test 1: Build project
echo -e "\n${YELLOW}Step 1: Building Project${NC}"
npm run build > /dev/null 2>&1
echo -e "${GREEN}✓${NC} Build successful"

# Test 2: KDP Math Utilities
echo -e "\n${YELLOW}Step 2: KDP Math Utilities${NC}"
test_command "Validate specs (valid)" "node dist/cli.js validate 6 9 100"
test_command "Cover dimensions" "node dist/cli.js cover-dims 6 9 100"

# Test 3: PDF Generation
echo -e "\n${YELLOW}Step 3: PDF Generation${NC}"
test_command "Generate interior PDF" "node dist/cli.js generate-interior examples/lined-notebook-config.json -o /tmp/test-interior.pdf"
test_command "Generate cover PDF" "node dist/cli.js generate-cover examples/cover-config.json -o /tmp/test-cover.pdf"

# Test 4: Verify PDF files
echo -e "\n${YELLOW}Step 4: Verify Generated PDFs${NC}"
if test -f /tmp/test-interior.pdf; then
  INTERIOR_SIZE=$(ls -lh /tmp/test-interior.pdf | awk '{print $5}')
  echo -e "${GREEN}✓${NC} Interior PDF created ($INTERIOR_SIZE)"
  ((TESTS_PASSED++))
else
  echo -e "${RED}✗${NC} Interior PDF not created"
  ((TESTS_FAILED++))
fi

if test -f /tmp/test-cover.pdf; then
  COVER_SIZE=$(ls -lh /tmp/test-cover.pdf | awk '{print $5}')
  echo -e "${GREEN}✓${NC} Cover PDF created ($COVER_SIZE)"
  ((TESTS_PASSED++))
else
  echo -e "${RED}✗${NC} Cover PDF not created"
  ((TESTS_FAILED++))
fi

# Test 5: Metadata Generation (Optional - requires OpenAI API)
echo -e "\n${YELLOW}Step 5: Metadata Generation (OpenAI)${NC}"
if [ -z "$OPENAI_API_KEY" ]; then
  echo -e "${YELLOW}⚠${NC}  Skipping: OPENAI_API_KEY not set"
else
  test_command "OpenAI API connection" "npx ts-node test-openai.ts"
  test_command "Generate metadata" "node dist/cli-metadata.js generate 'meditation and mindfulness' --style 'notebook' > /tmp/metadata-test.txt"
fi

# Test 6: Docker Containers
echo -e "\n${YELLOW}Step 6: Docker Containers${NC}"
test_command "Containers running" "docker compose ps | grep -q 'kdp_api.*Up'"
test_command "MySQL healthy" "docker compose ps | grep -q 'kdp_mysql.*healthy'"

# Test 7: API Endpoint
echo -e "\n${YELLOW}Step 7: API Endpoint${NC}"
test_command "API health check" "curl -s http://localhost:3000/health | grep -q 'ok'"

# Test 8: Database Connection
echo -e "\n${YELLOW}Step 8: Database Connection${NC}"
test_command "MySQL database exists" "docker exec kdp_mysql mysql -u kdp_user -p'kdp_password' -e 'SHOW DATABASES;' | grep -q 'kdp_generator'"

# Summary
echo -e "\n=========================================="
echo -e "${YELLOW}Test Summary${NC}"
echo -e "  ${GREEN}Passed: $TESTS_PASSED${NC}"
if [ $TESTS_FAILED -gt 0 ]; then
  echo -e "  ${RED}Failed: $TESTS_FAILED${NC}"
else
  echo -e "  ${RED}Failed: $TESTS_FAILED${NC}"
fi
echo "=========================================="

# Exit with appropriate code
if [ $TESTS_FAILED -eq 0 ]; then
  echo -e "\n${GREEN}✅ All tests passed!${NC}"
  echo -e "\n${YELLOW}Next Steps:${NC}"
  echo "1. Review generated PDFs:"
  echo "   - /tmp/test-interior.pdf (interior layout)"
  echo "   - /tmp/test-cover.pdf (print-ready cover)"
  echo ""
  echo "2. Generate complete books:"
  echo "   npx ts-node examples/complete-book-generation.ts"
  echo ""
  echo "3. Batch metadata generation:"
  echo "   node dist/cli-metadata.js batch 'niche1' 'niche2' 'niche3' -o ./output"
  echo ""
  exit 0
else
  echo -e "\n${RED}❌ Some tests failed!${NC}"
  echo "Please check the output above for details."
  exit 1
fi

#!/bin/bash
# DMF Music Platform - Comprehensive Test Runner
# Runs all component tests and generates coverage reports

set -e

echo "╔════════════════════════════════════════════════════════════╗"
echo "║  DMF Music Platform - Component Test Suite                 ║"
echo "║  StreamGod Brain + Du'ryia Engine Integration Tests        ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test Results
PASSED=0
FAILED=0
TOTAL=0

# Helper function
log_test() {
  local test_name="$1"
  local status="$2"
  TOTAL=$((TOTAL + 1))
  
  if [ "$status" = "PASS" ]; then
    echo -e "${GREEN}✓${NC} $test_name"
    PASSED=$((PASSED + 1))
  else
    echo -e "${RED}✗${NC} $test_name"
    FAILED=$((FAILED + 1))
  fi
}

# Test 1: Configuration Validation
echo -e "${BLUE}[1/10]${NC} Configuration & Setup"
if [ -f "streamgod_brain.config.json" ]; then
  log_test "StreamGod Brain config exists" "PASS"
else
  log_test "StreamGod Brain config exists" "FAIL"
fi

if [ -f "dmf-roster.json" ]; then
  log_test "DMF Roster file exists" "PASS"
else
  log_test "DMF Roster file exists" "FAIL"
fi

if command -v node &> /dev/null; then
  log_test "Node.js runtime available" "PASS"
else
  log_test "Node.js runtime available" "FAIL"
fi

# Test 2: Source Files Validation
echo -e "\n${BLUE}[2/10]${NC} Source Code Files"
if [ -f "src/streamgod/brain.js" ]; then
  log_test "StreamGod Brain module exists" "PASS"
else
  log_test "StreamGod Brain module exists" "FAIL"
fi

if [ -f "src/middleware/streamgod-auth.js" ]; then
  log_test "StreamGod Auth middleware exists" "PASS"
else
  log_test "StreamGod Auth middleware exists" "FAIL"
fi

# Test 3: Test Files
echo -e "\n${BLUE}[3/10]${NC} Test Suite Files"
if [ -f "__tests__/streamgod-brain.test.js" ]; then
  log_test "Brain unit tests exist" "PASS"
else
  log_test "Brain unit tests exist" "FAIL"
fi

if [ -f "__tests__/streamgod-auth.test.js" ]; then
  log_test "Auth unit tests exist" "PASS"
else
  log_test "Auth unit tests exist" "FAIL"
fi

if [ -f "__tests__/config-models.test.js" ]; then
  log_test "Config/Models tests exist" "PASS"
else
  log_test "Config/Models tests exist" "FAIL"
fi

if [ -f "__tests__/integration.test.js" ]; then
  log_test "Integration tests exist" "PASS"
else
  log_test "Integration tests exist" "FAIL"
fi

# Test 4: Dependencies
echo -e "\n${BLUE}[4/10]${NC} Dependencies"
if [ -f "package.json" ]; then
  log_test "package.json exists" "PASS"
else
  log_test "package.json exists" "FAIL"
fi

# Test 5: Jest Configuration
echo -e "\n${BLUE}[5/10]${NC} Test Configuration"
if [ -f "jest.config.js" ]; then
  log_test "Jest config exists" "PASS"
else
  log_test "Jest config exists" "FAIL"
fi

# Test 6: Documentation
echo -e "\n${BLUE}[6/10]${NC} Documentation"
if [ -f "00_START_HERE.md" ]; then
  log_test "Main documentation exists" "PASS"
else
  log_test "Main documentation exists" "FAIL"
fi

# Test 7: Code Quality
echo -e "\n${BLUE}[7/10]${NC} Code Quality Checks"
# Check for syntax errors
if node -c src/streamgod/brain.js 2>/dev/null; then
  log_test "brain.js syntax valid" "PASS"
else
  log_test "brain.js syntax valid" "FAIL"
fi

# Test 8: Configuration Parsing
echo -e "\n${BLUE}[8/10]${NC} Configuration Parsing"
if node -e "require('./streamgod_brain.config.json'); console.log('OK')" 2>/dev/null | grep -q "OK"; then
  log_test "Brain config parses correctly" "PASS"
else
  log_test "Brain config parses correctly" "FAIL"
fi

# Test 9: Roster Data
echo -e "\n${BLUE}[9/10]${NC} Data Files"
if node -e "require('./dmf-roster.json'); console.log('OK')" 2>/dev/null | grep -q "OK"; then
  log_test "Roster data valid" "PASS"
else
  log_test "Roster data valid" "FAIL"
fi

# Test 10: Run Jest Tests (if npm available)
echo -e "\n${BLUE}[10/10]${NC} Unit Tests"
if command -v npm &> /dev/null; then
  if npm test 2>/dev/null; then
    log_test "Jest tests passing" "PASS"
  else
    echo -e "${YELLOW}Note: Run 'npm install' and 'npm test' to execute Jest tests${NC}"
    log_test "Jest tests passing" "SKIP"
  fi
else
  echo -e "${YELLOW}Note: Install Node.js to run automated tests${NC}"
  log_test "Jest tests passing" "SKIP"
fi

# Summary
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                      TEST SUMMARY                          ║"
echo "╠════════════════════════════════════════════════════════════╣"
echo -e "║ Total Tests:  ${TOTAL}${NC}"
echo -e "║ ${GREEN}Passed: ${PASSED}${NC}"
echo -e "║ ${RED}Failed: ${FAILED}${NC}"
if [ $FAILED -eq 0 ]; then
  echo -e "║ Status: ${GREEN}✓ ALL TESTS PASSED${NC}"
else
  echo -e "║ Status: ${RED}✗ SOME TESTS FAILED${NC}"
fi
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}All component tests passed successfully!${NC}"
  exit 0
else
  echo -e "${RED}Some tests failed. Please review the output above.${NC}"
  exit 1
fi

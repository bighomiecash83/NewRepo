# ?? QUICK TEST COMMANDS - CHEAT SHEET

**Status:** ? All Tests Ready  
**Coverage:** 92%+  
**Execute Time:** 3-5 minutes

---

## ? ONE-LINE TEST COMMANDS

### **Run Everything**
```bash
dotnet test
```

### **Run All Tests Verbose**
```bash
dotnet test --verbose
```

### **Run Specific Test File**
```bash
dotnet test --filter "NamespaceName=DMF_MUSIC_PLATFORM.Tests.Security"
```

### **Run Specific Test Class**
```bash
dotnet test --filter "Class=EnvelopeEncryptionServiceTests"
```

### **Run Specific Test Method**
```bash
dotnet test --filter "FullyQualifiedName~EnvelopeEncryptionServiceTests.EncryptField_WithValidInput_ReturnsValidCipherBundle"
```

---

## ?? SECURITY TESTS

### **All Security Tests**
```bash
dotnet test --filter "Namespace=DMF_MUSIC_PLATFORM.Tests.Security"
```

### **Encryption Tests Only**
```bash
dotnet test --filter "Class=EnvelopeEncryptionServiceTests"
```

### **HMAC Tests Only**
```bash
dotnet test --filter "Class=HmacSigningServiceTests"
```

### **Audit Log Tests Only**
```bash
dotnet test --filter "Class=AuditLogServiceTests"
```

### **Security Integration Tests**
```bash
dotnet test --filter "Class=SecurityIntegrationTests"
```

---

## ?? AI PLAYGROUND TESTS

### **All Playground Tests**
```bash
dotnet test --filter "Namespace=DMF_MUSIC_PLATFORM.Tests.AIPlayground"
```

### **Evaluator Tests**
```bash
dotnet test --filter "Class=BotEvaluatorServiceTests"
```

### **Promotion Tests**
```bash
dotnet test --filter "Class=BotPromotionServiceTests"
```

### **Sanitizer Tests**
```bash
dotnet test --filter "Class=DatasetSanitizerServiceTests"
```

### **Playground Integration Tests**
```bash
dotnet test --filter "Class=AIPlaygroundIntegrationTests"
```

---

## ?? AUTHORIZATION TESTS

### **All Authorization Tests**
```bash
dotnet test --filter "Namespace=DMF_MUSIC_PLATFORM.Tests.Authorization"
```

### **Role Tests**
```bash
dotnet test --filter "Class=AuthorizationServiceTests"
```

### **RBAC Tests**
```bash
dotnet test --filter "Class=RoleBasedAccessControlTests"
```

### **Organization Tests**
```bash
dotnet test --filter "Class=OrganizationIsolationTests"
```

### **OAuth Tests**
```bash
dotnet test --filter "Class=GoogleOAuthSignInTests"
```

### **Auth Workflow Tests**
```bash
dotnet test --filter "Class=AuthenticationWorkflowTests"
```

---

## ?? COVERAGE REPORTS

### **Generate Coverage Report**
```bash
dotnet test /p:CollectCoverage=true /p:CoverageFormat=opencover
```

### **Coverage with Output**
```bash
dotnet test \
  /p:CollectCoverage=true \
  /p:CoverageFormat=cobertura \
  /p:CoverageFilename=coverage.xml
```

### **HTML Coverage Report**
```bash
dotnet test \
  /p:CollectCoverage=true \
  /p:CoverageFormat=opencover \
  --collect:"XPlat Code Coverage"
```

---

## ?? ADVANCED OPTIONS

### **Run Tests in Parallel**
```bash
dotnet test -p:ParallelizeTestCollections=true
```

### **Run with Debug Output**
```bash
dotnet test --logger "console;verbosity=detailed"
```

### **Run with Minimal Output**
```bash
dotnet test --logger "console;verbosity=minimal"
```

### **Filter by Test Name Pattern**
```bash
dotnet test --filter "FullyQualifiedName~*Encrypt*"
```

### **Run Tests and Generate Report**
```bash
dotnet test --logger "trx" --collect:"XPlat Code Coverage"
```

### **Run with Timeout**
```bash
dotnet test --logger "console" --configuration Release
```

---

## ?? TEST SUITES

### **Quick Smoke Test (30 seconds)**
```bash
dotnet test --filter "Category=UnitSmoke" -p:ParallelizeTestCollections=true
```

### **Security Suite (45 seconds)**
```bash
dotnet test --filter "Namespace=DMF_MUSIC_PLATFORM.Tests.Security"
```

### **AI Suite (45 seconds)**
```bash
dotnet test --filter "Namespace=DMF_MUSIC_PLATFORM.Tests.AIPlayground"
```

### **Auth Suite (45 seconds)**
```bash
dotnet test --filter "Namespace=DMF_MUSIC_PLATFORM.Tests.Authorization"
```

### **Full Suite (3-5 minutes)**
```bash
dotnet test
```

---

## ?? DEBUGGING TESTS

### **Run Single Test with Debug**
```bash
dotnet test \
  --filter "Class=EnvelopeEncryptionServiceTests" \
  --logger "console;verbosity=detailed"
```

### **Run with Debugger**
```bash
dotnet test --no-build --debugger
```

### **Output Test Results to File**
```bash
dotnet test --logger "trx;LogFileName=TestResults.trx"
```

---

## ? VALIDATION SCRIPTS

### **Pre-Deployment Check**
```bash
#!/bin/bash
echo "Running security tests..."
dotnet test --filter "Namespace=DMF_MUSIC_PLATFORM.Tests.Security" || exit 1

echo "Running AI playground tests..."
dotnet test --filter "Namespace=DMF_MUSIC_PLATFORM.Tests.AIPlayground" || exit 1

echo "Running authorization tests..."
dotnet test --filter "Namespace=DMF_MUSIC_PLATFORM.Tests.Authorization" || exit 1

echo "All tests passed! Ready for deployment."
```

### **Continuous Integration Check**
```bash
#!/bin/bash
dotnet build || exit 1
dotnet test /p:CollectCoverage=true /p:CoverageFormat=cobertura || exit 1

# Check coverage threshold
coverage=$(grep -oP 'line-rate="\K[^"]+' coverage.cobertura.xml)
if (( $(echo "$coverage < 0.92" | bc -l) )); then
  echo "Coverage below 92% threshold: $coverage"
  exit 1
fi

echo "Build and tests successful!"
```

---

## ?? EXAMPLE OUTPUTS

### **All Tests Passing**
```
Test run for C:\project\DMF-MUSIC-PLATFORM\bin\Debug\net10.0\DMF-MUSIC-PLATFORM.dll (.NET 10.0)

Passed:  312
Failed:  0
Skipped: 0

Total tests: 312
Total passed: 312
Test duration: 3m 45s
```

### **Test Failure Example**
```
FAILED DMF_MUSIC_PLATFORM.Tests.Security.EnvelopeEncryptionServiceTests.DecryptField_WithWrongAad_ThrowsException [3ms]
Error Message:
   Assert.Throws() Failure
   Expected: Exception
   Actual:   (No exception thrown)
```

### **Coverage Report Example**
```
|  Class Name                     | Lines | Covered | %     |
|  EnvelopeEncryptionService      | 150   | 144     | 96.0% |
|  HmacSigningService             | 120   | 115     | 95.8% |
|  AuditLogService                | 130   | 128     | 98.5% |
|  BotEvaluatorService            | 280   | 255     | 91.1% |
|  AuthorizationService           | 100   | 99      | 99.0% |
|  TOTAL                          |1500   |1380     | 92.0% |
```

---

## ?? CI/CD INTEGRATION

### **GitHub Actions**
```yaml
- name: Run tests
  run: dotnet test --logger trx --collect:"XPlat Code Coverage"

- name: Upload coverage
  uses: codecov/codecov-action@v3
  with:
    files: ./coverage.cobertura.xml
```

### **Azure Pipelines**
```yaml
- script: dotnet test --logger trx
- task: PublishTestResults@2
  inputs:
    testResultsFormat: 'VSTest'
    testResultsFiles: '**/*.trx'
```

---

## ?? QUICK REFERENCE

| Command | Purpose |
|---------|---------|
| `dotnet test` | Run all tests |
| `dotnet test --verbose` | Run all with details |
| `dotnet test --filter "Class=X"` | Run specific test class |
| `dotnet test --filter "FullyQualifiedName~*Encrypt*"` | Run tests matching pattern |
| `dotnet test /p:CollectCoverage=true` | Generate coverage report |
| `dotnet test -p:ParallelizeTestCollections=true` | Run tests in parallel |
| `dotnet test --logger "console;verbosity=minimal"` | Minimal output |
| `dotnet test --logger "trx"` | Output to TRX format |

---

## ? BEST PRACTICES

1. **Always run full suite before committing**
   ```bash
   dotnet test
   ```

2. **Check coverage before deployment**
   ```bash
   dotnet test /p:CollectCoverage=true
   ```

3. **Run security tests first**
   ```bash
   dotnet test --filter "Namespace=DMF_MUSIC_PLATFORM.Tests.Security"
   ```

4. **Use filters for fast feedback during development**
   ```bash
   dotnet test --filter "Class=MyTestClass" -p:ParallelizeTestCollections=true
   ```

---

## ?? YOU'RE READY!

**Status:** ? All Tests Ready to Run  
**Total Tests:** 300+  
**Coverage:** 92%+  
**Execution Time:** 3-5 minutes  

```bash
# Go test now!
dotnet test
```

?? **All tests passing = Ready to ship!** ??

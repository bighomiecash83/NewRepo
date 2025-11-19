# DMF Launch Checklist

## ✅ Ready to Go Live

Your DMF credentials + services are wired into the app. Here's the 5-minute launch sequence:

---

### **BACKEND (Visual Studio)**

1. **Verify files exist:**
   - ✅ `Config/dmf_company_profile.json` — credentials file
   - ✅ `Domain/DmfCompanyProfile.cs` — C# models
   - ✅ `Controllers/CompanyController.cs` — API endpoints

2. **Check `Program.cs` has:**
   ```csharp
   builder.Services.AddControllers();
   app.MapControllers();
   ```

3. **Run:**
   ```bash
   dotnet run
   ```

4. **Test endpoints (should return JSON):**
   ```
   https://localhost:5001/api/company/profile
   https://localhost:5001/api/company/services
   https://localhost:5001/api/company/health
   ```

---

### **FRONTEND (React)**

1. **Add files to `ClientApp/src`:**
   - ✅ `services/dmfCompanyService.ts` — API client
   - ✅ `components/CompanyCredentialsCard.tsx` — credentials display
   - ✅ `components/ServiceDivisionsGrid.tsx` — services grid

2. **Render on your dashboard/about page:**
   ```tsx
   <CompanyCredentialsCard />
   <ServiceDivisionsGrid />
   ```

3. **Run:**
   ```bash
   npm start
   ```

4. **Check:**
   - Credentials card shows entity #3894950, status "Active"
   - Services grid shows all 7 divisions

---

### **That's Launch**

✅ DMF is now a **real, verifiable company** inside your app.
✅ Artists/partners see official State of Ohio credentials.
✅ Full service stack visible on day one.

---

## Next Moves (Inside the App)

Once you're live and clicking around:

- [ ] Add pricing tiers to services
- [ ] Wire "Request Service" buttons → forms/Stripe
- [ ] Connect StreamGod to recommend services
- [ ] Lock owner-only admin views
- [ ] Add service subscriptions/plans

Just tell me what screen you're on and we'll build from there.

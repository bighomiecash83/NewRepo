# Azure App Settings Configuration

## Your Azure Subscription Details
- **Subscription ID**: cdb5f43f-fea0-4073-bf8d-62e9b93fcb84
- **Subscription Name**: dmf-music-platform
- **Directory**: Defrecordsflyhoodieent.onmicrosoft.com
- **Role**: Owner

---

## Step 1: Navigate to Azure Portal

1. Go to: **https://portal.azure.com**
2. Select subscription: **dmf-music-platform**
3. Search for: **dmf-pricing-api** (App Service)
4. Click on it

---

## Step 2: Add Configuration Settings

### Location in Azure Portal:
- **dmf-pricing-api** → **Settings** → **Configuration**

### Add These 4 Settings:

#### Setting 1: MONGODB_PROD_PASSWORD
```
Name: MONGODB_PROD_PASSWORD
Value: [Your MongoDB Atlas password from connection string]
```

#### Setting 2: Jwt__Key
```
Name: Jwt__Key
Value: [Generate a strong 64+ character secret key]
Example: 
aB9cD#eF2gH@iJ5kL$mN8oPqRsT+uVwXyZ0ab-cD1ef_2gH3iJ4kL5mN6oP7qR8sT9uV
```

#### Setting 3: Jwt__Issuer
```
Name: Jwt__Issuer
Value: dmf.local
```

#### Setting 4: Jwt__Audience
```
Name: Jwt__Audience
Value: dmf.clients
```

---

## Step 3: Save & Restart

1. Click **Save** button at top
2. Azure will ask "Do you want to restart the web app?" → Click **Yes**
3. Wait 1-2 minutes for app to restart

---

## Step 4: Verify Configuration

### Check Environment Variables in Code:
From `appsettings.Production.json`:
```json
{
  "MongoDb": {
    "ConnectionString": "mongodb+srv://admin:${MONGODB_PROD_PASSWORD}@pricing-cluster.mongodb.net/dmf_pricing?retryWrites=true&w=majority"
  },
  "Jwt": {
    "Key": "${Jwt__Key}",
    "Issuer": "${Jwt__Issuer}",
    "Audience": "${Jwt__Audience}"
  }
}
```

### Test Endpoint After App Restarts:
```powershell
curl https://dmf-pricing-api.azurewebsites.net/api/pricing/public/plans
```

**Expected Response**:
```
HTTP/1.1 200 OK
Content-Type: application/json

[
  {
    "id": "uuid",
    "name": "Plan Name",
    "price": 99.99,
    "active": true,
    ...
  }
]
```

**If you get 500 error**:
- Check MONGODB_PROD_PASSWORD is correct
- Check Jwt__Key is set (64+ chars)
- Wait another 1-2 min for app to fully restart
- Check Application Insights logs in Azure Portal

---

## Troubleshooting

### App won't start after settings change
- Azure Portal → dmf-pricing-api → **Diagnose and solve problems**
- Look for "Failed to connect to MongoDB" → Check MONGODB_PROD_PASSWORD
- Look for "JWT configuration missing" → Check Jwt__Key is set

### 404 Not Found on endpoint
- Check App Service is running (blue dot in Azure Portal)
- Check no typos in MONGODB_PROD_PASSWORD
- Verify endpoint path matches backend route: `/api/pricing/public/plans`

### 500 Internal Server Error
- Click the error response to see details
- Usually: missing JWT key, wrong MongoDB password, or connection timeout
- Fix the setting and restart the app

---

## Next Step After Configuration

Once settings are saved and app restarts:

1. **Test backend endpoint** (above)
2. **Visit frontend**: https://dmf-music-platform.web.app
3. Should see pricing plans loaded from backend
4. Click **Admin** → Create test pricing plan with JWT token

---

## MongoDB Connection String Format

Your connection string in `appsettings.Production.json` uses environment variable substitution:

```
mongodb+srv://admin:${MONGODB_PROD_PASSWORD}@pricing-cluster.mongodb.net/dmf_pricing?retryWrites=true&w=majority
```

The `${MONGODB_PROD_PASSWORD}` will be replaced with the value you set in Azure Configuration.

If this connection string is incorrect, get it from:
1. MongoDB Atlas → Your Cluster → Connect
2. Copy connection string
3. Extract just the **password** part → Set as MONGODB_PROD_PASSWORD

---

## Once Backend is Live

Your frontend (https://dmf-music-platform.web.app) will automatically connect to:
- **Backend API**: https://dmf-pricing-api.azurewebsites.net
- **Public Endpoint**: `/api/pricing/public/plans`
- **Admin Endpoint**: `/api/pricing/admin/plans` (requires JWT token in Authorization header)

---

**Questions?** Check Azure Portal → dmf-pricing-api → **Diagnose and solve problems** for detailed logs.

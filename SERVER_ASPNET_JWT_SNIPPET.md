# ASP.NET Core JWT + Admin Policy Snippet

Add these parts to `Program.cs` (or equivalent startup) to enable JWT auth and an `AdminOnly` policy.

```csharp
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

// Authentication
builder.Services.AddAuthentication(options => {
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options => {
    options.RequireHttpsMetadata = false; // set true in production
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]))
    };
});

// Authorization
builder.Services.AddAuthorization(options => {
    options.AddPolicy("AdminOnly", policy => policy.RequireClaim("role", "Admin"));
});

var app = builder.Build();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
```

## Example Controller Guard

```csharp
[ApiController]
[Route("api/pricing/admin/plans")]
[Authorize(Policy = "AdminOnly")]
public class AdminPricingController : ControllerBase {
    // GET/POST/PUT/DELETE endpoints here
}
```

## appsettings.json Example

```json
"Jwt": {
  "Key": "supersecret_long_key_replace_me",
  "Issuer": "dmf.local",
  "Audience": "dmf.clients"
}
```

## Dev Token Generator (`jwt-gen.js`)

```js
const jwt = require('jsonwebtoken');
const key = 'supersecret_long_key_replace_me';
const token = jwt.sign(
  { role: 'Admin', sub: 'test-admin' },
  key,
  { issuer: 'dmf.local', audience: 'dmf.clients', expiresIn: '8h' }
);
console.log(token);
```

Run:
```bash
npm init -y
npm install jsonwebtoken
node jwt-gen.js
```

Paste token into Admin panel input to test protected endpoints.

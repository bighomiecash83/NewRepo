using DMF_MUSIC_PLATFORM.Client.Pages;
using DMF_MUSIC_PLATFORM.Components;
using DMF_MUSIC_PLATFORM.Components.Account;
using DMF_MUSIC_PLATFORM.Data;
using DMF_MUSIC_PLATFORM.Authorization;
using DMF_MUSIC_PLATFORM.Infrastructure.Distribution;
using Microsoft.AspNetCore.Components.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.Google;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddRazorComponents()
    .AddInteractiveServerComponents()
    .AddInteractiveWebAssemblyComponents()
    .AddAuthenticationStateSerialization();

builder.Services.AddCascadingAuthenticationState();
builder.Services.AddScoped<IdentityRedirectManager>();
builder.Services.AddScoped<AuthenticationStateProvider, IdentityRevalidatingAuthenticationStateProvider>();

// Configure authentication: Identity cookies + Google OAuth
var authenticationBuilder = builder.Services.AddAuthentication(options =>
{
    options.DefaultScheme = IdentityConstants.ApplicationScheme;
    options.DefaultSignInScheme = IdentityConstants.ExternalScheme;
});

authenticationBuilder.AddIdentityCookies();
authenticationBuilder.AddGoogle(options =>
{
    options.ClientId = builder.Configuration["Authentication:Google:ClientId"] 
        ?? throw new InvalidOperationException("Google ClientId not configured in appsettings.json");
    options.ClientSecret = builder.Configuration["Authentication:Google:ClientSecret"]
        ?? throw new InvalidOperationException("Google ClientSecret not configured in appsettings.json");
    options.Events.OnTicketReceived += async context =>
    {
        var handler = context.HttpContext.RequestServices.GetRequiredService<GoogleSignInHandler>();
        await handler.OnTicketReceivedAsync(context);
    };
});

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(connectionString));
builder.Services.AddDatabaseDeveloperPageExceptionFilter();

builder.Services.AddIdentityCore<ApplicationUser>(options =>
    {
        options.SignIn.RequireConfirmedAccount = true;
        options.Stores.SchemaVersion = IdentitySchemaVersions.Version3;
    })
    .AddEntityFrameworkStores<ApplicationDbContext>()
    .AddSignInManager()
    .AddDefaultTokenProviders();

builder.Services.AddSingleton<IEmailSender<ApplicationUser>, IdentityNoOpEmailSender>();
builder.Services.AddScoped<GoogleSignInHandler>();

// Add Distributor services
builder.Services.AddScoped<IQcEngine, QcEngine>();
builder.Services.AddScoped<IDeliveryOrchestrator, DeliveryOrchestrator>();

// Add authorization policies
builder.Services.AddAuthorizationBuilder()
    .AddPolicy(DmfPolicies.FounderOnly, policy =>
        policy.RequireAssertion(context =>
            context.User.FindFirst("dmf:founder")?.Value == "true"
        ))
    .AddPolicy(DmfPolicies.OrgOwnerOrAdmin, policy =>
        policy.RequireAssertion(context =>
        {
            var roles = context.User.FindFirst("dmf:roles")?.Value ?? "";
            return roles.Contains("org_owner") || roles.Contains("org_admin") || roles.Contains("founder");
        }))
    .AddPolicy(DmfPolicies.HasFinance, policy =>
        policy.RequireAssertion(context =>
        {
            var roles = context.User.FindFirst("dmf:roles")?.Value ?? "";
            return roles.Contains("finance") || roles.Contains("org_owner") || roles.Contains("founder");
        }))
    .AddPolicy(DmfPolicies.HasLegal, policy =>
        policy.RequireAssertion(context =>
        {
            var roles = context.User.FindFirst("dmf:roles")?.Value ?? "";
            return roles.Contains("legal") || roles.Contains("founder");
        }))
    .AddPolicy(DmfPolicies.ContentManagement, policy =>
        policy.RequireAssertion(context =>
        {
            var roles = context.User.FindFirst("dmf:roles")?.Value ?? "";
            return roles.Contains("content_editor") || roles.Contains("org_admin") || roles.Contains("founder");
        }))
    .AddPolicy(DmfPolicies.SystemOps, policy =>
        policy.RequireAssertion(context =>
        {
            var roles = context.User.FindFirst("dmf:roles")?.Value ?? "";
            return roles.Contains("engineer") || roles.Contains("founder");
        }))
    .AddPolicy(DmfPolicies.ReadOnlyAnalyst, policy =>
        policy.RequireAssertion(context =>
        {
            var roles = context.User.FindFirst("dmf:roles")?.Value ?? "";
            return roles.Contains("analyst") || roles.Contains("founder");
        }))
    .AddPolicy(DmfPolicies.MfaRequired, policy =>
        policy.RequireAssertion(context =>
            context.User.FindFirst("dmf:mfa_required")?.Value == "true"
        ));

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseWebAssemblyDebugging();
    app.UseMigrationsEndPoint();
}
else
{
    app.UseExceptionHandler("/Error", createScopeForErrors: true);
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}
app.UseStatusCodePagesWithReExecute("/not-found", createScopeForStatusCodePages: true);
app.UseHttpsRedirection();

app.UseAntiforgery();

app.MapStaticAssets();
app.MapRazorComponents<App>()
    .AddInteractiveServerRenderMode()
    .AddInteractiveWebAssemblyRenderMode()
    .AddAdditionalAssemblies(typeof(DMF_MUSIC_PLATFORM.Client._Imports).Assembly);

// Add additional endpoints required by the Identity /Account Razor components.
app.MapAdditionalIdentityEndpoints();

// Map API controllers
app.MapControllers();

app.Run();

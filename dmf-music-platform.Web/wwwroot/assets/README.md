# DMF Asset Library Integration Guide

## Quick Start

The DMF Brand Kit v1.0.0 is now integrated into your project at:
```
/wwwroot/assets/
```

## File Structure

```
assets/
├── ASSET_LIBRARY_INDEX.md          ← START HERE
├── dmf_branding/                    (Logos)
├── dmf_splashes/                    (Splash screens)
├── dmf_icons/                       (32 component icons)
├── dmf_buttons/                     (Button CSS)
├── dmf_ux_kit/                      (Card/Input CSS)
├── dmf_textures/                    (Backgrounds)
├── dmf_charts/                      (Chart placeholders)
├── dmf_dsp_badges/                  (Platform logos)
├── dashboard_assets/                (Dashboard components)
├── app_builder_assets/              (Ryia assets)
└── owner_console_assets/            (Console UI)
```

## Integration Steps

### 1. Update Splash Screen
Reference logo in `Components/Pages/Splash.razor`:
```html
<img src="/assets/dmf_branding/gold-shield-logo.svg" alt="DMF Logo" />
```

### 2. Add Button Styles
Import in `Components/Layout/MainLayout.razor`:
```html
<link rel="stylesheet" href="/assets/dmf_buttons/button-styles.css" />
<link rel="stylesheet" href="/assets/dmf_ux_kit/card-styles.css" />
```

### 3. Use Icons in Components
Example in `DistributorWizard.razor`:
```html
<img src="/assets/dmf_icons/upload-icon.svg" alt="Upload" class="w-6 h-6" />
```

### 4. Display DSP Badges
In `DistributorStatus.razor`:
```html
<img src="/assets/dmf_dsp_badges/spotify-badge.svg" alt="Spotify" class="w-16 h-16" />
```

## Color Palette

Update your Tailwind config or CSS variables:
```css
--dmf-gold: #FFD700;
--dmf-blue: #00A8FF;
--dmf-black: #070708;
```

Already defined in existing `dmf-theme.css`.

## Next Steps

1. Reference `ASSET_LIBRARY_INDEX.md` for complete asset list
2. All files are SVG (scalable, lightweight, vector-based)
3. Export to PNG/JPG as needed for specific platforms
4. Maintain consistent DMF color scheme across all UI
5. Use in place of placeholder text/generic icons

## Assets Ready for Use

✅ 5 logo variations  
✅ 4 splash animations  
✅ 11 component icons  
✅ Button & card CSS  
✅ 9 DSP platform badges  
✅ 5 dashboard components  
✅ 5 app builder assets  
✅ 4 owner console components  

**Total: 60+ production-ready assets**

All assets are built into `/wwwroot/assets/` and ready for immediate use in your Razor components.

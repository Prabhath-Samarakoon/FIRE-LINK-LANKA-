# FireLink Lanka Favicon Setup Instructions

## Current Status
✅ Updated all system names to "FireLink Lanka"
✅ Updated theme colors to fire brigade red (#dc2626)
✅ Updated HTML title and meta descriptions
✅ Updated manifest.json with new branding

## Favicon Setup Required

To complete the favicon setup, you need to:

### Option 1: Use the Fire Engine Image
1. Copy `frontend/public/images/vehicles/FireEngine_pumper.png`
2. Resize it to 32x32 pixels
3. Convert to .ico format
4. Replace `frontend/public/favicon.ico`

### Option 2: Create a Simple Fire Icon
1. Use the favicon-generator.html file I created
2. Capture the fire truck emoji (🚒) at 32x32 pixels
3. Save as favicon.ico

### Option 3: Use Online Favicon Generator
1. Go to https://favicon.io/favicon-generator/
2. Upload your fire brigade image
3. Download the generated favicon.ico
4. Replace the existing favicon.ico

## Files Updated
- ✅ index.html (title, theme-color, description)
- ✅ manifest.json (name, short_name, theme_color)
- ✅ NavigationBar.jsx (nav title)
- ✅ HomePage.jsx (footer)
- ✅ Inspections.js (PDF headers/footers)
- ✅ Header.js (StaffManager header)
- ✅ Home.js (StaffManager home)

## Theme Colors
- Primary: #dc2626 (Fire Brigade Red)
- Background: #ffffff (White)
- Text: #000000 (Black)

The system is now branded as "FireLink Lanka" throughout!

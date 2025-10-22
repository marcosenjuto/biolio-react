# Debugging Guide for Biolio React App

## Opening Browser Developer Tools

### Windows/Linux:
- Press `F12`
- Or press `Ctrl + Shift + I`
- Or right-click on page → "Inspect"

### Mac:
- Press `Cmd + Option + I`
- Or right-click on page → "Inspect Element"

## Console Tab

The Console tab shows:
- ✅ `console.log()` messages (blue/white)
- ⚠️ `console.warn()` messages (yellow)
- ❌ `console.error()` messages (red)

### Current Debug Messages

When viewing molecules, you'll see:

**RDKit Viewer:**
```
[RDKit] Starting to load RDKit
[RDKit] Starting render for SMILES: CCCO
[RDKit] Module ready: true
[RDKit] Parsing SMILES...
[RDKit] Molecule parsed successfully
[RDKit] SVG generated, length: 1234
[RDKit] Drawing to canvas
[RDKit] Render complete!
```

**Kekule Viewer:**
```
[MoleculeViewer] Starting render for SMILES: CCCO
[MoleculeViewer] Kekule loaded: true
[MoleculeViewer] Kekule object: [Array of keys]
[MoleculeViewer] Kekule.IO: {...}
[MoleculeViewer] Available readers: [...]
[MoleculeViewer] Using SmilesReader
[MoleculeViewer] Parsed molecule: {...}
[MoleculeViewer] Creating viewer
[MoleculeViewer] Render complete!
```

## Network Tab

Check if libraries are loading:
1. Go to Network tab
2. Reload page (`Ctrl+R` or `Cmd+R`)
3. Look for:
   - `RDKit_minimal.js` (should be 200 OK)
   - `kekule.min.js` (should be 200 OK)
   - `kekule.css` (should be 200 OK)

## React DevTools

Install React Developer Tools extension:
- Chrome: https://chrome.google.com/webstore → Search "React Developer Tools"
- Firefox: https://addons.mozilla.org/firefox → Search "React Developer Tools"

Features:
- Inspect component props and state
- View component hierarchy
- Track re-renders
- Profile performance

## Common Issues

### 1. Molecules not rendering
**Check:**
- Console for error messages
- Network tab for failed library loads
- SMILES notation validity

**Solution:**
- Use the viewer switcher button (top right of reaction modal)
- Cycle through: RDKit → Kekule → Simple

### 2. "Unable to render" error
**Cause:** Invalid SMILES or library not loaded

**Solution:**
- Check console for specific error
- Try different viewer
- Verify SMILES notation in `reactionsDatabase.ts`

### 3. Blank screen
**Check:**
- Console for JavaScript errors
- Network tab for 404 errors
- Browser compatibility (use modern browsers)

## VS Code Debugging

### 1. Debug in VS Code with Chrome
1. Install "Debugger for Chrome" extension
2. Press `F5` or go to Run → Start Debugging
3. Set breakpoints in `.tsx` files
4. Variables will show in sidebar

### 2. Source Maps
Source maps are enabled by default in Vite, allowing you to:
- See original TypeScript code in browser DevTools
- Set breakpoints directly in browser
- Step through code line by line

## Useful Console Commands

Try these in the browser console:

```javascript
// Check if libraries loaded
window.RDKitModule
window.Kekule

// Check React state (requires React DevTools)
$r // Currently selected component

// Get all reactions
// (inspect the chemistry store in React DevTools)

// Check localStorage
localStorage.getItem('biolio-profile')
```

## Performance Profiling

### React DevTools Profiler:
1. Open React DevTools
2. Go to Profiler tab
3. Click record (●)
4. Perform actions
5. Click stop
6. View render times

### Browser Performance:
1. Open DevTools → Performance tab
2. Click record
3. Perform actions
4. Click stop
5. Analyze flame chart

## Tips

1. **Keep Console open** while developing
2. **Filter console messages** using the filter box
3. **Use console groups** for organized logs:
   ```typescript
   console.group('Rendering')
   console.log('Step 1')
   console.log('Step 2')
   console.groupEnd()
   ```
4. **Use console.table()** for arrays:
   ```typescript
   console.table(reactions)
   ```
5. **Preserve log** checkbox keeps messages after page reload

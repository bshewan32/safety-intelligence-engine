# Installation Guide - Client Setup Wizard

## 📋 Prerequisites

- Safety Intelligence Engine project (Electron + React + Prisma)
- Node.js and npm installed
- Existing AppShell component with navigation

---

## 🚀 Installation Steps

### Step 1: Create Directories

```bash
cd /path/to/Safety-Intelligence-Engine

# Create clients components directory
mkdir -p src/components/clients
```

### Step 2: Copy Component Files

```bash
# Copy React components
cp /path/to/package/components/ClientList.tsx src/components/clients/
cp /path/to/package/components/ClientSetupWizard.tsx src/components/clients/
```

### Step 3: Copy Backend Files

```bash
# Copy enhanced IPC handlers
cp /path/to/package/electron/ipc.ts electron/
```

### Step 4: Copy Type Definitions

```bash
# Copy TypeScript definitions
cp /path/to/package/types/window.d.ts src/types/
```

### Step 5: Update App Routing

```bash
# Copy updated App.jsx
cp /path/to/package/App.jsx src/
```

---

## ⚙️ Configuration

### Add Navigation to AppShell

Edit `src/components/layout/AppShell.jsx`:

```jsx
import { Building2 } from 'lucide-react';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'clients', label: 'Clients', icon: Building2 }, // ← ADD THIS LINE
  { id: 'workers', label: 'Workers', icon: Users },
  { id: 'hazards', label: 'Hazards', icon: AlertTriangle },
  { id: 'controls', label: 'Controls', icon: Shield },
  { id: 'reports', label: 'Reports', icon: FileText },
];
```

---

## ✅ Verification

### 1. Check File Structure

Your project should now have:

```
Safety-Intelligence-Engine/
├── electron/
│   └── ipc.ts                      ✅ Enhanced
├── src/
│   ├── components/
│   │   ├── clients/
│   │   │   ├── ClientList.tsx      ✅ New
│   │   │   └── ClientSetupWizard.tsx ✅ New
│   │   └── layout/
│   │       └── AppShell.jsx        ✅ Modified
│   ├── types/
│   │   └── window.d.ts             ✅ Enhanced
│   └── App.jsx                     ✅ Updated
```

### 2. Run TypeScript Check

```bash
npm run typecheck
```

Should complete without errors.

### 3. Start Development Server

```bash
npm run dev
```

### 4. Test the Feature

1. Application should open
2. Navigate to "Clients" in sidebar
3. You should see the ClientList view
4. Click "New Client Setup"
5. Complete the wizard
6. Verify client appears in grid

---

## 🧪 Test Checklist

- [ ] App starts without errors
- [ ] "Clients" appears in navigation
- [ ] ClientList loads empty state
- [ ] "New Client Setup" button works
- [ ] Wizard step 1 (info) loads
- [ ] Can enter client name
- [ ] Can proceed to step 2 (industry)
- [ ] Can select industry from dropdown
- [ ] Can select jurisdiction
- [ ] Can proceed to step 3 (framework)
- [ ] Can toggle ISO 45001
- [ ] Can proceed to step 4 (review)
- [ ] All info displays correctly
- [ ] Can create client
- [ ] Success screen appears with stats
- [ ] Client appears in grid after completion
- [ ] Can search for client
- [ ] Can delete client (with confirmation)

---

## 🐛 Common Issues & Fixes

### Issue: "Building2 is not defined"

**Solution:** Add import to AppShell:
```jsx
import { Building2 } from 'lucide-react';
```

### Issue: "window.api.listClients is not a function"

**Solution:** 
1. Verify `electron/ipc.ts` was copied
2. Check that `handleIPC(ipcMain, win)` is called in `main.ts`
3. Restart dev server

### Issue: TypeScript errors in window.d.ts

**Solution:**
1. Ensure you copied the entire file
2. Run `npm run typecheck` to see specific errors
3. Verify Client and Site interfaces are defined

### Issue: Wizard doesn't open

**Solution:**
1. Check browser console for errors
2. Verify ClientSetupWizard is imported in ClientList
3. Check modal z-index (should be z-50)

### Issue: Controls not importing

**Solution:**
1. Check browser console for Prisma errors
2. Run `npx prisma generate`
3. Verify database connection
4. Check for unique constraint violations

---

## 🔄 Rolling Back

If you need to undo the installation:

```bash
# Remove components
rm -rf src/components/clients

# Restore original files (if you backed them up)
cp electron/ipc.ts.backup electron/ipc.ts
cp src/types/window.d.ts.backup src/types/window.d.ts
cp src/App.jsx.backup src/App.jsx

# Remove Clients from AppShell navigation
# (manually edit AppShell.jsx)
```

---

## 📊 Post-Installation

### Verify Database

After creating your first client:

```bash
# Check if client was created
npx prisma studio

# Look for new row in Client table
# Verify controls were imported in Control table
# Verify hazards were imported in Hazard table
```

### Check Import Stats

In the wizard success screen, you should see:
- Hazards Imported: 3 (for Electrical industry)
- Controls Imported: 11 (5 + 3 + 3)
- Mappings Created: 0 (future feature)

---

## 🎯 Next Steps

After successful installation:

1. **Create test client** - Use wizard to create "Test Client"
2. **Verify imports** - Check Controls and Hazards libraries
3. **Delete test client** - Use delete button to verify cleanup
4. **Review documentation** - Read `CLIENT_SETUP_WIZARD_GUIDE.md`
5. **Plan Phase 2** - Consider Training Importer next

---

## 💡 Optimization Tips

### Performance
- Client list loads asynchronously (no blocking)
- Bulk imports use `createMany` for efficiency
- Search is memoized with `useMemo`

### User Experience
- Add loading indicator during framework setup
- Consider pagination for 100+ clients
- Add client sorting options

### Development
- Add unit tests for wizard steps
- Add E2E tests for complete flow
- Consider Storybook for component documentation

---

## 📞 Support

If you encounter issues not covered here:

1. Check browser console for errors
2. Check terminal for server errors
3. Review `docs/CLIENT_SETUP_WIZARD_GUIDE.md`
4. Check `docs/ARCHITECTURE_OVERVIEW.md` for technical details

---

## ✅ Installation Complete!

Once all verification steps pass, your Client Setup Wizard is ready for use.

**Total installation time:** ~5 minutes  
**Status:** Production Ready ✅

Enjoy your new client onboarding system! 🎉
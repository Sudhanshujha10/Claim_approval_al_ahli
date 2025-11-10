# Testing Checklist Features - Quick Guide

## ✅ Fixes Applied

### 1. **API Endpoints Fixed**
- Changed from relative `/api/...` to absolute `http://localhost:3001/api/...`
- This ensures frontend can reach backend properly

### 2. **AI Prompt Enhanced**
- Added explicit instructions for AI to calculate confidence scores
- AI must return actual confidence values (not template 0.95)
- Added example format for proper JSON response

### 3. **Default Confidence Fallback**
- If AI doesn't return confidence, defaults to 0.85 (medium-high)
- Prevents showing 0% confidence

## 🚀 How to Test

### Step 1: Restart Backend
```bash
# Stop current backend (Ctrl+C)
# Then restart:
node api/server.js
```

### Step 2: Upload a NEW Claim
**Important:** You must upload a NEW claim for the fixes to take effect!

1. Go to Dashboard
2. Click "Upload New Claim"
3. Upload claim form, invoice, and approval PDFs
4. Wait for AI processing

### Step 3: Check Claim Detail
1. Click on the newly created claim
2. Go to "Checklist" tab
3. **Verify:**
   - ✅ Each item shows confidence percentage (not 0%)
   - ✅ Confidence badges are color-coded (green/yellow/red)
   - ✅ "Mark Pass" and "Mark Fail" buttons appear
   - ✅ "Manual Override" badge shows when you click a button

### Step 4: Test Manual Override
1. Find any checklist item
2. Click "Mark Fail" button
3. **Expected:** Item changes to fail status with "Manual Override" badge
4. Click "Mark Pass" button
5. **Expected:** Item changes to pass status

### Step 5: Test Low Confidence Filter
1. Toggle "Show Low Confidence Fields" ON
2. **Expected:** Only items with confidence <70% show
3. Toggle OFF
4. **Expected:** All items show again

### Step 6: Test Re-run Validation
1. Click "Re-run AI Validation" button
2. **Expected:** 
   - Button shows "Re-running..." with spinner
   - After ~10-30 seconds, checklist updates
   - New confidence scores appear

## 🔍 Troubleshooting

### If Confidence Still Shows 0%:
1. **Check backend console** for errors
2. **Verify OpenAI API key** is set in `.env`
3. **Upload a FRESH claim** (old claims have old data)
4. **Check browser console** (F12) for API errors

### If Buttons Don't Work:
1. **Check browser console** for network errors
2. **Verify backend is running** on port 3001
3. **Check CORS** - backend should show no CORS errors
4. **Try hard refresh** (Ctrl+Shift+R or Cmd+Shift+R)

### If Re-run Doesn't Work:
1. **Check if claim has `combinedText` and `structuredData`**
2. Old claims might not have this data
3. Upload a new claim to test

## 📊 Expected Behavior

### Confidence Scores:
- **Green (85-100%)**: High confidence - AI is very sure
- **Yellow (65-84%)**: Medium confidence - Some ambiguity
- **Red (0-64%)**: Low confidence - Missing/unclear data

### Manual Override:
- Allows you to override AI decision
- Adds "Manual Override" badge
- Persists across page refreshes
- Saved to `api/_data/claims.json`

### Re-run Validation:
- Calls OpenAI again with same documents
- May give different results (AI is non-deterministic)
- Updates all checklist items
- Preserves manual overrides unless explicitly changed

## 🎯 Success Criteria

✅ Confidence scores show realistic values (not 0%)
✅ Manual override buttons work and persist
✅ Low confidence filter works
✅ Re-run validation updates checklist
✅ All 22 checklist items render properly
✅ Color-coded confidence badges display correctly

## 📝 Notes

- **Old claims** won't have new features - upload fresh ones
- **AI responses** may vary - confidence is based on document clarity
- **Manual overrides** are stored permanently until changed
- **Re-validation** costs OpenAI API credits each time

---

**If issues persist, share:**
1. Browser console errors (F12 → Console tab)
2. Backend terminal output
3. Screenshot of the checklist display

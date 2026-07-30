# Plan 17: Run vs Check - Test Case Execution

## Requirement
- Admin creates test cases (all in one list)
- **Run button** → runs only FIRST 3 test cases (sample)
- **Check button** → runs ALL test cases (sample + hidden)

---

## Current State
- Backend `/execute/run` - already runs first 3 ✅
- Backend `/execute/submit` - already runs ALL ✅
- Frontend Run button → calls `/execute/run` ✅
- Frontend Check button → calls `/execute/submit` ✅
- Question model has `testCases` array ✅
- Frontend has `hiddenTestCases` field (NOT needed - remove it)

---

## Changes Needed

### 1. Frontend - QuestionForm.jsx
**Remove** the separate "Hidden Test Cases" section since we don't need it anymore.

Only keep "Sample Test Cases" - admin can add as many as they want.

### 2. Backend - execute.js (already correct!)
- `/execute/run` → uses `testCases.slice(0, 3)` ✅
- `/execute/submit` → uses all `testCases` ✅

No changes needed!

---

## Summary

| Action | Test Cases Used |
|--------|-----------------|
| Run | First 3 only |
| Check/Submit | All test cases |

The backend is already implemented correctly. Just need to clean up the frontend QuestionForm to remove the unnecessary "Hidden Test Cases" section.

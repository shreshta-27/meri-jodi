# Profile Update Architecture

## Overview
The profile system now uses **two separate HTTP operations**:
### 1. **POST /api/profiles** (Create Profile - One Time)
- Used in `AddDetailsManually.jsx` during initial signup
- Creates profile with limited information
- Called only once
- Backend enforces: Returns **409 Conflict** if profile already exists
### 2. **PUT /api/profiles/me** (Update Profile - Multiple Times)
- Used in `MyProfile.jsx` for adding/editing remaining details
- Called every time user wants to add/edit information
- Backend enforces: Merges partial data with existing profile (doesn't overwrite unmodified nested fields)
---
## Frontend Architecture
### `profileApi.js`
The API layer handles all profile operations:
```javascript
// Fetch profile
await getMyProfile()
// Create (initial signup)
await createProfile(formData)
// Update (add/edit remaining details) — ⭐ NEW
await updateProfile(partialData)
// Helpers for building payloads
buildPersonalDetailsPayload(formData)
buildFamilyPayload(formData)
buildCareerEducationPayload(formData)
buildReligionPayload(formData)
buildLifestylePayload(formData)
```
### `EditProfileModal.jsx`
A reusable modal component for editing different profile sections:
**Features:**
- Accepts `section` prop: `"personal"` | `"family"` | `"career"` | `"religion"` | `"lifestyle"`
- Pre-fills form fields from existing profile data
- Sends only **changed fields** via PUT (doesn't clobber sibling fields)
- Handles validation and error display
- Shows loading state while saving
**Example:**
```jsx
<EditProfileModal
  isOpen={true}
  section="family"
  profile={profile}
  onClose={() => setEditingSection(null)}
  onSuccess={() => {
    // Refetch profile and close
    handleEditComplete()
  }}
/>
### `MyProfile.jsx`
Updated to:
- Track `editingSection` state
- Wire all edit buttons → open modal with appropriate section
- Call `handleEditComplete()` to refetch and close modal
**Edit buttons wired:**
- ✎ Edit (Personal Details)
- ✎ Edit (Family Background)
- ✎ Edit (Career & Education)
- ✎ Edit (Religion Details)
- Add Lifestyle Preferences (link)
- edit profile (top button)
## How It Works: Step-by-Step
### Scenario: User adds Father's Occupation after initial signup
1. **User clicks "Edit" on Family Background section**
   - `setEditingSection("family")` opens modal
2. **Modal initializes form**
   - Pre-fills from `profile.family` (other fields stay intact)
   - User enters "Doctor" in Father's Occupation field
   - Submits form
3. **API Call**
   ```javascript
   const payload = buildFamilyPayload({ fatherOccupation: "Doctor" })
   // Result: { family: { fatherOccupation: "Doctor" } }
   
   await updateProfile(payload)
   // Calls PUT /api/profiles/me with above payload
   ```
4. **Backend Merges**
   - Receives: `{ family: { fatherOccupation: "Doctor" } }`
   - Current: `{ family: { familyType: "joint", motherOccupation: "Nurse", ... } }`
   - Merges to: `{ family: { familyType: "joint", motherOccupation: "Nurse", fatherOccupation: "Doctor" } }`
   - ✅ Other family fields preserved!
5. **Frontend Refetch**
   - Modal closes
   - `handleEditComplete()` calls `getMyProfile()` again
   - UI updates with fresh data
## Key Design Decisions
### Why Separate POST and PUT?
- **POST** enforces "create once" rule (no duplicate profiles per user)
- **PUT** allows unlimited edits without constraints
- Matches REST conventions
### Why Send Partial Data?
- `{ family: { fatherOccupation: "Doctor" } }` not `{ family: { ...allFields } }`
- Prevents accidentally overwriting sibling fields if frontend state is stale
- If user has old profile data in memory and edits one field, other fields won't be lost
### Why Pre-fill Form Fields?
- User sees current values while editing
- Can make incremental changes instead of re-entering everything
- Better UX for multiple edits
## Adding New Sections
To add a new editable section (e.g., "Hobbies"):
1. **Create helper in `profileApi.js`:**
   export const buildHobbiesPayload = (formData) => {
     const hobbies = {};
     if (formData.hobbies !== undefined) hobbies.hobbies = formData.hobbies;
     return Object.keys(hobbies).length ? { hobbies } : {};
   };
2. **Add form fields to `EditProfileModal.jsx`:**
   ```jsx
   {section === "hobbies" && (
     <input
       type="text"
       name="hobbies"
       placeholder="Enter hobbies..."
       value={formData.hobbies}
       onChange={handleChange}
       className="w-full border border-[#E0BEBF] rounded-lg px-3 py-2"
     />
   )}
3. **Add to switch statement in `handleSubmit`:**
   case "hobbies":
     payload = buildHobbiesPayload(formData);
     break;
4. **Add edit button to `MyProfile.jsx`:**
   <button onClick={() => setEditingSection("hobbies")}>
     ✎ Edit
   </button>
## Error Handling
Both modal and API handle errors gracefully:
- **Validation errors**: Displayed in modal
- **Network errors**: Caught and shown to user
- **409 Conflict** (on POST): Redirects to MyProfile page
- **404** (on GET): Shows "complete your profile" prompt
## Testing Checklist
- [ ] Create profile via AddDetailsManually → saves to MongoDB
- [ ] Open MyProfile → shows limited data
- [ ] Click edit button → modal opens with pre-filled data
- [ ] Edit one field → only that field changes in DB
- [ ] Verify siblings fields not overwritten
- [ ] Refresh page → see updated data
- [ ] Edit same section again → new data pre-filled
- [ ] Close modal without saving → no changes
## Summary
| Operation | When | HTTP Method | Endpoint | Response |
|-----------|------|------------|----------|----------|
| Create | Signup | POST | `/api/profiles` | Full new profile |
| Read | Page load | GET | `/api/profiles/me` | Full current profile |
| Update | Any edit | PUT | `/api/profiles/me` | Updated profile |
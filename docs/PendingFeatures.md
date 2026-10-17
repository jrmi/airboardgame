# Pending features (to re-implement one at a time)

On 2026-10-09 `master` was reset to jrmi's latest upstream (`30b8928`, "Improve
grid management and generator (#475)") with only the held-item rotation code
re-applied on top. Everything else that was on `master` is preserved on the
branch **`saved/all-changes-2026-10-09`** (old tip `c73ad64`).

To look at the original code for a feature:

```sh
git diff 30b8928 saved/all-changes-2026-10-09 -- <files listed below>
git show <commit>
```

## Features

1. **Drag limits (`limitPan`)** — from `9d52ad0`. "Limit board dragging"
   checkbox in `BoardForm.jsx`/`SessionForm.jsx`, passed as `limitPan` to the
   board in `BoardView.jsx`. Needed the local `../reactsyncboard` fork. Note:
   this code was already lost during the 2026-10-01 upstream merge, so it is
   only in `9d52ad0` itself, not on the saved branch tip.
2. **Media upload error toast** — `src/mediaLibrary/MediaLibraryModal.jsx`
   `onError` handler (from `9d52ad0`).
3. **Load-session media fix** — `src/views/BoardView/LoadSessionModal.jsx`
   saves the session before uploading media, since the backend rejects uploads
   for a never-stored session (from `3bfa850`).
4. **Unique usernames** — `src/users/useUniqueUsername.js`,
   `src/users/UserConfig.jsx`, `src/users/UserList.jsx`, `src/views/Session.jsx`
   (`joinSpace` on mount), `src/views/RoomView/RoomView.jsx` (from `f0e924f`).
5. **Player groups / roles** — `src/hooks/useGroups.js`,
   `src/views/BoardView/GroupsPanel.jsx`, NavBar button (from `f0e924f`).
6. **Board items panel** — `src/views/BoardView/BoardItemsPanel.jsx`,
   searchable item list that centers the view on click (from `f0e924f`).
7. **Modal fixes** — `src/ui/Modal.jsx`: drag-release-on-backdrop no longer
   closes, `onClose` prop, stuck-transition fix (from `f0e924f`).
8. **Item hiding by group** — depends on #5. `GroupVisibilityWrapper.jsx`,
   `src/hooks/useHiddenItemOpacity.js`, `hidden` field in every
   `gameComponents/*/index.js`, `itemTemplates.js`, `toggleGroupHide` /
   `groupHide` action in `useGameItemActions.jsx`, opacity setting in
   `UserConfig.jsx` (from `7e29724`).
9. **i18n text tweaks** — "Invite more player" -> "Invite more players"
   (`UserBar.jsx`, `WelcomeModal.jsx`, `InviteModal.jsx`, `RoomNavBar.jsx`) and
   new strings in `en.json`/`fr.json` for the features above.
10. ~~**Dev tooling**~~ — restored 2026-10-09 (`npm run dev:all`).
11. **Asset edits** — `public/game_assets/dice/three.svg`,
    `src/media/images/cursor.svg`, `cursor2.svg`.
12. **Misc** — `docs/TaskList.txt`, `backend/package-lock.json` changes.

## Kept on master

- Held-item rotation: `computeHeldRotationUpdates` in `useGameItemActions.jsx`
  (used by rotate, tap, random rotate), `captureHeldReferences` in
  `src/utils/item.js`, holder `onPlaceItem` changes in `Image`,
  `AdvancedImage`, `Zone`, `CheckerBoard`, and the edit-panel rotation field in
  `EditItemButton.jsx` (from `9d52ad0` + `3bfa850`).
- `CLAUDE.md` and the `.gitignore` additions (tooling only, no app behavior).

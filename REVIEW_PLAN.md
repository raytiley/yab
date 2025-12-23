# YAB Production Ready Review

## Completed

- [x] **Fix TypeScript errors in color-highlight-button** - Removed dead "node" mode code referencing non-existent `toggleNodeBackgroundColor` commands
- [x] **Fix TiptapRenderer** - Was incorrectly wrapping all content in a single `<p>` tag, breaking headings/lists/etc.
- [x] **Apply retro prose theme** - Changed from `prose-neutral` to `prose-retro` to match GeoCities aesthetic
- [x] **Add missing extensions to renderer** - Added `OrderedList` and `TextAlign`, removed unused `ImageUploadNode`

## Remaining Code Fixes

- [ ] **Add authentication to `/posts/new`** - Currently anyone can create posts
- [ ] **Fix MAX_FILE_SIZE comment** - Comment says 5MB but value is 10MB
- [ ] **Remove debug `console.log` statements** - Left in production code
- [ ] **Remove `"use client"` directives** - Next.js-specific, not needed in React Router
- [ ] **Fix SimpleEditor default content** - Starts with sample content instead of empty
- [ ] **Add duplicate slug handling** - No check for duplicate slugs when creating posts

## Infrastructure TODO

- [ ] **Set up GitHub Actions CI** - Build, typecheck, and test on PRs
- [ ] **Add basic test suite** - At minimum, build verification

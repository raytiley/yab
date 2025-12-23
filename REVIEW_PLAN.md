# YAB Production Ready Review

## Completed

- [x] **Fix TypeScript errors in color-highlight-button** - Removed dead "node" mode code referencing non-existent `toggleNodeBackgroundColor` commands
- [x] **Fix TiptapRenderer** - Was incorrectly wrapping all content in a single `<p>` tag, breaking headings/lists/etc.
- [x] **Apply retro prose theme** - Changed from `prose-neutral` to `prose-retro` to match GeoCities aesthetic
- [x] **Add missing extensions to renderer** - Added `OrderedList` and `TextAlign`, removed unused `ImageUploadNode`
- [x] **Set up GitHub Actions CI** - Prisma validate, typecheck, lint, build
- [x] **Add ESLint** - TypeScript + React hooks plugins configured
- [x] **Add authentication to `/posts/new`** - Only authenticated users can create posts
- [x] **Add duplicate slug handling** - Check for existing posts with same slug
- [x] **Fix SimpleEditor default content** - Now starts empty, accepts initialContent/initialTitle props
- [x] **Fix MAX_FILE_SIZE comment** - Fixed comment to say 10MB (matching actual value)
- [x] **Add error display to new post form** - Show validation errors and loading state

## Not Changed (Intentionally)

- **`"use client"` directives** - Harmless in React Router (ignored), left as-is
- **`console.log` in JSDoc** - These are documentation examples, not debug code

## Future Improvements

- [x] Add test suite - Vitest with 26 tests for slug utility and tiptap-utils
- [ ] Fix React hooks lint warnings (real issues in TipTap components)

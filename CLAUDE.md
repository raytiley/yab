# YAB - Yet Another Blog

Personal blog platform for raytiley.com with a retro GeoCities aesthetic. Future home of "RayOS" - personal tracking/improvement tools.

## Quick Reference

```bash
npm run dev          # Start dev server (localhost:7000)
npm run build        # Build for production
npm run start        # Run production server (port 3000)
npm run typecheck    # Type check with react-router typegen
npm run lint         # ESLint
npm run test         # Run tests
npm run test:watch   # Tests in watch mode
```

### Database Commands
```bash
npm run db:start     # Start local Supabase (Docker)
npm run db:stop      # Stop local Supabase
npm run db:status    # Show Supabase status and keys
npm run db:reset     # Reset local database
npm run db:migrate   # Run Prisma migrations (dev)
npm run db:studio    # Open Prisma Studio GUI
```

## Tech Stack

- **Framework**: React 19 + React Router 7 (SSR, file-based routing)
- **Database**: PostgreSQL on Supabase + Prisma ORM
- **Auth**: Supabase Auth (@supabase/ssr)
- **Editor**: TipTap (ProseMirror-based rich text)
- **Styling**: Tailwind CSS 4 with retro typography theme
- **Build**: Vite
- **Testing**: Vitest
- **Deploy**: Vercel (prod), Docker available

## Project Structure

```
app/
├── routes/              # File-based routing (React Router v7)
│   ├── _index.tsx       # Home page (/ - latest posts + TV effect)
│   ├── posts.tsx        # Blog index (/posts)
│   ├── posts_.new.tsx   # Create post (/posts/new - protected)
│   ├── posts_.$slug.tsx # View post (/posts/:slug)
│   ├── login.tsx        # Login form
│   ├── sign-up.tsx      # Registration
│   ├── forgot-password.tsx
│   ├── update-password.tsx
│   ├── auth.callback.tsx   # OAuth/PKCE callback
│   ├── auth.confirm.tsx    # Email OTP verification
│   ├── auth.error.tsx      # Auth error display
│   ├── protected.tsx       # Example protected route
│   └── logout.tsx
├── components/
│   ├── shell.tsx        # Main layout (navbar, footer)
│   ├── simple-editor.tsx # TipTap editor wrapper
│   ├── tiptap-renderer.tsx # Renders TipTap JSON to HTML
│   ├── ui/              # Shadcn-style primitives
│   ├── tiptap-icons/    # 40+ editor toolbar icons
│   ├── tiptap-ui/       # Editor UI components
│   └── tiptap-node/     # Custom TipTap node renderers
├── lib/
│   ├── prisma.server.ts # Singleton Prisma client
│   ├── supabase/
│   │   ├── server.ts    # Server-side Supabase client
│   │   └── client.ts    # Browser Supabase client
│   ├── slug.ts          # Title to URL slug conversion
│   └── tiptap-utils.ts  # Editor utilities (image upload, etc.)
├── hooks/               # Custom React hooks (10 files)
└── styles/              # Global styles

prisma/
├── schema.prisma        # Database schema
└── migrations/          # Migration history

tests/                   # Vitest tests
```

## Database Schema

Single model currently - `Post`:

```prisma
model Post {
  id            String    @id @default(cuid())
  slug          String    @unique          // URL-friendly from title
  title         String
  contentJson   Json                       // TipTap editor JSON
  publishedAt   DateTime?                  // null = draft
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}
```

## Environment Variables

```bash
# Database (Supabase PostgreSQL)
DATABASE_URL="postgresql://...?pgbouncer=true"  # Pooled connection
DIRECT_URL="postgresql://..."                    # Direct (for migrations)

# Supabase (client-side safe)
VITE_SUPABASE_URL="https://[project].supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-key"
```

## Authentication Flow

Supabase Auth handles all authentication:

1. **Sign Up** → Email confirmation sent → `/auth/confirm` verifies OTP
2. **Login** → Creates session cookie → Redirects to `/`
3. **Forgot Password** → Email with reset link → `/auth/callback` → `/update-password`
4. **Protected Routes** → Loader checks session → Redirects to `/login` if needed

## Key Patterns

### Route Protection
```typescript
// In any route loader
export async function loader({ request }: Route.LoaderArgs) {
  const { supabase } = createClient(request);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw redirect('/login');
  }
  return { user };
}
```

### Data Loading (Loader)
```typescript
export async function loader() {
  const posts = await prisma.post.findMany({
    orderBy: { publishedAt: 'desc' }
  });
  return { posts };
}
```

### Form Actions
```typescript
export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  // Process and return or redirect
}
```

### TipTap Editor
- JSON content stored in `contentJson` field
- Rendered via `TiptapRenderer` component
- Images uploaded to Supabase Storage

## Styling

Retro GeoCities aesthetic:
- Colors: Cyan (#00ccff), Neon Green (#00ff99), dark backgrounds
- Font: Monospace throughout
- Custom `prose-retro` typography variant in Tailwind
- TV static animation on home page

## Testing

```bash
npm run test        # Run all tests
npm run test:watch  # Watch mode
```

Tests located in `tests/`:
- `slug.test.ts` - URL slug generation
- `tiptap-utils.test.ts` - Editor utilities

## Deployment

**Vercel** (primary):
- Connected to GitHub, auto-deploys on push
- Environment variables in Vercel dashboard

**Docker** (alternative):
```bash
docker build -t yab .
docker run -p 3000:3000 --env-file .env yab
```

## Future: RayOS

Planned personal tracking/improvement features to replace one-off apps:
- Habit tracking
- Goal setting
- Data analysis
- AI-powered coaching
- All data self-hosted

---

## Local Development Setup

### Prerequisites
- Node.js 20+
- Docker Desktop (for local Supabase)
- Supabase CLI (`brew install supabase/tap/supabase`)

### First Time Setup
```bash
# 1. Install dependencies
npm install

# 2. Start local Supabase (pulls Docker images on first run)
npm run db:start

# 3. Copy local environment file
cp .env.local .env

# 4. Run database migrations
npm run db:migrate

# 5. Start dev server
npm run dev
```

### Daily Development
```bash
# Start Supabase if not running
npm run db:start

# Start dev server (runs on port 7000)
npm run dev
```

### Local Supabase Services

When `npm run db:start` is running:

| Service | URL |
|---------|-----|
| App | http://localhost:7000 |
| Supabase Studio | http://localhost:54323 |
| Supabase API | http://localhost:54321 |
| Mailpit (email testing) | http://localhost:54324 |
| Database | postgresql://postgres:postgres@localhost:54322/postgres |

### Environment Files

- `.env.local` - Local Supabase credentials (auto-generated, gitignored)
- `.env` - Active environment (copy from .env.local for local dev)
- `.env.example` - Template for production credentials

### Useful Commands
```bash
npm run db:status    # Check if Supabase is running + show keys
npm run db:stop      # Stop Supabase containers
npm run db:reset     # Reset database to clean state
npm run db:studio    # Open Prisma Studio for data browsing
supabase status      # Show all local Supabase URLs and keys
```

### Testing Auth Locally

**Dev user credentials:**
- Email: `dev@raytiley.com`
- Password: `password123`

This user is automatically seeded on `npm run db:reset`. Public sign-up is disabled since this is a personal blog.

Supabase local dev includes Mailpit for email testing. Password reset emails appear at http://localhost:54324.

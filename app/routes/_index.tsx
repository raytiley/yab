import { redirect, useLoaderData, type LoaderFunctionArgs, Link } from "react-router";
import TVSnow from "~/components/TvSnow";
import prisma from "~/lib/prisma.server";
import { createClient } from "~/lib/supabase/server";

export async function loader({ request }: LoaderFunctionArgs) {
  // Handle Supabase auth errors that redirect to root
  const url = new URL(request.url);
  const error = url.searchParams.get("error");
  const errorDescription = url.searchParams.get("error_description");

  if (error) {
    const message = errorDescription || error;
    return redirect(`/auth/error?error=${encodeURIComponent(message)}`);
  }

  const { supabase } = createClient(request);
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user ?? null;

  const latestPosts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    select: { title: true, slug: true, createdAt: true },
  });

  return { latestPosts, user };
}

export function meta() {
  return [
    { title: "raytiley.com - Home of Ray Tiley" },
    {
      name: "description",
      content:
        "Welcome to raytiley.com, the personal website of Ray Tiley. Explore my blog posts, projects, and more.",
    },
  ]
}

export default function Index() {
  const data = useLoaderData<typeof loader>();

  // Show RayOS dashboard for logged-in users
  if (data.user) {
    return (
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#00ccff] mb-2">RayOS</h1>
          <p className="text-[#00ff99]/70">Personal tracking & improvement tools</p>
        </header>

        {/* RayOS Tools Grid */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            to="/habits"
            className="group block p-6 bg-[#111] border border-[#00ff99]/30 rounded-xl hover:border-[#00ccff] transition-colors"
          >
            <div className="text-4xl mb-3">📊</div>
            <h2 className="text-xl font-bold text-[#00ccff] group-hover:text-[#00ff99] transition-colors">
              Habits
            </h2>
            <p className="text-sm text-[#00ff99]/70 mt-1">
              Track daily habits and build streaks
            </p>
          </Link>

          <Link
            to="/posts/new"
            className="group block p-6 bg-[#111] border border-[#00ff99]/30 rounded-xl hover:border-[#00ccff] transition-colors"
          >
            <div className="text-4xl mb-3">✍️</div>
            <h2 className="text-xl font-bold text-[#00ccff] group-hover:text-[#00ff99] transition-colors">
              New Post
            </h2>
            <p className="text-sm text-[#00ff99]/70 mt-1">
              Write a new blog post
            </p>
          </Link>

          <Link
            to="/posts"
            className="group block p-6 bg-[#111] border border-[#00ff99]/30 rounded-xl hover:border-[#00ccff] transition-colors"
          >
            <div className="text-4xl mb-3">📚</div>
            <h2 className="text-xl font-bold text-[#00ccff] group-hover:text-[#00ff99] transition-colors">
              Posts
            </h2>
            <p className="text-sm text-[#00ff99]/70 mt-1">
              Manage blog posts
            </p>
          </Link>

          <div className="group block p-6 bg-[#111] border border-[#00ff99]/20 rounded-xl opacity-50">
            <div className="text-4xl mb-3">🎯</div>
            <h2 className="text-xl font-bold text-[#00ff99]/50">
              Goals
            </h2>
            <p className="text-sm text-[#00ff99]/40 mt-1">
              Coming soon...
            </p>
          </div>
        </div>

        {/* Quick Stats could go here later */}
      </div>
    );
  }

  // Public home page
  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-xl font-bold text-cyan-400">Latest Episodes</h1>

      {/* Aspect box should match your PNG's ratio; tweak as needed */}
      <div className="relative w-full max-w-2xl mx-auto aspect-[4/3]">
        {/* SNOW layer (behind) */}
        <div className="absolute inset-0 z-10">
          {/* Screen aperture — adjust the % to fit the bezel opening */}
          <div className="absolute left-[5%] top-[10%] right-[25%] bottom-[7%] overflow-hidden rounded-[4%]">
            <TVSnow
              fps={30}
              className="absolute inset-0 w-full h-full"
            />
          </div>
        </div>

        {/* FRAME layer (on top) */}
        <img
          src="/images/tv-frame.png"
          alt="Retro TV frame"
          className="absolute inset-0 w-full h-full object-contain z-20 pointer-events-none select-none"
        />
      </div>
      {data.latestPosts.map((post) => (
        <div key={post.slug} className="p-4 border-b border-[#00ff99]/20">
          <a
            href={`/posts/${post.slug}`}
            className="text-lg font-semibold text-[#00ccff] hover:underline"
          >
            {post.title}
          </a>
          <p className="text-sm text-[#00ff99]/70">
            Published on {new Date(post.createdAt).toLocaleDateString()}
          </p>
        </div>
      ))}
    </div>
  );
}

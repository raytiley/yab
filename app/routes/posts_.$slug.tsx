import { redirect, useLoaderData, type LoaderFunctionArgs } from "react-router";
import TiptapRenderer from "~/components/posts/TiptapRenderer";
import prisma from "~/lib/prisma.server";


export async function loader({ params }: LoaderFunctionArgs) {
  const { slug } = params;

  if (!slug) {
    // Note: must return the redirect
    return redirect("/");
  }

  const post = await prisma.post.findUnique({
    where: { slug },
  });

  if (!post) {
    throw new Response("Not Found", { status: 404 });
  }

  return post;
}

export default function Post() {
  const post = useLoaderData<typeof loader>();

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl text-[#00ffaa] font-mono">
          {post.title}
        </h1>
        {post.publishedAt ? (
          <p className="mt-2 text-sm text-[#9ca3af]">
            {new Date(post.publishedAt).toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        ) : null}
      </header>

      {/* Render TipTap JSON via the renderer */}
      <TiptapRenderer document={(post as any).contentJson} />
    </main>
  );
}

import { useLoaderData } from "react-router";
import prisma from "~/lib/prisma.server";

export async function loader() {
    const allPosts = await prisma.post.findMany({
        orderBy: { createdAt: 'desc' },
        select: { title: true, slug: true, createdAt: true },
    });
    return allPosts;
}

export default function Posts() {
    const posts = useLoaderData<typeof loader>();

    return (
        <div className="max-w-3xl mx-auto p-6 space-y-6">
            <h1 className="text-2xl font-bold text-cyan-400 mb-4">All Posts</h1>
            {posts.map((post) => (
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
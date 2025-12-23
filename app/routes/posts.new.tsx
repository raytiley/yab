import { data, redirect, useFetcher, useNavigate, type ActionFunctionArgs, type LoaderFunctionArgs } from "react-router";
import { SimpleEditor } from "~/components/tiptap-templates/simple/simple-editor";
import prisma from "~/lib/prisma.server";
import { createClient } from "~/lib/supabase/server";

function titleToSlug(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Protect route - only authenticated users can create posts
export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase } = createClient(request);
  const { data: userData, error } = await supabase.auth.getUser();

  if (error || !userData?.user) {
    return redirect("/login");
  }

  return { user: userData.user };
}

export async function action({ request }: ActionFunctionArgs) {
  // Verify user is authenticated before allowing post creation
  const { supabase } = createClient(request);
  const { data: userData, error: authError } = await supabase.auth.getUser();

  if (authError || !userData?.user) {
    return redirect("/login");
  }

  const formData = await request.formData();
  const postContent = formData.get("content") as string;
  const postTitle = formData.get("title") as string;
  const errors: {
    title?: string
    content?: string
    slug?: string
   } = {};

  if (!postTitle) {
    errors.title = "Title is required";
  }

  if (!postContent) {
    errors.content = "Content is required";
  }

  if (Object.keys(errors).length) {
    return data({ errors }, { status: 400 });
  }

  let json = null;
  try {
    json = JSON.parse(postContent);
  } catch {
    errors.content = "Content must be valid JSON";
    return data({ errors }, { status: 400 });
  }

  const slug = titleToSlug(postTitle);

  // Check for duplicate slug
  const existingPost = await prisma.post.findUnique({
    where: { slug },
    select: { id: true },
  });

  if (existingPost) {
    errors.slug = "A post with this title already exists";
    return data({ errors }, { status: 400 });
  }

  await prisma.post.create({
    data: {
      slug,
      title: postTitle,
      contentJson: json,
    },
  });

  return redirect(`/posts/${slug}`);
}

export default function NewPostRoute() {
  const navigate = useNavigate();
  const fetcher = useFetcher();

  function handleSave(post: { title: string; content: unknown }) {
    const formData = new FormData();
    formData.set("title", post.title);
    formData.set("content", JSON.stringify(post.content));
    fetcher.submit(formData, { method: "post" });
  }
  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <header className="mb-6">
          <h1 className="text-3xl font-bold">Create New Post</h1>
          <p className="text-muted-foreground">
            Add a title, write your content, then save when you’re ready.
          </p>
        </header>

        <SimpleEditor
          onSave={handleSave}
          onCancel={() => navigate(-1)}
          className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6"
        />
      </div>
    </main>
  );
}

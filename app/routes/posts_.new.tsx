import { data, redirect, useFetcher, useNavigate, type ActionFunctionArgs, type LoaderFunctionArgs } from "react-router";
import { SimpleEditor } from "~/components/tiptap-templates/simple/simple-editor";
import prisma from "~/lib/prisma.server";
import { titleToSlug } from "~/lib/slug";
import { createClient } from "~/lib/supabase/server";

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
  const fetcher = useFetcher<{ errors?: { title?: string; content?: string; slug?: string } }>();
  const errors = fetcher.data?.errors;
  const isSubmitting = fetcher.state === "submitting";

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
            Add a title, write your content, then save when you're ready.
          </p>
        </header>

        {errors && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md" role="alert">
            <h2 className="text-red-800 dark:text-red-200 font-semibold mb-2">
              Please fix the following errors:
            </h2>
            <ul className="list-disc list-inside text-red-700 dark:text-red-300 space-y-1">
              {errors.title && <li>{errors.title}</li>}
              {errors.content && <li>{errors.content}</li>}
              {errors.slug && <li>{errors.slug}</li>}
            </ul>
          </div>
        )}

        {isSubmitting && (
          <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
            <p className="text-blue-700 dark:text-blue-300">Saving post...</p>
          </div>
        )}

        <SimpleEditor
          onSave={handleSave}
          onCancel={() => navigate(-1)}
          className="bg-[#0e0e11] rounded-lg border border-[rgba(0,255,170,0.2)] p-6"
        />
      </div>
    </main>
  );
}

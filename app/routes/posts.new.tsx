import { data, redirect, useFetcher, useNavigate, type ActionFunctionArgs } from "react-router";
import { SimpleEditor } from "~/components/tiptap-templates/simple/simple-editor";
import prisma from "~/lib/prisma.server";

function titleToSlug(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const postContent = formData.get("content") as string;
  const postTitle = formData.get("title") as string;
  const errors: { 
    title?: string
    content?: string
   } = {
  };
  
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

  // Here you would typically handle saving the post to your database
  console.log("Post Title:", postTitle);
  console.log("Post Content:", JSON.stringify(postContent, null, 2));

  await prisma.post.create({
    data: {
      slug: titleToSlug(postTitle),
      title: postTitle,
      contentJson: json,
    },
  });

  return redirect(`/posts/${titleToSlug(postTitle)}`);
}

export default function NewPostRoute() {
  const navigate = useNavigate();
  const fetcher = useFetcher();

  function handleSave(post: any) {
    const formData = new FormData();
    formData.set("title", post.title);
    formData.set("content", JSON.stringify(post.content));
    fetcher.submit(formData, { method: "post" });
    console.log("Saving post:", post);
    // Here you would typically send the post data to your backend or API
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

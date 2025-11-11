import Bold from "@tiptap/extension-bold";

import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Heading from "@tiptap/extension-heading";
import Text from "@tiptap/extension-text";
import Italic from "@tiptap/extension-italic";
import Highlight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";
import CodeBlock from "@tiptap/extension-code-block";
import Code from "@tiptap/extension-code";
import Strike from "@tiptap/extension-strike";
import Blockquote from "@tiptap/extension-blockquote";
import Image from "@tiptap/extension-image";
import { ImageUploadNode } from "../tiptap-node/image-upload-node";
import { generateHTML } from "@tiptap/html";
import clsx from "clsx";
import type { JSONContent } from "@tiptap/react";
import Superscript from "@tiptap/extension-superscript";
import Subscript from "@tiptap/extension-subscript";
import { BulletList, ListItem, TaskItem, TaskList } from "@tiptap/extension-list";
import HorizontalRule from "@tiptap/extension-horizontal-rule";

export type TiptapRendererProps = {
  // TipTap JSON document (what you saved in the DB)
  document: unknown;
  // Extra classes to tweak prose sizing or colors if needed
  className?: string;
};

export default function TiptapRenderer({
  document,
  className,
}: TiptapRendererProps) {
  console.log("TiptapRenderer content:", document);
  const content =
    typeof document === "object" &&
    document !== null &&
    "content" in document
      ? (document as { content: JSONContent[] }).content
      : [];
  const html = generateHTML(
    {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: content,
        },
      ],
    },
    [
      Document,
      Paragraph,
      Heading,
      Text,
      Bold,
      Italic,
      Highlight,
      Link,
      CodeBlock,
      Code,
      Strike,
      Blockquote,
      Image,
      Superscript,
      Subscript,
      ListItem,
      BulletList,
      HorizontalRule,
      TaskItem,
      TaskList,
      ImageUploadNode,
      // other extensions …
    ]
  );

  return (
    <article
      className={clsx(
        // Tailwind Typography defaults; tweak color system as you like
        "prose prose-neutral max-w-none dark:prose-invert",
        // Nice defaults for blog readability
        "prose-headings:scroll-mt-24 prose-pre:rounded-xl prose-pre:p-4",
        "prose-img:rounded-xl prose-img:mx-auto",
        "prose-a:underline-offset-2 hover:prose-a:underline",
        className
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

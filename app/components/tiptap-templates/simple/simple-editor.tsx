"use client";

import { useEffect, useRef, useState } from "react";
import {
  EditorContent,
  EditorContext,
  useEditor,
  type Content,
} from "@tiptap/react";

// --- Tiptap Core Extensions ---
import { StarterKit } from "@tiptap/starter-kit";
import { Image } from "@tiptap/extension-image";
import { TaskItem, TaskList } from "@tiptap/extension-list";
import { TextAlign } from "@tiptap/extension-text-align";
import { Typography } from "@tiptap/extension-typography";
import { Highlight } from "@tiptap/extension-highlight";
import { Subscript } from "@tiptap/extension-subscript";
import { Superscript } from "@tiptap/extension-superscript";
import { Selection } from "@tiptap/extensions";

// --- UI Primitives ---
import { Button } from "~/components/tiptap-ui-primitive/button";
import { Spacer } from "~/components/tiptap-ui-primitive/spacer";
import {
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
} from "~/components/tiptap-ui-primitive/toolbar";

// --- Tiptap Node ---
import { ImageUploadNode } from "~/components/tiptap-node/image-upload-node/image-upload-node-extension";
import { HorizontalRule } from "~/components/tiptap-node/horizontal-rule-node/horizontal-rule-node-extension";
import "~/components/tiptap-node/blockquote-node/blockquote-node.scss";
import "~/components/tiptap-node/code-block-node/code-block-node.scss";
import "~/components/tiptap-node/horizontal-rule-node/horizontal-rule-node.scss";
import "~/components/tiptap-node/list-node/list-node.scss";
import "~/components/tiptap-node/image-node/image-node.scss";
import "~/components/tiptap-node/heading-node/heading-node.scss";
import "~/components/tiptap-node/paragraph-node/paragraph-node.scss";

// --- Tiptap UI ---
import { HeadingDropdownMenu } from "~/components/tiptap-ui/heading-dropdown-menu";
import { ImageUploadButton } from "~/components/tiptap-ui/image-upload-button";
import { ListDropdownMenu } from "~/components/tiptap-ui/list-dropdown-menu";
import { BlockquoteButton } from "~/components/tiptap-ui/blockquote-button";
import { CodeBlockButton } from "~/components/tiptap-ui/code-block-button";
import {
  ColorHighlightPopover,
  ColorHighlightPopoverContent,
  ColorHighlightPopoverButton,
} from "~/components/tiptap-ui/color-highlight-popover";
import {
  LinkPopover,
  LinkContent,
  LinkButton,
} from "~/components/tiptap-ui/link-popover";
import { MarkButton } from "~/components/tiptap-ui/mark-button";
import { TextAlignButton } from "~/components/tiptap-ui/text-align-button";
import { UndoRedoButton } from "~/components/tiptap-ui/undo-redo-button";

// --- Icons ---
import { ArrowLeftIcon } from "~/components/tiptap-icons/arrow-left-icon";
import { HighlighterIcon } from "~/components/tiptap-icons/highlighter-icon";
import { LinkIcon } from "~/components/tiptap-icons/link-icon";

// --- Hooks ---
import { useIsBreakpoint } from "~/hooks/use-is-breakpoint";
import { useWindowSize } from "~/hooks/use-window-size";
import { useCursorVisibility } from "~/hooks/use-cursor-visibility";

// --- Components ---
import { ThemeToggle } from "~/components/tiptap-templates/simple/theme-toggle";

// --- Lib ---
import { handleImageUpload, MAX_FILE_SIZE } from "~/lib/tiptap-utils";

// --- Styles ---
import "~/components/tiptap-templates/simple/simple-editor.scss";

import content from "~/components/tiptap-templates/simple/data/content.json";

const MainToolbarContent = ({
  onHighlighterClick,
  onLinkClick,
  isMobile,
}: {
  onHighlighterClick: () => void;
  onLinkClick: () => void;
  isMobile: boolean;
}) => {
  return (
    <>
      <Spacer />

      <ToolbarGroup>
        <UndoRedoButton action="undo" />
        <UndoRedoButton action="redo" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <HeadingDropdownMenu levels={[1, 2, 3, 4]} portal={isMobile} />
        <ListDropdownMenu
          types={["bulletList", "orderedList", "taskList"]}
          portal={isMobile}
        />
        <BlockquoteButton />
        <CodeBlockButton />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <MarkButton type="bold" />
        <MarkButton type="italic" />
        <MarkButton type="strike" />
        <MarkButton type="code" />
        <MarkButton type="underline" />
        {!isMobile ? (
          <ColorHighlightPopover />
        ) : (
          <ColorHighlightPopoverButton onClick={onHighlighterClick} />
        )}
        {!isMobile ? <LinkPopover /> : <LinkButton onClick={onLinkClick} />}
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <MarkButton type="superscript" />
        <MarkButton type="subscript" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <TextAlignButton align="left" />
        <TextAlignButton align="center" />
        <TextAlignButton align="right" />
        <TextAlignButton align="justify" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <ImageUploadButton text="Add" />
      </ToolbarGroup>

      <Spacer />

      {isMobile && <ToolbarSeparator />}

      <ToolbarGroup>
        <ThemeToggle />
      </ToolbarGroup>
    </>
  );
};

const MobileToolbarContent = ({
  type,
  onBack,
}: {
  type: "highlighter" | "link";
  onBack: () => void;
}) => (
  <>
    <ToolbarGroup>
      <Button data-style="ghost" onClick={onBack}>
        <ArrowLeftIcon className="tiptap-button-icon" />
        {type === "highlighter" ? (
          <HighlighterIcon className="tiptap-button-icon" />
        ) : (
          <LinkIcon className="tiptap-button-icon" />
        )}
      </Button>
    </ToolbarGroup>

    <ToolbarSeparator />

    {type === "highlighter" ? (
      <ColorHighlightPopoverContent />
    ) : (
      <LinkContent />
    )}
  </>
);

export interface Post {
  title: string;
  content: Content;
}

export interface SimpleEditorProps {
  onSave?: (post: Post) => void;
  onCancel?: () => void;
  className?: string;
}

export function SimpleEditor({
  onSave,
  onCancel,
  className,
}: SimpleEditorProps) {
  const isMobile = useIsBreakpoint();
  const { height } = useWindowSize();
  const [mobileView, setMobileView] = useState<"main" | "highlighter" | "link">(
    "main"
  );
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [title, setTitle] = useState<string>("");

  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
    editorProps: {
      attributes: {
        autocomplete: "off",
        autocorrect: "off",
        autocapitalize: "off",
        "aria-label": "Main content area, start typing to enter text.",
        class: "simple-editor",
      },
    },
    extensions: [
      StarterKit.configure({
        horizontalRule: false,
        link: {
          openOnClick: false,
          enableClickSelection: true,
        },
      }),
      HorizontalRule,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight.configure({ multicolor: true }),
      Image,
      Typography,
      Superscript,
      Subscript,
      Selection,
      ImageUploadNode.configure({
        accept: "image/*",
        maxSize: MAX_FILE_SIZE,
        limit: 3,
        upload: handleImageUpload,
        onError: (error) => console.error("Upload failed:", error),
      }),
    ],
    content,
  });

  const rect = useCursorVisibility({
    editor,
    overlayHeight: toolbarRef.current?.getBoundingClientRect().height ?? 0,
  });

  useEffect(() => {
    if (!isMobile && mobileView !== "main") {
      setMobileView("main");
    }
  }, [isMobile, mobileView]);

  return (
    <div className={className}>
      {/* Title input */}
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Enter post title..."
        className="w-full mb-4 px-4 py-2 text-2xl font-bold border border-gray-300 dark:border-gray-700 rounded-md 
             bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 
             focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {/* Action buttons */}
      <div className="flex items-center justify-end gap-3 mb-4">
        {editor && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-md font-semibold 
                 bg-gray-200 dark:bg-gray-700 
                 text-gray-700 dark:text-gray-200 
                 hover:bg-gray-300 dark:hover:bg-gray-600 
                 transition-colors"
          >
            Cancel
          </button>
        )}

        {editor && onSave && (
          <button
            type="button"
            onClick={() => onSave({ title, content: editor?.getJSON() })}
            className="px-4 py-2 rounded-md font-semibold 
                 bg-blue-600 text-white 
                 hover:bg-blue-700 
                 shadow transition-colors"
          >
            Save
          </button>
        )}
      </div>
      <div className="simple-editor-wrapper">
        <EditorContext.Provider value={{ editor }}>
          <Toolbar
            ref={toolbarRef}
            style={{
              ...(isMobile
                ? {
                    bottom: `calc(100% - ${height - rect.y}px)`,
                  }
                : {}),
            }}
          >
            {mobileView === "main" ? (
              <MainToolbarContent
                onHighlighterClick={() => setMobileView("highlighter")}
                onLinkClick={() => setMobileView("link")}
                isMobile={isMobile}
              />
            ) : (
              <MobileToolbarContent
                type={mobileView === "highlighter" ? "highlighter" : "link"}
                onBack={() => setMobileView("main")}
              />
            )}
          </Toolbar>

          <EditorContent
            editor={editor}
            role="presentation"
            className="simple-editor-content"
          />
        </EditorContext.Provider>
      </div>
    </div>
  );
}

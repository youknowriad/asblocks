import {
  BlockEditorKeyboardShortcuts,
  BlockEditorProvider,
  BlockList,
  WritingFlow,
  ObserveTyping,
} from "@wordpress/block-editor";
import {
  Popover,
  SlotFillProvider,
  DropZoneProvider,
} from "@wordpress/components";
import { useState } from "@wordpress/element";
import { EditorHeader } from "./header";
import { PostTitleEditor } from "./post-title-editor";
import { Inspector } from "./inspector";
import { Footer } from "../footer";
import "./style.css";

export function Editor({ post, encryptionKey }) {
  const [editedPost, setEditedPost] = useState(post);
  const [isInspectorOpened, setIsInspectorOpened] = useState(false);

  const getPropertyChangeHandler = (property) => (value) => {
    setEditedPost({
      ...editedPost,
      [property]: value,
    });
  };

  return (
    <SlotFillProvider>
      <DropZoneProvider>
        <BlockEditorProvider
          value={editedPost.blocks || []}
          onInput={getPropertyChangeHandler("blocks")}
          onChange={getPropertyChangeHandler("blocks")}
        >
          <div className="editor">
            <div className="editor__main">
              <div className="editor__header">
                <EditorHeader
                  encryptionKey={encryptionKey}
                  post={post}
                  editedPost={editedPost}
                  isInspectorOpened={isInspectorOpened}
                  onOpenInspector={() => setIsInspectorOpened(true)}
                />
              </div>
              <Popover.Slot name="block-toolbar" />
              <div className="editor-styles-wrapper editor__canvas">
                <PostTitleEditor
                  value={editedPost.title}
                  onChange={getPropertyChangeHandler("title")}
                />
                <BlockEditorKeyboardShortcuts />
                <WritingFlow>
                  <ObserveTyping>
                    <BlockList />
                  </ObserveTyping>
                </WritingFlow>
                <Popover.Slot />
              </div>

              <div className="editor__footer">
                <Footer post={editedPost} encryptionKey={encryptionKey} />
              </div>
            </div>
            {isInspectorOpened && (
              <div className="editor__sidebar">
                <Inspector onClose={() => setIsInspectorOpened(false)} />
              </div>
            )}
            <Popover.Slot />
          </div>
        </BlockEditorProvider>
      </DropZoneProvider>
    </SlotFillProvider>
  );
}

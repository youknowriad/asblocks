import classnames from "classnames";
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
import { Footer } from "../footer";
import { EditorHeader } from "./header";
import { PostTitleEditor } from "./post-title-editor";
import { Inspector } from "./inspector";
import { useSyncEdits } from "./sync";
import "./style.css";

export function Editor({ post, encryptionKey }) {
  const [persistedPost, setPersistedPost] = useState(post);
  const [editedPost, setEditedPost] = useState(post);
  const [isInspectorOpened, setIsInspectorOpened] = useState(false);
  const peers = useSyncEdits(editedPost, setEditedPost, encryptionKey);

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
              <div
                className={classnames("editor__header", {
                  "is-inspector-opened": isInspectorOpened,
                })}
              >
                <EditorHeader
                  encryptionKey={encryptionKey}
                  persistedPost={persistedPost}
                  editedPost={editedPost}
                  peers={peers}
                  isInspectorOpened={isInspectorOpened}
                  onOpenInspector={() => setIsInspectorOpened(true)}
                  onPersist={(newPersistedPost) => {
                    setPersistedPost(newPersistedPost);
                    setEditedPost({
                      ...editedPost,
                      _id: newPersistedPost._id,
                      status: newPersistedPost.status,
                    });
                  }}
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

              <div
                className={classnames("editor__footer", {
                  "is-inspector-opened": isInspectorOpened,
                })}
              >
                <Footer post={persistedPost} encryptionKey={encryptionKey} />
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

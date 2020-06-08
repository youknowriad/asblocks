import { Inserter } from "@wordpress/block-editor";
import { Button } from "@wordpress/components";
import { useState } from "@wordpress/element";
import { cog } from "@wordpress/icons";
import { Logo } from "../../logo";
import { useMutation } from "../../../lib/data";
import { savePost } from "../../../api/posts";
import "./style.css";
import { keyToString } from "../../../lib/crypto";

export function EditorHeader({
  post,
  editedPost,
  isInspectorOpened,
  onOpenInspector,
  encryptionKey,
}) {
  const { mutate, loading: isSaving } = useMutation(savePost);
  const [persistedPost, setPersistedPost] = useState(post);
  const isDirty = editedPost !== persistedPost;

  const triggerSave = async () => {
    await mutate(editedPost, encryptionKey);
    const stringKey = await keyToString(encryptionKey);
    setPersistedPost(editedPost);
    window.history.replaceState(
      { id: post._id },
      "Post " + post._id,
      "/write/" + post._id + "#key=" + stringKey
    );
  };

  return (
    <div className="editor__header-content">
      <div className="editor__header-left">
        <div>
          <Logo />
        </div>

        <div>
          <Inserter
            position="bottom right"
            showInserterHelpPanel
            toggleProps={{ isPrimary: true }}
          />
        </div>
      </div>
      <div className="editor__header-right">
        <div>
          <Button
            onClick={triggerSave}
            disabled={!isDirty || isSaving}
            isBusy={isSaving}
            isPrimary
          >
            Save
          </Button>
        </div>

        {!isInspectorOpened && (
          <div>
            <Button
              icon={cog}
              onClick={onOpenInspector}
              label="Open Inspector"
            />
          </div>
        )}
      </div>
    </div>
  );
}

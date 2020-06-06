import { Inserter } from "@wordpress/block-editor";
import { Button } from "@wordpress/components";
import { useState } from "@wordpress/element";
import { cog } from "@wordpress/icons";
import { Logo } from "../../logo";
import { useMutation } from "../../../lib/data";
import { savePost } from "../../../api/posts";
import "./style.css";

export function EditorHeader({
  post,
  editedPost,
  isInspectorOpened,
  onOpenInspector,
}) {
  const { mutate, loading: isSaving } = useMutation(savePost);
  const [persistedPost, setPersistedPost] = useState(post);
  const isDirty = editedPost !== persistedPost;

  const triggerSave = async () => {
    await mutate(editedPost);
    setPersistedPost(editedPost);

    window.history.replaceState(
      { id: post._id },
      "Post " + post._id,
      "/write/" + post._id
    );
  };

  return (
    <div className="editor__header-content">
      <div className="editor__header-left">
        <Logo />

        <Inserter
          position="bottom right"
          showInserterHelpPanel
          toggleProps={{ isPrimary: true }}
        />
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

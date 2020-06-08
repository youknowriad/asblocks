import { Inserter } from "@wordpress/block-editor";
import { Button } from "@wordpress/components";
import { useState } from "@wordpress/element";
import { cog } from "@wordpress/icons";
import { ShareModal } from "../share-modal";
import { Logo } from "../../logo";
import { useMutation } from "../../../lib/data";
import { savePost, sharePost } from "../../../api/posts";
import "./style.css";
import { keyToString } from "../../../lib/crypto";

export function EditorHeader({
  persistedPost,
  editedPost,
  peers,
  isInspectorOpened,
  onOpenInspector,
  encryptionKey,
  onPersist,
}) {
  const [isShareModalOpened, setIsShareModalOpened] = useState(false);
  const { mutate: mutateShare, loading: isSharing } = useMutation(sharePost);
  const { mutate: mutateSave, loading: isSaving } = useMutation(savePost);

  const isShared = persistedPost.status === "publish";
  const isDirty = editedPost !== persistedPost;

  const triggerSave = async () => {
    const { data: persisted } = await mutateSave(editedPost, encryptionKey);
    onPersist(persisted);
  };

  const triggerShare = async () => {
    const { data: persisted } = await mutateShare();
    const stringKey = await keyToString(encryptionKey);
    onPersist(persisted);
    window.history.replaceState(
      { id: persisted._id },
      "Post " + persisted._id,
      "/write/" + persisted._id + "#key=" + stringKey
    );
    setIsShareModalOpened(true);
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
        {peers.length > 1 && (
          <div className="editor__header-peers">
            <strong>{peers.length}</strong> connected peers
          </div>
        )}
        <div>
          <Button
            onClick={isShared ? triggerSave : triggerShare}
            disabled={!isDirty || isSaving || isSharing}
            isBusy={isSaving || isSharing}
            isPrimary
          >
            {isShared ? "Save" : "Share"}
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

      {isShareModalOpened && (
        <ShareModal onClose={() => setIsShareModalOpened(false)} />
      )}
    </div>
  );
}

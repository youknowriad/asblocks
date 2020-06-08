import { Modal, ClipboardButton, Button } from "@wordpress/components";
import { Icon, check, info } from "@wordpress/icons";
import { useState } from "@wordpress/element";
import "./style.css";

export function ShareModal({ onClose }) {
  const [isCopied, setIsCopied] = useState(false);
  return (
    <Modal title="Post Shared Successfully!" onRequestClose={onClose}>
      <p>
        A live collaboration session is now in progress. Share the URL of this
        page with your collaborators.
      </p>
      <div className="editor-share-modal__copy">
        <input type="text" readOnly value={location.href} />
        <ClipboardButton
          isPrimary
          text={location.href}
          onCopy={() => setIsCopied(true)}
          onFinishCopy={() => setIsCopied(false)}
        >
          {isCopied ? "Copied!" : "Copy"}
        </ClipboardButton>
      </div>

      <div className="editor-share-modal__info">
        <Icon icon={check} className="editor-share-modal__e2e-icon" />{" "}
        <p>
          AsBlocks uses{" "}
          <a href="https://en.wikipedia.org/wiki/End-to-end_encryption">
            end-to-end encryption
          </a>
          . This means that only the users accessing the post using the link
          above are able to access its content. AsBlocks's server can not
          decrypt the content of your post either.
        </p>
      </div>

      <div className="editor-share-modal__info">
        <Icon icon={info} className="editor-share-modal__info-icon" />{" "}
        <p>
          By default, the content of your post is not persisted to the server.
          This means that if all the collaborators leave the page, the unsaved
          content will be lost. You can hover persist an encrypted version to
          the server at any time by clicking the "Save" button.
        </p>
      </div>
    </Modal>
  );
}

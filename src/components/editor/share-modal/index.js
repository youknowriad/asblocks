import { Modal, ClipboardButton, Button } from "@wordpress/components";
import { Icon, check, info } from "@wordpress/icons";
import { useState } from "@wordpress/element";
import "./style.css";

export function ShareModal({ onClose, post, ownerKey, stringKey }) {
  const [isCopiedEdit, setIsCopiedEdit] = useState(false);
  const [isCopiedRead, setIsCopiedRead] = useState(false);

  const editURL = `${location.origin}/write/${post._id}/${ownerKey}#${stringKey}`;
  const readURL = `${location.origin}/read/${post._id}#${stringKey}`;

  return (
    <Modal title="Post Shared Successfully!" onRequestClose={onClose}>
      <p>
        A live collaboration session is now in progress. Share the URL of this
        page with your collaborators.
      </p>
      <div className="editor-share-modal__copy">
        <input type="text" readOnly value={editURL} />
        <ClipboardButton
          isPrimary
          text={editURL}
          onCopy={() => setIsCopiedEdit(true)}
          onFinishCopy={() => setIsCopiedEdit(false)}
        >
          {isCopiedEdit ? "Copied!" : "Copy"}
        </ClipboardButton>
      </div>

      <p>
        The following link is a read-only link where people will be able to read
        the persisted document without edit capabilities.
      </p>
      <div className="editor-share-modal__copy">
        <input type="text" readOnly value={readURL} />
        <ClipboardButton
          isPrimary
          text={readURL}
          onCopy={() => setIsCopiedRead(true)}
          onFinishCopy={() => setIsCopiedRead(false)}
        >
          {isCopiedRead ? "Copied!" : "Copy"}
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

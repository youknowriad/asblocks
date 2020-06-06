import usePromise from "react-promise-suspense";
import { pencil } from "@wordpress/icons";
import { ButtonLink } from "../button-link";
import { keyToString } from "../../lib/crypto";

export function EditButton({ post, encryptionKey }) {
  const isSaved = !!post._id;
  const stringKey = usePromise(keyToString, [encryptionKey]);
  if (!isSaved) {
    return null;
  }
  return (
    <ButtonLink
      icon={pencil}
      label="Edit Post"
      to={`/write/${post._id}#key=${stringKey}`}
    />
  );
}

import usePromise from "react-promise-suspense";
import { external } from "@wordpress/icons";
import { ButtonLink } from "../../button-link";
import { keyToString } from "../../../lib/crypto";

export function ViewButton({ post, encryptionKey }) {
  const isSaved = !!post._id;
  const stringKey = usePromise(keyToString, [encryptionKey]);
  if (!isSaved) {
    return null;
  }
  return (
    <ButtonLink
      icon={external}
      label="View Post"
      to={`/read/${post._id}#key=${stringKey}`}
    />
  );
}

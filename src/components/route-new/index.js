import usePromise from "react-promise-suspense";
import { Editor } from "../editor";
import { newPost } from "../../api/posts";
import { useSuspendedApi } from "../../lib/data";
import { generateKey } from "../../lib/crypto";

export function RouteNew() {
  const encryptionKey = usePromise(generateKey, []);
  const post = {
    status: "auto-draft",
  };

  return <Editor post={post} encryptionKey={encryptionKey} />;
}

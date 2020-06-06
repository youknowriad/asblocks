import { Editor } from "../editor";
import { newPost } from "../../api/posts";
import { useSuspendedApi } from "../../lib/data";

export function RouteNew() {
  const post = useSuspendedApi(newPost);

  return <Editor post={post} />;
}

import { useParams } from "react-router-dom";
import { Editor } from "../editor";
import { fetchPost } from "../../api/posts";
import { useSuspendedApi } from "../../lib/data";

export function RouteWrite() {
  const { id } = useParams();
  const post = useSuspendedApi(fetchPost, [id]);
  return <Editor post={post} />;
}

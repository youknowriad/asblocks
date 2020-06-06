import { useParams } from "react-router-dom";
import { fetchPost } from "../../api/posts";
import { useSuspendedApi } from "../../lib/data";
import { PostRender } from "../post-render";

export function RouteRead() {
  const { id } = useParams();
  const post = useSuspendedApi(fetchPost, [id]);
  return <PostRender post={post} />;
}

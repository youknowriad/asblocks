import usePromise from "react-promise-suspense";
import { useParams } from "react-router-dom";
import { PostRender } from "../post-render";
import { fetchPost } from "../../api/posts";
import { useSuspendedApi } from "../../lib/data";
import { stringToKey } from "../../lib/crypto";

export function RouteRead() {
  const { id } = useParams();
  const stringKey = window.location.hash.slice("#key=".length);
  const encryptionKey = usePromise(stringToKey, [stringKey]);
  const post = useSuspendedApi(fetchPost, [id, encryptionKey]);
  return <PostRender post={post} />;
}

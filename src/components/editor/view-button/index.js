import { external } from "@wordpress/icons";
import { ButtonLink } from "../../button-link";

export function ViewButton({ post }) {
  const isSaved = !!post._id;
  if (!isSaved) {
    return null;
  }
  return (
    <ButtonLink icon={external} label="View Post" to={`/read/${post._id}`} />
  );
}

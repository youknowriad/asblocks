import "./style.css";
import { ButtonLink } from "../button-link";

export function Logo() {
  return (
    <ButtonLink
      to="/"
      className="logo"
      aria-label="Start a new post"
      showTooltip
      label="Start a new post"
    >
      <span>A</span>B
    </ButtonLink>
  );
}

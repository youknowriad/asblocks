import { Button } from "@wordpress/components";
import "./style.css";

export function Logo() {
  return (
    <Button
      href="/"
      className="logo"
      aria-label="Start a new post"
      showTooltip
      label="Start a new post"
    >
      <span>A</span>B
    </Button>
  );
}

import { Button, Dropdown } from "@wordpress/components";
import "./style.css";

export function Logo() {
  return (
    <Dropdown
      renderToggle={({ onToggle, isOpen }) => (
        <Button
          className="logo"
          onClick={onToggle}
          aria-haspopup="true"
          aria-expanded={isOpen}
        >
          <span>a</span>b
        </Button>
      )}
      renderContent={() => (
        <div className="logo-dropdown">
          <div className="logo-dropdown-menu">
            <strong>AsBlocks</strong> is an{" "}
            <a href="https://en.wikipedia.org/wiki/End-to-end_encryption">
              end-to-end encrypted
            </a>{" "}
            (private) collaborative writing environment powered by{" "}
            <a href="https://github.com/WordPress/gutenberg">Gutenberg</a> and{" "}
            <a href="https://github.com/youknowriad/asblocks">
              you can contribute
            </a>
            .
          </div>

          <div className="logo-dropdown-menu">
            <Button isPrimary href="/">
              New Document
            </Button>
          </div>
        </div>
      )}
    />
  );
}

import { Button, Dropdown } from "@wordpress/components";
import { DarkModeToggle } from "../dark-mode-toggle";
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
          label="About AsBlocks"
          icon={
            <svg
              width="18"
              height="18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M7 0h4v7h7v4h-4.1716l2.9498 2.9497-2.8285 2.8285L11 13.8284V18H7v-7H0V7h4.17155L1.2218 4.05025l2.82843-2.82843L7 4.17159V0z" />
            </svg>
          }
        />
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

          <div className="logo-dropdown-menu">
            <h3>Options</h3>
            <DarkModeToggle />
          </div>
        </div>
      )}
    />
  );
}

import "@wordpress/components/build-style/style.css";
import "@wordpress/block-editor/build-style/style.css";
import "@wordpress/block-library/build-style/style.css";
import "@wordpress/block-library/build-style/theme.css";
import "@wordpress/block-library/build-style/editor.css";
import "@wordpress/format-library/build-style/style.css";

// Ideally this is imported where used in the block-library package.
import "@wordpress/notices";

import "./editor-styles.css";

import { getBlockTypes, unregisterBlockType } from "@wordpress/blocks";
import { registerCoreBlocks } from "@wordpress/block-library";
import "@wordpress/format-library";

registerCoreBlocks();

const allowedBlocks = [
  "core/paragraph",
  "core/heading",
  "core/image",
  "core/list",
  "core/quote",
  "core/cover",
  "core/audio",
  "core/video",
  "core/code",
  "core/preformatted",
  "core/html",
  "core/pullquote",
  "core/table",
  "core/verse",
  "core/buttons",
  "core/button",
  "core/columns",
  "core/column",
  "core/group",
  "core/separator",
  "core/spacer",
];

getBlockTypes().forEach(({ name }) => {
  if (!allowedBlocks.includes(name)) {
    unregisterBlockType(name);
  }
});

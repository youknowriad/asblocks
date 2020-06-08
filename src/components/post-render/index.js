import { serialize } from "@wordpress/blocks";
import { RawHTML } from "@wordpress/element";
import { Logo } from "../logo";
import { Footer } from "../footer";
import "./style.css";

export function PostRender({ post, encryptionKey }) {
  return (
    <div className="post-render">
      <div className="post-render__header">
        <Logo />
      </div>
      <div className="post-render__main editor-styles-wrapper">
        <h1>{post.title}</h1>
        <div>
          <RawHTML>{post.blocks ? serialize(post.blocks) : ""}</RawHTML>
        </div>
      </div>
      <div className="post-render__footer">
        <Footer post={post} encryptionKey={encryptionKey} isFront />
      </div>
    </div>
  );
}

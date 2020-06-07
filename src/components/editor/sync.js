import { useEffect, useRef } from "@wordpress/element";
import io from "socket.io-client";
import { v4 as uuidv4 } from "uuid";
import { encrypt, decrypt } from "../../lib/crypto";
import { config } from "../../config/index";

export function useSyncEdits(post, onChange, encryptionKey) {
  const socket = io(config.collabServer);
  const identity = useRef(uuidv4());
  const lastPersisted = useRef();

  useEffect(() => {
    if (post === lastPersisted.current) {
      return;
    }
    async function emitUpdate() {
      socket.emit(
        "server-broadcast",
        post._id,
        await encrypt(
          {
            type: "update",
            post,
            identity: identity.current,
          },
          encryptionKey
        )
      );
    }

    emitUpdate();
  }, [post]);

  useEffect(() => {
    socket.emit("join-room", post._id);
    socket.on("client-broadcast", async (msg) => {
      const action = await decrypt(msg, encryptionKey);
      if (action.identity === identity.current) {
        return;
      }
      switch (action.type) {
        case "update":
          lastPersisted.current = action.post;
          onChange(action.post);
          break;
      }
    });
  }, []);
}

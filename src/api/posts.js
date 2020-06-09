import { encrypt, decrypt } from "../lib/crypto";
import { config } from "../config/index";

function wrapFetch(fetch) {
  return {
    fetch,
  };
}

export const savePost = wrapFetch(async (post, encryptionKey, ownerKey) => {
  const { _id, status, ...data } = post;
  const encrypted = await encrypt(data, encryptionKey);
  await window
    .fetch(config.collabServer + "/api/save/" + _id + "/" + ownerKey, {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ encrypted }),
    })
    .then((response) => response.json());
  return { ...post, status: "publish" };
});

export const sharePost = wrapFetch(async (ownerKey) => {
  const persisted = await window
    .fetch(config.collabServer + "/api/share/" + ownerKey, {
      method: "POST",
    })
    .then((response) => response.json());

  return persisted;
});

export const fetchPost = wrapFetch(async (id, encryptionKey) => {
  const { encrypted, status } = await window
    .fetch(config.collabServer + "/api/read/" + id)
    .then((response) => response.json());

  return {
    _id: id,
    status,
    ...(encrypted ? await decrypt(encrypted, encryptionKey) : {}),
  };
});

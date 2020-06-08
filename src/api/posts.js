import { api } from "./index";
import { encrypt, decrypt } from "../lib/crypto";

function wrapFetch(fetch) {
  return {
    fetch,
  };
}

export const savePost = wrapFetch(async (post, encryptionKey) => {
  const db = api.firestore();
  const { _id, status, ...data } = post;
  const encrypted = await encrypt(data, encryptionKey);
  await db.collection("posts").doc(_id).set({
    encrypted,
    status: "publish",
  });
  return { ...post, status: "publish" };
});

export const sharePost = wrapFetch(async () => {
  const db = api.firestore();
  const doc = await db.collection("posts").add({
    status: "publish",
  });

  return {
    _id: doc.id,
    status: "publish",
  };
});

export const fetchPost = wrapFetch(async (id, encryptionKey) => {
  const db = api.firestore();
  const snapshot = await db.collection("posts").doc(id).get();
  const { encrypted, status } = snapshot.data();
  return {
    _id: snapshot.id,
    status,
    ...(encrypted ? await decrypt(encrypted, encryptionKey) : {}),
  };
});

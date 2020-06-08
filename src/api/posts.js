import { api } from "./index";
import { encrypt, decrypt } from "../lib/crypto";

function wrapFetch(fetch) {
  return {
    fetch,
  };
}

export const newPost = wrapFetch(async () => {
  const db = api.firestore();
  const snapshot = await db
    .collection("posts")
    .where("status", "==", "auto-draft")
    .get();

  if (!!snapshot.docs?.length) {
    return {
      _id: snapshot.docs[0].id,
      status: "auto-draft",
    };
  }

  const newPost = {
    status: "auto-draft",
  };
  const doc = await db.collection("posts").add(newPost);
  return {
    _id: doc.id,
    status: "auto-draft",
  };
});

export const savePost = wrapFetch(async (post, encryptionKey) => {
  const db = api.firestore();
  const { _id, ...data } = post;
  const encrypted = await encrypt(data, encryptionKey);
  await db.collection("posts").doc(_id).set({
    encrypted,
    status: "publish",
  });
});

export const fetchPost = wrapFetch(async (id, encryptionKey) => {
  const db = api.firestore();
  const snapshot = await db.collection("posts").doc(id).get();
  const { encrypted } = snapshot.data();
  return {
    _id: snapshot.id,
    status: "publish",
    ...(await decrypt(encrypted, encryptionKey)),
  };
});

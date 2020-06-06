import { api } from "./index";

function wrapFetch(fetch) {
  return {
    fetch,
  };
}

function normalizeDoc(doc) {
  return {
    _id: doc.id,
    ...doc.data(),
  };
}

export const newPost = wrapFetch(async () => {
  const db = api.firestore();
  const snapshot = await db
    .collection("posts")
    .where("status", "==", "auto-draft")
    .get();

  if (!!snapshot.docs?.length) {
    return normalizeDoc(snapshot.docs[0]);
  }

  const newPost = {
    status: "auto-draft",
  };
  const doc = await db.collection("posts").add(newPost);
  return {
    _id: doc.id,
    ...newPost,
  };
});

export const savePost = wrapFetch(async (post) => {
  const db = api.firestore();
  const { _id, ...data } = post;
  await db
    .collection("posts")
    .doc(_id)
    .set({
      ...data,
      status: data.status !== "auto-draft" ? data.status : "draft",
    });
});

export const deletePost = wrapFetch(async (post) => {
  const db = api.firestore();
  const { _id } = post;
  await db.collection("posts").doc(_id).delete();
});

export const fetchPost = wrapFetch(async (id) => {
  const db = api.firestore();
  const snapshot = await db.collection("posts").doc(id).get();
  return normalizeDoc(snapshot);
});

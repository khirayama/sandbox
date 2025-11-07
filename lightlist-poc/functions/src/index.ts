import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

export const deleteUserData = functions.auth
  .user()
  .onDelete(async (user: functions.auth.UserRecord) => {
    const uid = user.uid;
    const firestore = admin.firestore();
    const batch = firestore.batch();

    const userRef = firestore.collection("users").doc(uid);
    batch.delete(userRef);

    const userListsSnapshot = await firestore
      .collection("taskLists")
      .where("owner", "==", uid)
      .get();

    userListsSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
  });

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  verifyPasswordResetCode as firebaseVerifyPasswordResetCode,
  confirmPasswordReset as firebaseConfirmPasswordReset,
  deleteUser,
  ActionCodeSettings,
} from "firebase/auth";
import { doc, setDoc, writeBatch } from "firebase/firestore";

import { auth, db } from "@/lib/firebase";
import { SettingsStore, TaskListOrderStore, Language } from "@/lib/types";
import { getData } from "@/lib/store";

export async function signUp(email: string, password: string) {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password,
  );
  const uid = userCredential.user.uid;

  const settingsData: SettingsStore = {
    theme: "system",
    language: "ja",
    taskInsertPosition: "bottom",
    autoSort: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  await setDoc(doc(db, "settings", uid), settingsData);

  const taskListOrderData = {
    createdAt: Date.now(),
    updatedAt: Date.now(),
  } as TaskListOrderStore;
  await setDoc(doc(db, "taskListOrder", uid), taskListOrderData);
}

export async function signIn(email: string, password: string) {
  await signInWithEmailAndPassword(auth, email, password);
}

export async function signOut() {
  await firebaseSignOut(auth);
}

export async function sendPasswordResetEmail(
  email: string,
  language?: Language,
) {
  const data = getData();

  const resetUrl =
    process.env.NEXT_PUBLIC_PASSWORD_RESET_URL || "http://localhost:3000";
  const actionCodeSettings: ActionCodeSettings = {
    url: resetUrl,
    handleCodeInApp: false,
  };
  const languageToUse = language || data.settings?.language || "ja";
  auth.languageCode = languageToUse;
  await firebaseSendPasswordResetEmail(auth, email, actionCodeSettings);
}

export async function verifyPasswordResetCode(code: string) {
  return await firebaseVerifyPasswordResetCode(auth, code);
}

export async function confirmPasswordReset(code: string, newPassword: string) {
  await firebaseConfirmPasswordReset(auth, code, newPassword);
}

export async function deleteAccount() {
  const data = getData();

  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("No user logged in");

  const batch = writeBatch(db);
  batch.delete(doc(db, "settings", uid));
  batch.delete(doc(db, "taskListOrder", uid));

  const taskListIds = Object.keys(data.taskLists);
  taskListIds.forEach((id) => {
    batch.delete(doc(db, "taskLists", id));
  });

  await batch.commit();
  await deleteUser(auth.currentUser!);
}

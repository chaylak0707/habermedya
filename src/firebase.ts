import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import firebaseConfig from "../firebase-applet-config.json";

const app = initializeApp(firebaseConfig);
export const storage = getStorage(app, `gs://${firebaseConfig.storageBucket}`);

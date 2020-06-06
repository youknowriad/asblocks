import { config } from "../config";
import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/analytics";

export const api = firebase.initializeApp(config.firebase);
api.analytics();

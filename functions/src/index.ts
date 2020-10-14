require("dotenv").config();
import { initializeApp } from "firebase-admin";

initializeApp();


/** USER **/
export * from "./users";

/** STUDENTS **/
export * from "./students";

/** TEACHERS **/
export * from "./teachers";

/** BOOKING **/
export * from "./booking";

/** SESSIONS **/
export * from "./sessions";

/** MESSAGING **/
export * from "./messages";

/** NOTIFICATION **/
export * from "./notifications";

/** REVIEWS/FEEDBACK **/
export * from "./reviews";

/** PAYMENTS **/
export * from "./payments";

/** EPICBOARD **/
export * from "./epicboard";

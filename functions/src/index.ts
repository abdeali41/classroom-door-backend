import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

const serviceAccount = require("../classroom-door-firebase-adminsdk-6perx-dbae20c4c1.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://classroom-door.firebaseio.com"
});
const firestoreDB = admin.firestore();
const userCollection = firestoreDB.collection("users");
const teacherCollection = firestoreDB.collection("teachers");
// const studentCollection = firestoreDB.collection("students");

export const teachers = functions.https.onRequest(
  (request: any, response: any) => {
    getTeachers()
      .then(res => {
        response.status(200).json({ data: res });
      })
      .catch(err => console.log("Found Error:::", err));
  }
);

const getTeachers = async () => {
  const teacherPreferencesSnapshot = await teacherCollection.get();

  const allTeachersData = teacherPreferencesSnapshot.docs.map(teacherDoc => {
    const teacherDetails = teacherDoc.data();
    const userID = teacherDetails.userId;
    console.log("User:::", teacherDetails);
    return userCollection.doc(userID).get();
  });

  return Promise.all(allTeachersData).then(data => {
    const teacherDetails = data.map(item => item.data());
    console.log("All Teacher Data:::", teacherDetails);
    return teacherDetails;
  });
};

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { getTeacherDataWithFilters } from "./teachers";

const serviceAccount = require("../classroom-door-firebase-adminsdk-6perx-dbae20c4c1.json");
// Init Block 
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://classroom-door.firebaseio.com"
});
// import { } from './subjects';
import { getAllUsers, getUsersById, getRoomMembers } from "./users";
import * as Students from "./students";
import {
  updateTeacherPreference,
  updateUserProfileDetails,
  updateStudentPreferences,
  removeAllRoomFromFirestore
}
  from "./update-user-data";
export const firestoreDB = admin.firestore();
export const userCollection = firestoreDB.collection("users");
export const teacherCollection = firestoreDB.collection("teachers");
export const studentCollection = firestoreDB.collection("students");
export const userMetaDataCollection = firestoreDB.collectionGroup("userMeta");

// Get Users
export const users = functions.https.onCall(
  (request: { userIds?: string[] }) => {
    console.log("User endpoint Request::", request);
    const { userIds } = request;
    // check if request is for some userIds
    if (userIds && userIds.length > 0) {
      return getUsersById(userIds)
        .then(res => res)
        .catch(err => new Error(err));
    }

    return getAllUsers()
      .then(res => res)
      .catch(err => new Error(err));
  }
);

// Get Teachers
export const teachers = functions.https.onCall((request: any) => {
  console.log("Request Parameters::::", JSON.stringify(request));
  return getTeacherDataWithFilters(request.filters)
    .then(res => {
      console.log("Teachers Data :::", res);
      return res;
    })
    .catch(err => {
      console.log("Found Error:::", err);
      return new Error(err);
    });
});

export const getTeachersAPI = functions.https.onRequest(
  async (request: any, response: any) => {
    getTeacherDataWithFilters(request.body.filters)
      .then(res => {
        console.log("Data Final::", res);
        response.status(200).json({
          data: res,
          message: "Query Success"
        });
      })
      .catch(err => console.log("query Failed: ", err));
  }
);

// Get Students
export const students = functions.https.onRequest((request: any, response: any) => {
  return Students.getAllStudents()
    .then(res => {
      console.log("All Student Data::", res);
      response.status(200).json({
        data: res,
        message: "Student Data Query Success"
      });
    })
    .catch(err => new Error(err));
});


// Update API Calls
// User Details
export const fixTeacherPreferences = functions.https.onRequest(
  (request: any, response: any) => {
    updateTeacherPreference()
      .then(res => {
        response.status(200).json({
          data: res,
          message: "Updated Teacher List Success"
        });
      })
      .catch(err =>
        console.log("Found Error on updating Teacher  List: ", err)
      );
  }
);

export const updateUserData = functions.https.onRequest(
  (request: any, response: any) => {
    updateUserProfileDetails()
      .then(res => {
        response.status(200).json({
          data: res,
          message: "Updated user Data List Success"
        });
      })
      .catch(err =>
        console.log("Found Error on updating user Data List: ", err)
      );
  }
);

// FOR CHANGING MARK AS FAVORITE STATUS
export const toggleMarkAsFavourite = Students.toggleMarkAsFavorite;
export const fixStudentPreferences = functions.https.onRequest(
  (request: any, response: any) => {
    updateStudentPreferences()
      .then(res => {
        response.status(200).json({
          data: res,
          message: "Updated Student List Success"
        });
      })
      .catch(err =>
        console.log("Found Error on updating Student  List: ", err)
      );
  }
);


// TO GET ALL USERS THAT BELONGS TO A PARTICULAR ROOM AND ALSO RETURN REMAINING USERS
export const roomMembers = getRoomMembers;

export const deleteAllRooms = functions.https.onRequest((request: any, response: any) => {
  removeAllRoomFromFirestore().then(res => {
    response.status(200).json({
      data: res,
      message: "Removing Rooms success"
    });
  })
    .catch(err =>
      console.log("Found Error onRemoving Rooms:: ", err)
    );
})




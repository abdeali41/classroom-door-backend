import * as functions from "firebase-functions"
import { firestoreCollectionKeys } from "../db/enum"
import { userMetaCollection } from "../db"

/** USER TRIGGERS **/

// New User Creation Trigger
export const newUserCreationTrigger = functions.firestore
    .document(`${firestoreCollectionKeys.USERS}/{userId}`)
    .onCreate((snapshot, _) => {
        userMetaCollection
            .doc(snapshot.id)
            .set({
                avgRating: "0",
                chats: [],
                favorites: [],
                minutesTutoring: 0,
                reviews: [],
                sessionsCompleted: 0,
                totalRatingsPosted: 0,
                totalStars: 0,
                userId: snapshot.id,
            })
            .catch((err) => {
                console.log("Error Creating User-Meta Document for: ", snapshot.id)
                console.log("Error Details: ", err)
            })
    })

import { userCollection, firestoreDB, studentCollection } from "..";
import { defaultAvailable, educationData, weekDay, daySlotTypes } from "../libs/constants";


export const updateUserProfileDetails = async () => {
    let batch = firestoreDB.batch();
    const querySnapshot = await userCollection.get();
    querySnapshot.forEach(doc => {
        const data = doc.data();
        let newGenderValue: string = data.gender ? data.gender.toUpperCase() : "FEMALE"
        console.log(`User Gender ::: ${data.id} -- ${data.gender}, ${data.gender.toUpperCase()}, ${newGenderValue}`)


        batch.set(firestoreDB.collection("usersCopy").doc(doc.id), {
            ...data,
            gender: newGenderValue
        });
    })
    return batch.commit();
}

export const updateTeacherPreference = async () => {
    let batch = firestoreDB.batch();
    const querySnapshot = await firestoreDB.collection("teachers").get();
    querySnapshot.forEach(doc => {
        const data = doc.data();
        const {
            teacherCounsellingSubjects = [],
            teacherTutoringSubjects = [],
            teacherTutoringStandardizedTests = [],
            freeCancellationBeforeHours,
            chargesAfterFreeCancellationHours,
            advanceScheduledSessionHours,
            freeCancellationOfAdvanceScheduledSessionHours,
            chargesAfterFreeAdvanceScheduledSessionCancellationHours,
            groupSessionRate,
            teacherEducationQualification,
            oneToOneSessionRate,
            teacherWeeklyAvailability = defaultAvailable,
            teacherCertificateDetails,
            ...otherData
        } = data;
        const subjects = [
            ...teacherTutoringSubjects,
            ...teacherCounsellingSubjects,
            ...teacherTutoringStandardizedTests
        ].map((item: any) => item.id);

        const selectedEDU = educationData.filter(item => item.name === teacherEducationQualification)
        const newTeacherEducationQualification = selectedEDU.length > 0 ? selectedEDU[0] : {};
        const newTeacherWeeklyAvailability = Object.keys(weekDay).reduce((weeklyAvailability: any, key) => {
            weeklyAvailability[weekDay[key]] = teacherWeeklyAvailability[key] ? teacherWeeklyAvailability[key].map((item: string) => daySlotTypes[item]) : []
            return weeklyAvailability
        }, {})
        console.log("teacherCertificateDetails::", doc.id, teacherCertificateDetails)


        // const { issuingOrganisation = "", ...otherTeacherCertificateDetails } = teacherCertificateDetails;
        const newTeacherCertificateDetails =
        {
            issuingOrganization: '',
            expirationDate: '',
            credentialUrl: '',
            certificationName: '',
            credentialId: '',
            issueDate: ''
        }

        const newData = {
            ...otherData,
            subjects: subjects,
            teacherBiography:
                "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",

            freeCancellationBeforeHours: Number(freeCancellationBeforeHours),
            chargesAfterFreeCancellationHours: Number(
                chargesAfterFreeCancellationHours
            ),
            advanceScheduledSessionHours: Number(advanceScheduledSessionHours),
            freeCancellationOfAdvanceScheduledSessionHours: Number(
                freeCancellationOfAdvanceScheduledSessionHours
            ),
            chargesAfterFreeAdvanceScheduledSessionCancellationHours: Number(
                chargesAfterFreeAdvanceScheduledSessionCancellationHours
            ),
            groupSessionRate: Number(groupSessionRate),
            oneToOneSessionRate: Number(oneToOneSessionRate > 10 ? oneToOneSessionRate : 10),
            teacherEducationQualification: newTeacherEducationQualification,
            userMeta: {
                favorites: [],    // id array of userIds
                hoursTutoring: 0,
                ratings: {
                    average: 0,     // initially zero 
                    reviews: [],    // id array of Reviews from other collections.
                },
                sessionsCompleted: 0,
            },
            teacherWeeklyAvailability: newTeacherWeeklyAvailability,
            teacherCertificateDetails: newTeacherCertificateDetails,
        };

        batch.set(firestoreDB.collection("teachers").doc(doc.id), newData);
    });
    return batch.commit();
};

export const updateStudentPreferences = async () => {
    let batch = firestoreDB.batch();
    const querySnapshot = await studentCollection.get();
    querySnapshot.forEach(doc => {
        const data = doc.data();

        const newData = {
            ...data,
            userMeta: {
                favorites: [],    // id array of userIds
                ratings: {
                    average: 0,     // initially zero 
                    reviews: [],    // id array of Reviews from other collections.
                },
                sessionsCompleted: 0,
            },
        };

        batch.set(firestoreDB.collection("students").doc(doc.id), newData);
    });
    return batch.commit();
}


export const removeAllRoomFromFirestore = async () => {
    // let batch = firestoreDB.batch();
    const querySnapshot = await userCollection.get();
    // const data = querySnapshot.docs.map((docItem: any) => {
    //     console.log(`Data :::docItem)
    //     return userCollection.doc(docItem.userId).collection('rooms').get()
    //         .then(subCollection => {
    //             if (subCollection.docs.length > 0) {
    //                 console.log(`Document Id :: ${docItem.userId} ::: ${subCollection.docs.length}`)
    //             }
    //         })
    // })
    // return data;



    const getUsersRef = () => userCollection;
    const getUserRef = (userId: string) => getUsersRef().doc(userId);
    const getUserRoomsRef = (userId: string) => getUserRef(userId).collection('rooms');

    querySnapshot.docs.map(async (docItem: any) => {
        console.log(`Data ::: ${docItem}`)
        const userRoomsQuery = await getUserRoomsRef(docItem.userId)
            // .orderBy('createdAt', 'desc')
            .get();
        const userRoomIds: any[] = [];
        const userRoomsMap: any = {};

        userRoomsQuery.docs.forEach(doc => {
            const data = doc.data();
            userRoomsMap[doc.id] = data;
            userRoomIds.push(doc.id);
        });
        console.log(`USer:: ${docItem.userId} :: rooms:: ${userRoomIds} `)
        return { user: docItem.userId, roomsIds: userRoomIds, rooms: userRoomsMap }

    })
    return {}
}


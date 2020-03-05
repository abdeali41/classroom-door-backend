import { userCollection, firestoreDB } from "..";
import { defaultAvailable, educationData, weekDay, daySlotTypes } from "../constants";


export const updateUserProfileDetails = async () => {
    let batch = firestoreDB.batch();
    const querySnapshot = await userCollection.get();
    querySnapshot.forEach(doc => {
        const data = doc.data();
        batch.set(firestoreDB.collection("usersCopy").doc(doc.id), {
            ...data,
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

        const { issuingOrganisation, ...otherTeacherCertificateDetails } = teacherCertificateDetails;
        const newTeacherCertificateDetails = { ...otherTeacherCertificateDetails, issuingOrganization: issuingOrganisation }

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
            oneToOneSessionRate: Number(oneToOneSessionRate),
            gender: "FEMALE",
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

        batch.set(firestoreDB.collection("teachersCopy").doc(doc.id), newData);
    });
    return batch.commit();
};



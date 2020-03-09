import { studentCollection, userCollection } from "..";

export const getAllStudents = async () => {
    const studentPreferencesSnapshot = await studentCollection.get();

    const allStudentsData = studentPreferencesSnapshot.docs.map(studentDoc => {
        const studentDetails = studentDoc.data();
        const userID = studentDetails.userId;
        return userCollection
            .doc(userID)
            .get()
            .then(data => ({ ...studentDetails, ...data.data() }));
    });
    return Promise.all(allStudentsData);
};
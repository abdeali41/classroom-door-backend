import { defaultAvailable, educationData, weekDay, daySlotTypes } from "../libs/constants"
import {
    teacherCollection,
    userCollection,
    userMetaCollection,
    // reviewsCollection,
    firestoreDB,
} from "../db"

export const getTeacherById = async (teacherId: string): Promise<any> => {
    const teacherDataSnap = await userCollection.doc(teacherId).get()
    const teacherMetaDataSnap = await userMetaCollection.doc(teacherId).get()
    const teacherDetailsDataSnap = await teacherCollection.where("userId", "==", teacherId).get()

    const teacher = {
        ...teacherDataSnap.data(),
        ...teacherMetaDataSnap.data(),
        ...teacherDetailsDataSnap.docs[0].data(),
    }

    return teacher
}

export const getTeacherDataWithFilters = async (filters: any): Promise<any> => {
    let queryRef: FirebaseFirestore.Query = teacherCollection

    if (!filters) {
        const teacherPreferencesSnapshot = await teacherCollection.get()
        const allTeachersData = teacherPreferencesSnapshot.docs.map(async (teacherDoc) => {
            const teacherDetails = teacherDoc.data()
            const userID = teacherDetails.userId
            const userSnapshot = await userCollection.doc(userID).get()
            const userMetaSnapshot = await userMetaCollection.doc(userID).get()
            return {
                ...teacherDetails,
                ...userSnapshot.data(),
                ...userMetaSnapshot.data(),
            }
        })
        const allTeachers = await Promise.all(allTeachersData)

        return { teachers: allTeachers }
    }
    const {teacherType, subjects, hourlyRate, education} = filters

    if(teacherType && teacherType !== "TUTORING_AND_ADVISING"){
        queryRef = queryRef.where("teacherType", "==", teacherType)
    }

    if( subjects.length > 0){
        queryRef = queryRef.where("subjects", "array-contains-any", subjects)
    }

    if(hourlyRate && (hourlyRate.min > 0 || hourlyRate.max <500)){
        queryRef = queryRef.where("oneToOneSessionRate", ">=", hourlyRate.min).where("oneToOneSessionRate", "<=", hourlyRate.max)
    }

    if (education && education!== 10) {
        queryRef = queryRef.where("teacherEducationQualification.value", "==", education)
    }

    // const {
    // 	sortByType = SortTypes.ratings,
    // 	sortDirectionAscending = true,
    // } = filters;

    // switch (sortByType) {
    // 	case SortTypes.ratings:
    // 		queryRef = queryRef.orderBy(
    // 			"userMeta.ratings",
    // 			sortDirectionAscending ? "asc" : "desc"
    // 		);
    // 		break;
    // 	case SortTypes.bestMatch:
    // 	// break;
    // 	case SortTypes.hoursTutoring:
    // 		queryRef = queryRef.orderBy(
    // 			"userMeta.hoursTutoring",
    // 			sortDirectionAscending ? "asc" : "desc"
    // 		);
    // 		break;

    // 	case sortByType.myFavorite:
    // 	// break;

    // 	default:
    // 		queryRef = queryRef.orderBy(
    // 			"userMeta.ratings",
    // 			sortDirectionAscending ? "asc" : "desc"
    // 		);
    // }
    
    const filteredTeachers = await queryRef.get().then((teachersDataSnapShot) => {
        if (filters.myFavoritesOnly){
            return teachersDataSnapShot.docs.filter((teacherData) => filters.favorites.includes(teacherData.id)).map( async (snapshot) => {
                const userID = snapshot.id
                const userSnapshot = await userCollection.doc(userID).get()
                const userMetaSnapShot = await userMetaCollection.doc(userID).get()
                return {
                ...snapshot.data(),
                ...userSnapshot.data(),
                ...userMetaSnapShot.data(),
                }
            })
        }
        return teachersDataSnapShot.docs.map( async (snapshot) => {
            const userID = snapshot.id
            const userMetaSnapShot = await userMetaCollection.doc(userID).get()
            const userSnapshot = await userCollection.doc(userID).get()
            return {
                ...snapshot.data(),
                ...userSnapshot.data(),
                ...userMetaSnapShot.data(),
            }
        })
    })
    const teachers = await Promise.all(filteredTeachers)
    return { teachers }
}

export const updateTeacherPreference = async () => {
    const batch = firestoreDB.batch()
    const querySnapshot = await teacherCollection.get()
    querySnapshot.forEach((doc) => {
        const data = doc.data()
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
        } = data
        const subjects = [
            ...teacherTutoringSubjects,
            ...teacherCounsellingSubjects,
            ...teacherTutoringStandardizedTests,
        ].map((item: any) => item.id)

        const selectedEDU = educationData.filter(
            (item) => item.name === teacherEducationQualification,
        )
        const newTeacherEducationQualification = selectedEDU.length > 0 ? selectedEDU[0] : {}
        const newTeacherWeeklyAvailability = Object.keys(weekDay).reduce(
            (weeklyAvailability: any, key) => {
                weeklyAvailability[weekDay[key]] = teacherWeeklyAvailability[key]
                    ? teacherWeeklyAvailability[key].map((item: string) => daySlotTypes[item])
                    : []
                return weeklyAvailability
            },
            {},
        )

        const newTeacherCertificateDetails = {
            issuingOrganization: "",
            expirationDate: "",
            credentialUrl: "",
            certificationName: "",
            credentialId: "",
            issueDate: "",
        }

        const newData = {
            ...otherData,
            subjects: subjects,
            teacherBiography:
                "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",

            freeCancellationBeforeHours: Number(freeCancellationBeforeHours),
            chargesAfterFreeCancellationHours: Number(chargesAfterFreeCancellationHours),
            advanceScheduledSessionHours: Number(advanceScheduledSessionHours),
            freeCancellationOfAdvanceScheduledSessionHours: Number(
                freeCancellationOfAdvanceScheduledSessionHours,
            ),
            chargesAfterFreeAdvanceScheduledSessionCancellationHours: Number(
                chargesAfterFreeAdvanceScheduledSessionCancellationHours,
            ),
            groupSessionRate: Number(groupSessionRate),
            oneToOneSessionRate: Number(oneToOneSessionRate > 10 ? oneToOneSessionRate : 10),
            teacherEducationQualification: newTeacherEducationQualification,
            userMeta: {
                favorites: [], // id array of userIds
                hoursTutoring: 0,
                ratings: {
                    average: 0, // initially zero
                    reviews: [], // id array of Reviews from other collections.
                },
                sessionsCompleted: 0,
            },
            teacherWeeklyAvailability: newTeacherWeeklyAvailability,
            teacherCertificateDetails: newTeacherCertificateDetails,
        }

        batch.set(teacherCollection.doc(doc.id), newData)
    })
    const result = batch.commit()

    return result
}

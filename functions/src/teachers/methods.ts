import {
	defaultAvailable,
	educationData,
	weekDay,
	daySlotTypes,
} from "../libs/constants";
import {
	teacherCollection,
	userCollection,
	userMetaCollection,
	reviewsCollection,
	firestoreDB,
} from "../db";

export const getTeacherById = async (teacherId: string): Promise<any> => {
	const teacherDataSnap = await userCollection.doc(teacherId).get();
	const teacherMetaDataSnap = await userMetaCollection.doc(teacherId).get();
	const teacherDetailsDataSnap = await teacherCollection
		.where("userId", "==", teacherId)
		.get();

	const teacher = {
		...teacherDataSnap.data(),
		...teacherMetaDataSnap.data(),
		...teacherDetailsDataSnap.docs[0].data(),
	};

	return teacher;
};

export const getTeacherDataWithFilters = async (filters: any): Promise<any> => {
	const queryRef: FirebaseFirestore.Query = teacherCollection;

	if (!filters) {
		const teacherPreferencesSnapshot = await teacherCollection.get();
		const allTeachersData = teacherPreferencesSnapshot.docs.map(
			async (teacherDoc) => {
				const teacherDetails = teacherDoc.data();
				const userID = teacherDetails.userId;
				const userSnapshot = await userCollection.doc(userID).get();

				const reviewSnapshot = await reviewsCollection
					.where("addresseeId", "==", userID)
					.get();

				const reviews = reviewSnapshot.docs.map((r) => ({
					...r.data(),
					reviewId: r.id,
				}));

				return { ...teacherDetails, ...userSnapshot.data(), reviews };
			}
		);
		const allTeachers = await Promise.all(allTeachersData);

		return { teachers: allTeachers };
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
	const filterFunction = (item: any) => {
		const {
			teacherType = "All",
			subjects = [],
			hourlyRate,
			gender,
			availability,
			selectAllAvailability,
			education,
		} = filters;

		const {
			teacherEducationQualification,
			teacherWeeklyAvailability,
			oneToOneSessionRate,
			gender: userGender,
			subjects: userSubjects = [],
			teacherType: itemTeacherType,
		} = item;
		let teacherTypeFilterResult = true;
		let subjectFilterResult = true;
		let genderFilterResult = true;

		let educationFilterResult = true;
		let availabilityFilterResult = true;
		let hourlyRateFilterResult = true;

		// Filter Teacher Type
		if (teacherType && teacherType !== "All") {
			teacherTypeFilterResult = itemTeacherType === teacherType;
		}

		// Filter Subjects
		if (subjects.length > 0) {
			subjectFilterResult = userSubjects.some((subItem: any) =>
				subjects.includes(subItem)
			);
		}

		// Filter Gender
		if (gender && gender.toUpperCase() !== "ALL") {
			genderFilterResult = userGender === gender;
		}

		if (education) {
			educationFilterResult =
				teacherEducationQualification.value <= education.value;
		}

		// if (availability && availability !== defaultAvailable && !selectAllAvailability) {
		//   let isAvailable = false;
		//   let weekDayIndex = 0
		//   console.log("availability", !isAvailable && weekDayIndex < 7, !isAvailable, weekDayIndex < 7)
		//   while (!isAvailable && weekDayIndex < 7) {
		//     const dayAvailability = teacherWeeklyAvailability[weekDayIndex].some((weekItem: string) => availability[weekDayIndex] ? availability[weekDayIndex].includes(weekItem) : false)
		//     if (dayAvailability) {
		//       console.log("User Availble :::", dayAvailability, teacherWeeklyAvailability[weekDayIndex], availability[weekDayIndex])
		//       isAvailable = true;
		//     }
		//     weekDayIndex = weekDayIndex + 1;
		//   }
		//   availabilityFilterResult = isAvailable
		// }

		if (
			availability &&
			availability !== defaultAvailable &&
			!selectAllAvailability
		) {
			availabilityFilterResult = Object.keys(availability).reduce(
				(result, newKey, weekDayIndex) => {
					if (
						teacherWeeklyAvailability[weekDayIndex].length !== 0 &&
						availability[weekDayIndex].length !== 0
					) {
						return teacherWeeklyAvailability[
							weekDayIndex
						].some((weekItem: string) =>
							availability[weekDayIndex].includes(weekItem)
						);
					}
					return true;
				},
				true
			);
		}

		if (hourlyRate) {
			// check
			const { min, max } = hourlyRate;
			hourlyRateFilterResult =
				oneToOneSessionRate >= min && oneToOneSessionRate <= max;
		}
		return (
			educationFilterResult &&
			availabilityFilterResult &&
			hourlyRateFilterResult &&
			teacherTypeFilterResult &&
			subjectFilterResult &&
			genderFilterResult
		);
	};

	const allData = await queryRef.get().then((teacherDataSnapshot) => {
		const data = teacherDataSnapshot.docs.filter((item) =>
			filterFunction(item.data())
		);
		return data;
	});

	const newData = allData.map(async (teacherDoc, index) => {
		const teacherDetails = teacherDoc.data();
		const userID = teacherDetails.userId;
		const userSnapshot = await userCollection.doc(userID).get();
		const reviewSnapshot = await reviewsCollection
			.where("addresseeId", "==", userID)
			.get();

		const reviews = reviewSnapshot.docs.map((r) => ({
			...r.data(),
			reviewId: r.id,
		}));

		return {
			...teacherDetails,
			...userSnapshot.data(),
			reviews,
		};
	});

	const teachers = await Promise.all(newData);

	return { teachers };
};

export const updateTeacherPreference = async () => {
	const batch = firestoreDB.batch();
	const querySnapshot = await teacherCollection.get();
	querySnapshot.forEach((doc) => {
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
			...teacherTutoringStandardizedTests,
		].map((item: any) => item.id);

		const selectedEDU = educationData.filter(
			(item) => item.name === teacherEducationQualification
		);
		const newTeacherEducationQualification =
			selectedEDU.length > 0 ? selectedEDU[0] : {};
		const newTeacherWeeklyAvailability = Object.keys(weekDay).reduce(
			(weeklyAvailability: any, key) => {
				weeklyAvailability[weekDay[key]] = teacherWeeklyAvailability[key]
					? teacherWeeklyAvailability[key].map(
							(item: string) => daySlotTypes[item]
					  )
					: [];
				return weeklyAvailability;
			},
			{}
		);

		// const { issuingOrganisation = "", ...otherTeacherCertificateDetails } = teacherCertificateDetails;
		const newTeacherCertificateDetails = {
			issuingOrganization: "",
			expirationDate: "",
			credentialUrl: "",
			certificationName: "",
			credentialId: "",
			issueDate: "",
		};

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
			oneToOneSessionRate: Number(
				oneToOneSessionRate > 10 ? oneToOneSessionRate : 10
			),
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
		};

		batch.set(teacherCollection.doc(doc.id), newData);
	});
	const result = batch.commit();

	return result;
};

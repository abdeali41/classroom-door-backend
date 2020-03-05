import { teacherCollection, userCollection } from "..";
import { SortTypes, defaultAvailable } from "../constants";


teacherCollection


export const getTeacherDataWithFilters = async (filters: any) => {
    let queryRef: FirebaseFirestore.Query = teacherCollection;
    console.log("FilterData = ", filters);
    if (!filters) {
        const teacherPreferencesSnapshot = await teacherCollection.get();
        const allTeachersData = teacherPreferencesSnapshot.docs.map(teacherDoc => {
            const teacherDetails = teacherDoc.data();
            const userID = teacherDetails.userId;
            return userCollection
                .doc(userID)
                .get()
                .then(data => ({ ...teacherDetails, ...data.data() }));
        });
        return Promise.all(allTeachersData);
    }
    const {
        sortByType = SortTypes.ratings,
        sortDirectionAscending = true
    } = filters;

    switch (sortByType) {
        case SortTypes.ratings:
            queryRef = queryRef.orderBy(
                "userMeta.ratings",
                sortDirectionAscending ? 'asc' : 'desc'
            );
            break;
        case SortTypes.bestMatch:
        // break;
        case SortTypes.hoursTutoring:
            queryRef = queryRef.orderBy(
                "userMeta.hoursTutoring",
                sortDirectionAscending ? "asc" : "desc"
            );
            break;

        case sortByType.myFavorite:
        // break;

        default:
            queryRef = queryRef.orderBy(
                "userMeta.ratings",
                sortDirectionAscending ? "asc" : "desc"
            );
    }
    const filterFunction = (item: any) => {
        const {
            teacherType = "All",
            subjects = [],
            hourlyRate,
            gender,
            availability,
            selectAllAvailability,
            education
        } = filters;

        const {
            teacherEducationQualification,
            teacherWeeklyAvailability,
            oneToOneSessionRate,
            gender: userGender,
            subjects: userSubjects = [],
            teacherType: itemTeacherType
        } = item;
        let teacherTypeFilterResult = true;
        let subjectFilterResult = true;
        let genderFilterResult = true;

        let educationFilterResult = true;
        let availabilityFilterResult = true;
        let hourlyRateFilterResult = true;

        // Filter Teacher Type
        if (teacherType && teacherType != "All") {
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
        console.log(
            "Final Combine ::",
            educationFilterResult &&
            availabilityFilterResult &&
            hourlyRateFilterResult &&
            teacherTypeFilterResult &&
            subjectFilterResult &&
            genderFilterResult,
            educationFilterResult,
            availabilityFilterResult,
            hourlyRateFilterResult,
            teacherTypeFilterResult,
            subjectFilterResult,
            genderFilterResult
        );
        return (
            educationFilterResult &&
            availabilityFilterResult &&
            hourlyRateFilterResult &&
            teacherTypeFilterResult &&
            subjectFilterResult &&
            genderFilterResult
        );
    };

    const allData = await queryRef.get().then(teacherDataSnapshot => {
        const data = teacherDataSnapshot.docs.filter(item =>
            filterFunction(item.data())
        );
        console.log("FilterFunction:::", data.length, data);
        return data;
    });
    const newData = allData.map((teacherDoc, index) => {
        const teacherDetails = teacherDoc.data();
        const userID = teacherDetails.userId;
        return userCollection
            .doc(userID)
            .get()
            .then(data => ({ ...teacherDetails, ...data.data() }));
    });
    return Promise.all(newData);
};

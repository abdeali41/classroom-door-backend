import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

const serviceAccount = require("../classroom-door-firebase-adminsdk-6perx-dbae20c4c1.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://classroom-door.firebaseio.com"
});
const firestoreDB = admin.firestore();
const userCollection = firestoreDB.collection("users");
const teacherCollection = firestoreDB.collection("teachersCopy");
const studentCollection = firestoreDB.collection("students");
// const userMetaDataCollection = firestoreDB.collection('userMeta');
// const metaCollection = firestoreDB.collectionGroup('userMeta');
export const teachers = functions.https.onCall((request: any) => {
  console.log("Request Parameters::::", JSON.stringify(request));
  return getTeacherDataWithFilters(request.filters)
    .then(res => {
      console.log("Teachers Data :::", res)
      return res;
    })
    .catch(err => {
      console.log("Found Error:::", err)
      return new Error(err)
    });
});

export const getTeachersAPI = functions.https.onRequest(
  async (request: any, response: any) => {
    getTeacherDataWithFilters(request.body.filters).then(res => {
      console.log("Data Final::", res)
      response.status(200).json({
        data: res,
        message: "Query Success"
      });
    })
      .catch(err => console.log("query Failed: ", err));
  }
);

export const students = functions.https.onRequest(
  (request: any, response: any) => {
    getStudents()
      .then(res => {
        response.status(200).json({ data: res });
      })
      .catch(err => console.log("Found Error:::", err));
  }
);

//Methods

const defaultAvailable = { "0": [], "1": [], "2": [], "3": [], "4": [], "5": [], "6": [], };
const SortTypes = {
  ratings: "RATING",
  bestMatch: "BEST_MATCH",
  hoursTutoring: "HOURS_TUTORING",
  myFavorite: "MY_FAVORITES"
}

const getTeacherDataWithFilters = async (filters: any) => {
  let queryRef: FirebaseFirestore.Query = teacherCollection;
  console.log("FilterData = ", filters)
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
      queryRef = queryRef.orderBy("userMeta.ratings", sortDirectionAscending ? 'asc' : 'desc');
      break;
    case SortTypes.bestMatch:
    // break;
    case SortTypes.hoursTutoring:
      queryRef = queryRef.orderBy("userMeta.hoursTutoring", sortDirectionAscending ? 'asc' : 'desc');
      break;

    case sortByType.myFavorite:
    // break;

    default:
      queryRef = queryRef.orderBy("userMeta.ratings", sortDirectionAscending ? 'asc' : 'desc');
  }
  const filterFunction = (item: any) => {
    const {
      teacherType = 'All',
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
      teacherType: itemTeacherType
    } = item;
    let teacherTypeFilterResult = true
    let subjectFilterResult = true;
    let genderFilterResult = true;

    let educationFilterResult = true;
    let availabilityFilterResult = true;
    let hourlyRateFilterResult = true;

    // Filter Teacher Type
    if (teacherType && teacherType != 'All') {
      teacherTypeFilterResult = itemTeacherType === teacherType;
    }

    // Filter Subjects
    if (subjects.length > 0) {
      subjectFilterResult = userSubjects.some((subItem: any) => subjects.includes(subItem))
    }

    // Filter Gender 
    if (gender && gender.toUpperCase() !== 'ALL') {
      genderFilterResult = userGender === gender
    }

    if (education) {
      educationFilterResult = teacherEducationQualification.value <= education.value
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


    if (availability && availability !== defaultAvailable && !selectAllAvailability) {
      availabilityFilterResult = Object.keys(availability).reduce((result, newKey, weekDayIndex) => {
        if (teacherWeeklyAvailability[weekDayIndex].length !== 0 && availability[weekDayIndex].length !== 0) {
          return teacherWeeklyAvailability[weekDayIndex].some((weekItem: string) => availability[weekDayIndex].includes(weekItem))
        }
        return true;
      }, true)
    }


    if (hourlyRate) { // check 
      const { min, max } = hourlyRate;
      hourlyRateFilterResult = oneToOneSessionRate >= min && oneToOneSessionRate <= max
    }
    console.log("Final Combine ::", educationFilterResult && availabilityFilterResult && hourlyRateFilterResult && teacherTypeFilterResult && subjectFilterResult && genderFilterResult, educationFilterResult, availabilityFilterResult, hourlyRateFilterResult, teacherTypeFilterResult, subjectFilterResult, genderFilterResult)
    return educationFilterResult && availabilityFilterResult && hourlyRateFilterResult && teacherTypeFilterResult && subjectFilterResult && genderFilterResult;
  }

  const allData = await queryRef.get().then(teacherDataSnapshot => {
    const data = teacherDataSnapshot.docs.filter(item => filterFunction(item.data()))
    console.log("FilterFunction:::", data.length, data)
    return data;
  })
  const newData = allData.map((teacherDoc, index) => {
    const teacherDetails = teacherDoc.data();
    const userID = teacherDetails.userId;
    return userCollection
      .doc(userID)
      .get()
      .then(data => ({ ...teacherDetails, ...data.data() }));
  })
  return Promise.all(newData)

}


const getStudents = async () => {
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

const updateUserProfileDetails = async () => {
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

const updateTeacherPreference = async () => {
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

    const educationData =
      [
        { id: 'UNDERGRADUATE_STUDENT', name: 'Undergraduate Student', value: 2 },
        { id: 'GRADUATE_STUDENT', name: 'Graduate Student', value: 3 },
        { id: 'GRADUATE_DEGREE', name: 'Graduate Degree', value: 4 },
        { id: 'BACHELORS_DEGREE', name: 'Bachelor’s Degree', value: 5 },
        { id: 'MASTERS_DEGREE', name: 'Master’s Degree', value: 6 },

        { id: 'CURRENT_UNDERGRADUATE_STUDENT', name: 'Current Undergraduate Student', value: 1 },

        { id: 'UNDERGRADUATE_DEGREE', name: 'Undergraduate Degree', value: 2 },
        { id: 'CURRENT_GRADUATE_STUDENT', name: 'Current Graduate Student', value: 3 },
        { id: 'GRADUATE_DEGREE', name: 'Graduate Degree', value: 4 },
        { id: 'OTHER', name: 'Other', value: 6 },
      ]

    const weekDay: any = {
      "Sun": "0",
      "Mon": "1",
      "Tue": "2",
      "Wed": "3",
      "Thu": "4",
      "Fri": "5",
      "Sat": "6",
    }
    const daySlotTypes: any = {
      Afternoon: 'AFTERNOON',
      Evening: 'EVENING',
      Morning: 'MORNING'
    }

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

export const fixTeacherPrefrances = functions.https.onRequest(
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

export const updateUserData = functions.https.onRequest((request: any, response: any) => {
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
})

// Post Calls
export const setCounsellingSubjectList = functions.https.onRequest(
  (request: any, response: any) => {
    firestoreDB
      .collection("subjectLists")
      .doc("counsellingSubjects")
      .set({ list: request.body.data })
      .then(res => {
        response.status(200).json({
          data: res,
          message: "Updated Counselling Subject List Success"
        });
      })
      .catch(err =>
        console.log("Found Error on updating Counselling Subject List: ", err)
      );
  }
);
export const setTutoringSubjectList = functions.https.onRequest(
  (request: any, response: any) => {
    firestoreDB
      .collection("subjectLists")
      .doc("tutoringSubjects")
      .set({ list: request.body.data })
      .then(res => {
        response
          .status(200)
          .json({ data: res, message: "Updated Tutor Subject List Success" });
      })
      .catch(err =>
        console.log("Found Error on updating Tutor Subject List: ", err)
      );
  }
);

export const setStandardizedTestList = functions.https.onRequest(
  (request: any, response: any) => {
    console.log("standardizedTest request ::", request.body);
    firestoreDB
      .collection("subjectLists")
      .doc("standardizedTest")
      .set({ list: request.body.data })
      .then(res => {
        response.status(200).json({
          data: res,
          message: "Updated Standardized Test List Success"
        });
      })
      .catch(err =>
        console.log("Found Error on updating Standardized Test List: ", err)
      );
  }
);

export const getAllUsers = functions.https.onRequest(
  async (request: any, response: any) => {

    let userIds: string[] = [];
    const usersQuery = await userCollection.orderBy('name', 'asc').get();

    // let userMap: Object = {};
    const userData = usersQuery.docs.map((docItem, index) => {
      const id: string = docItem.id
      const data = docItem.data();
      console.log("User---" + "index" + "----" + JSON.stringify(data))
      userIds.push(id)
      // userMap[id] = data;
      return { ...data }
    })
    response.status(200).json({
      data: userData,
      userIds,
      message: "all users"
    });
  }
);

// import * as admin from "firebase-admin";

export const getServerTimeStamp = () => new Date();

export const addCreationTimeStamp = docData => ({
    ...docData,
    creationTime: getServerTimeStamp(),
    modifiedTime: getServerTimeStamp(),
});

export const addModifiedTimeStamp = docData => ({
    ...docData,
    modifiedTime: getServerTimeStamp(),
});
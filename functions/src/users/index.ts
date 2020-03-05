import { userCollection } from "..";


type userIdType = string

export const getUsersById = async (userIds: userIdType[]) => {
    const allUserData = userIds.map((id: string) => {
        return userCollection.doc(id).get().then(doc => doc.data())
    })
    return Promise.all(allUserData)
}


export const getAllUsers = async () => {
    const usersQuery = await userCollection.orderBy('name', 'asc').get();
    return usersQuery.docs.map((docItem, index) => ({
        ...docItem.data()
    }))
}



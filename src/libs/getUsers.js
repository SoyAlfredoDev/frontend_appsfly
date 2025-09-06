import { getUsers } from "../api/user"

export default async function getUsersLibs() {
    try {
        const res = await getUsers();
        console.log(res)
        return res;
    } catch (error) {
        console.log(error);
        throw error;
    }
}


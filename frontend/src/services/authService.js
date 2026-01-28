import axiosInstance from "../api/axios";

export const loginApi = async (data) => {

    try {
        const res = await axiosInstance.post("/api/users/login")
        return res.data;
    } catch (error) {
        throw error.response?.data || error;
    }

}
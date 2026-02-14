import axiosInstance from "../api/axios";

export const loginApi = async (data) => {
  try {
    const res = await axiosInstance.post("/user/login", data);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const forgotPasswordApi = async (data) => {
  try {
    const res = await axiosInstance.post("/user/forgot-password", data);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const resetPasswordApi = async (token, data) => {
  try {
    const res = await axiosInstance.post(`/user/reset-password/${token}`, data);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

import axiosInstance from "../api/axios";

// ==========================
// LIST APIs
// ==========================
export const getVisitorsApi = async (params) => {
  try {
    const res = await axiosInstance.get("/visitor/allvisitor", { params });
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getNotInterestedVisitorsApi = async (params) => {
  try {
    const res = await axiosInstance.get("/visitor/not-interested/list", {
      params,
    });
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getFollowUpVisitorsApi = async (params) => {
  try {
    const res = await axiosInstance.get("/visitor/follow-up/list", { params });
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getConvertedVisitorsApi = async (params) => {
  try {
    const res = await axiosInstance.get("/visitor/converted/list", { params });
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getTrashVisitorsApi = async (params) => {
  try {
    const res = await axiosInstance.get("/visitor/trash/list", { params });
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// ==========================
// ACTION APIs
// ==========================
export const deleteVisitorApi = async (id) => {
  try {
    const res = await axiosInstance.delete(`/visitor/${id}`);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const restoreVisitorApi = async (id) => {
  try {
    const res = await axiosInstance.patch(`/visitor/${id}/restore`);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const markNotInterestedApi = async (id, payload) => {
  try {
    const res = await axiosInstance.patch(`/visitor/${id}/not-interested`, payload);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const convertVisitorToStudentApi = async (id, payload) => {
  try {
    const res = await axiosInstance.post(`/visitor/${id}/convert/student`, payload);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const convertVisitorToEmployeeApi = async (id, payload) => {
  try {
    const res = await axiosInstance.post(`/visitor/${id}/convert/employee`, payload);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

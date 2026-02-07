import axiosInstance from "../api/axios";

export const adminDashBoardService={
    totalStudents:()=>axiosInstance.get('/students/all'),
    totalTutors:()=>axiosInstance.get('/tutors/all')
}
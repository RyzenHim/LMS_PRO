import axiosInstance from "../api/axios";

export const adminDashBoardService={
    totalStudents:()=>axiosInstance.get('/students/all'),
    totalTutors:()=>axiosInstance.get('/tutors/all'),
    totalEmployes:()=>axiosInstance.get('/emp/allEmp'),
    totalCourses:()=>axiosInstance.get('/courses/all'),
    totalBatches:()=>axiosInstance.get('/batch/all'),
    totalFees:()=>axiosInstance.get('/fees/all'),
    totalVisitors:()=>axiosInstance.get('/visitor/allvisitor'),
    followUpVisitors:()=>axiosInstance.get('/visitor/follow-up/list'),
    notInterestedVisitors:()=>axiosInstance.get('/visitor/not-interested/list'),
    convertedVisitors:()=>axiosInstance.get('/visitor/converted/list'),
}

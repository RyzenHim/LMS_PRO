import React from "react";

const ViewCourseModal = ({ open, onClose, course }) => {
  if (!open || !course) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Course Details
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Title
              </label>
              <p className="text-gray-900 dark:text-white">{course.title}</p>
            </div>

            <div className="col-span-2">
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Description
              </label>
              <p className="text-gray-900 dark:text-white">{course.description || "—"}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Category
              </label>
              <p className="text-gray-900 dark:text-white">{course.category}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Tutor
              </label>
              <p className="text-gray-900 dark:text-white">
                {course.tutorName || course.tutor?.name || "—"}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Price
              </label>
              <p className="text-gray-900 dark:text-white">₹{course.price || 0}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Duration
              </label>
              <p className="text-gray-900 dark:text-white">{course.duration || 0} hours</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Level
              </label>
              <p className="text-gray-900 dark:text-white capitalize">{course.level}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Status
              </label>
              <p className="text-gray-900 dark:text-white capitalize">{course.status}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Students Enrolled
              </label>
              <p className="text-gray-900 dark:text-white">{course.studentsEnrolled || 0}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Is Active
              </label>
              <p className="text-gray-900 dark:text-white">
                {course.isActive ? "Yes" : "No"}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Start Date
              </label>
              <p className="text-gray-900 dark:text-white">
                {course.startDate
                  ? new Date(course.startDate).toLocaleDateString()
                  : "—"}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                End Date
              </label>
              <p className="text-gray-900 dark:text-white">
                {course.endDate
                  ? new Date(course.endDate).toLocaleDateString()
                  : "—"}
              </p>
            </div>

            <div className="col-span-2">
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Skills
              </label>
              <div className="flex flex-wrap gap-2 mt-2">
                {course.skills && course.skills.length > 0 ? (
                  course.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 text-xs rounded-md bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300 capitalize"
                    >
                      {typeof skill === "object" ? skill.name : skill}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500 dark:text-gray-400">No skills assigned</span>
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Created At
              </label>
              <p className="text-gray-900 dark:text-white">
                {new Date(course.createdAt).toLocaleString()}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Updated At
              </label>
              <p className="text-gray-900 dark:text-white">
                {new Date(course.updatedAt).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewCourseModal;


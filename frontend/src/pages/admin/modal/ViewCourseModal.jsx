import React from "react";
import { X, BookOpen } from "lucide-react";

const ViewCourseModal = ({ open, onClose, course }) => {
  if (!open || !course) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div
        className="relative w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden
                      bg-white dark:bg-[#101010] 
                      border border-gray-200 dark:border-gray-800"
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-5 
                        border-b border-gray-200 dark:border-gray-800
                        bg-gradient-to-r from-indigo-50 to-white 
                        dark:from-[#1a1a1a] dark:to-[#101010]"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30">
              <BookOpen
                size={18}
                className="text-indigo-600 dark:text-indigo-400"
              />
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Course Details
            </h2>
          </div>

          {/* <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <X size={16} className="text-gray-600 dark:text-gray-400" />
          </button> */}
        </div>

        {/* Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-6">
            {/* Title */}
            <div className="col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                Title
              </label>
              <p className="text-gray-900 dark:text-white font-medium">
                {course.title}
              </p>
            </div>

            {/* Description */}
            <div className="col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                Description
              </label>
              <p className="text-gray-800 dark:text-gray-300">
                {course.description || "—"}
              </p>
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                Category
              </label>
              <p className="text-gray-900 dark:text-white">{course.category}</p>
            </div>

            {/* Price */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                Price
              </label>
              <p className="text-gray-900 dark:text-white font-semibold">
                ₹{course.price || 0}
              </p>
            </div>

            {/* Level */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                Level
              </label>
              <p className="text-gray-900 dark:text-white capitalize">
                {course.level}
              </p>
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                Status
              </label>
              <span
                className={`inline-block px-3 py-1 text-xs font-semibold rounded-full
                  ${
                    course.status === "published"
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : course.status === "archived"
                        ? "bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                        : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                  }`}
              >
                {course.status}
              </span>
            </div>

            {/* Is Active */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                Is Active
              </label>
              <p className="text-gray-900 dark:text-white">
                {course.isActive ? "Yes" : "No"}
              </p>
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                Start Date
              </label>
              <p className="text-gray-900 dark:text-white">
                {course.startDate
                  ? new Date(course.startDate).toLocaleDateString()
                  : "—"}
              </p>
            </div>

            {/* End Date */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                End Date
              </label>
              <p className="text-gray-900 dark:text-white">
                {course.endDate
                  ? new Date(course.endDate).toLocaleDateString()
                  : "—"}
              </p>
            </div>

            {/* Skills */}
            <div className="col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                Skills
              </label>
              <div className="flex flex-wrap gap-2">
                {course.skills && course.skills.length > 0 ? (
                  course.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 text-xs font-medium rounded-full
                                 bg-indigo-100 text-indigo-700
                                 dark:bg-indigo-900/30 dark:text-indigo-400 capitalize"
                    >
                      {typeof skill === "object" ? skill.name : skill}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500 dark:text-gray-400">
                    No skills assigned
                  </span>
                )}
              </div>
            </div>

            {/* Created At */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                Created At
              </label>
              <p className="text-gray-900 dark:text-white">
                {new Date(course.createdAt).toLocaleString()}
              </p>
            </div>

            {/* Updated At */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                Updated At
              </label>
              <p className="text-gray-900 dark:text-white">
                {new Date(course.updatedAt).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end px-6 py-4 border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-gray-200 hover:bg-gray-300
                       dark:bg-gray-800 dark:hover:bg-gray-700
                       text-gray-800 dark:text-gray-200 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewCourseModal;

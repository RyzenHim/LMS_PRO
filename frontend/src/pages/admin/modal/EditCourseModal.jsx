import React, { useState, useEffect } from "react";
import { tutorService } from "../../../services/tutorService";
import { skillService } from "../../../services/skillService";

const EditCourseModal = ({ open, onClose, course, onSubmit }) => {
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    tutor: "",
    tutorName: "",
    price: "",
    duration: "",
    level: "beginner",
    status: "draft",
    startDate: "",
    endDate: "",
    skills: [],
  });
  const [tutors, setTutors] = useState([]);
  const [skills, setSkills] = useState([]);

  useEffect(() => {
    if (open) {
      fetchTutors();
      fetchSkills();
    }
  }, [open]);

  useEffect(() => {
    if (course) {
      setForm({
        title: course.title || "",
        description: course.description || "",
        category: course.category || "",
        tutor: course.tutor?._id || course.tutor || "",
        tutorName: course.tutorName || course.tutor?.name || "",
        price: course.price || "",
        duration: course.duration || "",
        level: course.level || "beginner",
        status: course.status || "draft",
        startDate: course.startDate
          ? new Date(course.startDate).toISOString().split("T")[0]
          : "",
        endDate: course.endDate
          ? new Date(course.endDate).toISOString().split("T")[0]
          : "",
        skills: course.skills
          ? course.skills.map((s) => (typeof s === "object" ? s._id : s))
          : [],
      });
    }
  }, [course]);

  const fetchTutors = async () => {
    try {
      const res = await tutorService.getAll();
      setTutors(res.data || []);
    } catch (error) {
      console.error("Error fetching tutors", error);
    }
  };

  const fetchSkills = async () => {
    try {
      const res = await skillService.getAll();
      setSkills(res.data || []);
    } catch (error) {
      console.error("Error fetching skills", error);
    }
  };

  if (!open) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value,
      ...(name === "tutor" && {
        tutorName: tutors.find((t) => t._id === value)?.name || "",
      }),
    });
  };

  const handleSkillToggle = (skillId) => {
    setForm((prev) => ({
      ...prev,
      skills: prev.skills.includes(skillId)
        ? prev.skills.filter((id) => id !== skillId)
        : [...prev.skills, skillId],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.(form);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-2xl my-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Edit Course
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Title *
              </label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Course title"
                required
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div className="col-span-2">
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Description
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Course description"
                rows="3"
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Category *
              </label>
              <input
                name="category"
                value={form.category}
                onChange={handleChange}
                placeholder="e.g., Frontend, Backend"
                required
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Tutor
              </label>
              <select
                name="tutor"
                value={form.tutor}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">Select Tutor</option>
                {tutors.map((tutor) => (
                  <option key={tutor._id} value={tutor._id}>
                    {tutor.name} - {tutor.expertise}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Price
              </label>
              <input
                name="price"
                type="number"
                value={form.price}
                onChange={handleChange}
                placeholder="0"
                min="0"
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Duration (hours)
              </label>
              <input
                name="duration"
                type="number"
                value={form.duration}
                onChange={handleChange}
                placeholder="0"
                min="0"
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Level
              </label>
              <select
                name="level"
                value={form.level}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Status
              </label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Start Date
              </label>
              <input
                name="startDate"
                type="date"
                value={form.startDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                End Date
              </label>
              <input
                name="endDate"
                type="date"
                value={form.endDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div className="col-span-2">
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2 block">
                Skills
              </label>
              <div className="max-h-40 overflow-y-auto border rounded-lg p-3 dark:border-gray-600">
                {skills.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No skills available</p>
                ) : (
                  <div className="space-y-2">
                    {skills.map((skill) => (
                      <label
                        key={skill._id}
                        className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded"
                      >
                        <input
                          type="checkbox"
                          checked={form.skills.includes(skill._id)}
                          onChange={() => handleSkillToggle(skill._id)}
                          className="rounded"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                          {skill.name}
                        </span>
                        {skill.category && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            ({skill.category})
                          </span>
                        )}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg dark:border-gray-600 dark:text-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Update Course
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCourseModal;

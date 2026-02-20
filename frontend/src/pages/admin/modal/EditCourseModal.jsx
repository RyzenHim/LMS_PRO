import React, { useState, useEffect } from "react";
import { skillService } from "../../../services/skillService";
import { X, BookOpen, Calendar, Tag } from "lucide-react";

const EditCourseModal = ({ open, onClose, course, onSubmit }) => {
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    price: "",
    level: "beginner",
    status: "draft",
    startDate: "",
    endDate: "",
    skills: [],
  });

  const [skills, setSkills] = useState([]);

  useEffect(() => {
    if (open) {
      fetchSkills();
    }
  }, [open]);

  useEffect(() => {
    if (course) {
      setForm({
        title: course.title || "",
        description: course.description || "",
        category: course.category || "",
        price: course.price || "",
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

  const fetchSkills = async () => {
    try {
      const res = await skillService.getAll({ limit: 100 });
      setSkills(res.data.skills || []);
    } catch (error) {
      console.error("Error fetching skills", error);
    }
  };

  if (!open) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
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

    if (!form.price || Number(form.price) <= 0) {
      return alert("Course price must be greater than 0");
    }

    onSubmit?.({
      ...form,
      skills: form.skills.filter(Boolean),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#112d4e] border border-[#1e3a5f] rounded-3xl shadow-2xl shadow-black/40 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#1e3a5f] bg-gradient-to-r from-[#3F72AF]/10 to-transparent rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#3F72AF]/20 border border-[#3F72AF]/30">
              <BookOpen size={18} className="text-[#7aa8d8]" />
            </div>
            <h2 className="text-lg font-bold text-white">Edit Course</h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-[#1e3a5f] text-slate-400 hover:text-white transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-5 max-h-[75vh] overflow-y-auto"
        >
          <div className="grid grid-cols-2 gap-5">
            {/* Title */}
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Title *
              </label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-[#1e3a5f] bg-[#0d1b2e] text-white text-sm focus:ring-2 focus:ring-[#3F72AF]/40 focus:border-[#3F72AF] transition"
              />
            </div>

            {/* Description */}
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Description
              </label>
              <textarea
                name="description"
                rows="3"
                value={form.description}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-[#1e3a5f] bg-[#0d1b2e] text-white text-sm resize-none focus:ring-2 focus:ring-[#3F72AF]/40 focus:border-[#3F72AF] transition"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Category *
              </label>
              <input
                name="category"
                value={form.category}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-[#1e3a5f] bg-[#0d1b2e] text-white text-sm focus:ring-2 focus:ring-[#3F72AF]/40 focus:border-[#3F72AF] transition"
              />
            </div>

            {/* Price */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Price *
              </label>
              <input
                type="number"
                name="price"
                min="1"
                value={form.price}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-[#1e3a5f] bg-[#0d1b2e] text-white text-sm focus:ring-2 focus:ring-[#3F72AF]/40 focus:border-[#3F72AF] transition"
              />
            </div>

            {/* Level */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Level
              </label>
              <select
                name="level"
                value={form.level}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-[#1e3a5f] bg-[#0d1b2e] text-white text-sm focus:ring-2 focus:ring-[#3F72AF]/40 focus:border-[#3F72AF] transition"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Status
              </label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-[#1e3a5f] bg-[#0d1b2e] text-white text-sm focus:ring-2 focus:ring-[#3F72AF]/40 focus:border-[#3F72AF] transition"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Start Date
              </label>
              <input
                type="date"
                name="startDate"
                value={form.startDate}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-[#1e3a5f] bg-[#0d1b2e] text-white text-sm"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                End Date
              </label>
              <input
                type="date"
                name="endDate"
                value={form.endDate}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-[#1e3a5f] bg-[#0d1b2e] text-white text-sm"
              />
            </div>

            {/* Skills */}
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Skills
              </label>
              <div className="max-h-40 overflow-y-auto border border-[#1e3a5f] rounded-xl p-3 bg-[#0d1b2e] space-y-2">
                {skills.length === 0 ? (
                  <p className="text-sm text-slate-500">No skills available</p>
                ) : (
                  skills.map((skill) => (
                    <label
                      key={skill._id}
                      className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-[#1e3a5f]/50 cursor-pointer transition"
                    >
                      <input
                        type="checkbox"
                        checked={form.skills.includes(skill._id)}
                        onChange={() => handleSkillToggle(skill._id)}
                        className="accent-[#3F72AF]"
                      />
                      <span className="text-sm text-slate-300 capitalize">
                        {skill.name}
                      </span>
                    </label>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4 border-t border-[#1e3a5f]">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-[#1e3a5f] text-slate-300 hover:bg-[#1e3a5f] transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#3F72AF] hover:bg-[#2f5d95] text-white font-semibold transition shadow-md shadow-[#3F72AF]/30"
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

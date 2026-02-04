import React, { useState, useEffect } from "react";
import { User, Mail, Shield, Calendar, Save } from "lucide-react";
import axiosInstance from "../../api/axios";

const AdminProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [form, setForm] = useState({
    name: "",
    password: "",
    currentPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axiosInstance.get("/user/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUser(res.data);
      setForm({
        name: res.data.name || "",
        password: "",
        currentPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Error fetching user", error);
      alert("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (form.password) {
      if (form.password.length < 6) {
        newErrors.password = "Password must be at least 6 characters long";
      }

      if (!form.currentPassword) {
        newErrors.currentPassword =
          "Current password is required to change password";
      }

      if (form.password !== form.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value,
    });
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess("");

    if (!validateForm()) {
      return;
    }

    setUpdating(true);
    try {
      const token = localStorage.getItem("token");
      const updateData = {
        name: form.name,
      };

      if (form.password) {
        updateData.password = form.password;
        updateData.currentPassword = form.currentPassword;
      }

      const res = await axiosInstance.put("/user/profile", updateData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUser(res.data.user);
      setForm({
        name: res.data.user.name,
        password: "",
        currentPassword: "",
        confirmPassword: "",
      });
      setSuccess("Profile updated successfully!");
    } catch (error) {
      console.error("Update profile error", error);
      const errorMessage =
        error.response?.data?.message || "Failed to update profile";
      alert(errorMessage);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-[#3F72AF] dark:text-[#DBE2EF]">
        Loading profile...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6 text-center text-red-500">Failed to load profile</div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[#112D4E] dark:text-[#DBE2EF]">
          Profile Settings
        </h1>
        <p className="text-sm text-[#3F72AF] dark:text-[#DBE2EF]">
          Manage your account information
        </p>
      </div>

      {success && (
        <div className="bg-green-100 dark:bg-green-900 border border-green-400 dark:border-green-700 text-green-700 dark:text-green-300 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-[#112D4E] rounded-xl border border-[#DBE2EF] dark:border-[#3F72AF] p-6 shadow-lg">
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-[#DBE2EF] dark:bg-[#3F72AF] flex items-center justify-center mb-4">
                <User
                  size={40}
                  className="text-[#3F72AF] dark:text-[#DBE2EF]"
                />
              </div>
              <h2 className="text-xl font-semibold text-[#112D4E] dark:text-[#DBE2EF] mb-2">
                {user.name}
              </h2>
              <p className="text-sm text-[#3F72AF] dark:text-[#DBE2EF] mb-6">
                {user.email}
              </p>

              <div className="w-full space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <Mail
                    size={16}
                    className="text-[#3F72AF] dark:text-[#DBE2EF]"
                  />
                  <span className="text-[#112D4E] dark:text-[#DBE2EF]">
                    {user.email}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <Shield
                    size={16}
                    className="text-[#3F72AF] dark:text-[#DBE2EF]"
                  />
                  <span className="text-[#112D4E] dark:text-[#DBE2EF] capitalize">
                    {user.role}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <Calendar
                    size={16}
                    className="text-[#3F72AF] dark:text-[#DBE2EF]"
                  />
                  <span className="text-[#112D4E] dark:text-[#DBE2EF]">
                    Joined {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="pt-4 border-t border-[#DBE2EF] dark:border-[#3F72AF]">
                  <span
                    className={`px-3 py-1 text-xs rounded-full ${
                      user.isActive
                        ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                        : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                    }`}
                  >
                    {user.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-[#112D4E] rounded-xl border border-[#DBE2EF] dark:border-[#3F72AF] p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-[#112D4E] dark:text-[#DBE2EF] mb-6">
              Edit Profile
            </h3>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[#112D4E] dark:text-[#DBE2EF] mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-2 border rounded-lg bg-[#F9F7F7] dark:bg-[#0a1f3a] dark:border-[#3F72AF] dark:text-[#DBE2EF] ${
                    errors.name
                      ? "border-red-500 dark:border-red-500"
                      : "border-[#DBE2EF] dark:border-[#3F72AF]"
                  }`}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.name}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#112D4E] dark:text-[#DBE2EF] mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full px-4 py-2 border rounded-lg bg-[#DBE2EF] dark:bg-[#0a1f3a] dark:border-[#3F72AF] dark:text-[#DBE2EF] cursor-not-allowed"
                />
                <p className="mt-1 text-xs text-[#3F72AF] dark:text-[#DBE2EF]">
                  Email cannot be changed
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#112D4E] dark:text-[#DBE2EF] mb-2">
                  Role
                </label>
                <input
                  type="text"
                  value={user.role}
                  disabled
                  className="w-full px-4 py-2 border rounded-lg bg-[#DBE2EF] dark:bg-[#0a1f3a] dark:border-[#3F72AF] dark:text-[#DBE2EF] cursor-not-allowed capitalize"
                />
                <p className="mt-1 text-xs text-[#3F72AF] dark:text-[#DBE2EF]">
                  Role cannot be changed
                </p>
              </div>

              <div className="pt-6 border-t border-[#DBE2EF] dark:border-[#3F72AF]">
                <h4 className="text-md font-medium text-[#112D4E] dark:text-[#DBE2EF] mb-4">
                  Change Password
                </h4>
                <p className="text-sm text-[#3F72AF] dark:text-[#DBE2EF] mb-4">
                  Leave blank if you don't want to change your password
                </p>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-[#112D4E] dark:text-[#DBE2EF] mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={form.currentPassword}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg bg-[#F9F7F7] dark:bg-[#0a1f3a] dark:border-[#3F72AF] dark:text-[#DBE2EF] ${
                      errors.currentPassword
                        ? "border-red-500 dark:border-red-500"
                        : "border-[#DBE2EF] dark:border-[#3F72AF]"
                    }`}
                  />
                  {errors.currentPassword && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.currentPassword}
                    </p>
                  )}
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-[#112D4E] dark:text-[#DBE2EF] mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg bg-[#F9F7F7] dark:bg-[#0a1f3a] dark:border-[#3F72AF] dark:text-[#DBE2EF] ${
                      errors.password
                        ? "border-red-500 dark:border-red-500"
                        : "border-[#DBE2EF] dark:border-[#3F72AF]"
                    }`}
                  />
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.password}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#112D4E] dark:text-[#DBE2EF] mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg bg-[#F9F7F7] dark:bg-[#0a1f3a] dark:border-[#3F72AF] dark:text-[#DBE2EF] ${
                      errors.confirmPassword
                        ? "border-red-500 dark:border-red-500"
                        : "border-[#DBE2EF] dark:border-[#3F72AF]"
                    }`}
                  />
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={updating}
                  className="flex items-center gap-2 px-6 py-2 bg-[#3F72AF] text-white rounded-lg hover:bg-[#112D4E] dark:bg-[#3F72AF] dark:hover:bg-[#DBE2EF] dark:hover:text-[#112D4E] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Save size={18} />
                  {updating ? "Updating..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;

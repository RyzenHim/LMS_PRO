import { useEffect, useState } from "react";
import { User, Mail, Shield, Calendar, Save } from "lucide-react";
import axiosInstance from "../../api/axios";

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    name: "",
    currentPassword: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    const loadMe = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get("/user/me");
        const currentUser = res.data?.user || res.data;
        setUser(currentUser);
        setForm((prev) => ({
          ...prev,
          name: currentUser?.name || "",
        }));
      } catch (error) {
        console.error("Profile load error:", error);
      } finally {
        setLoading(false);
      }
    };

    loadMe();
  }, []);

  const validate = () => {
    const next = {};

    if (!form.name.trim()) {
      next.name = "Name is required";
    }

    const changingPassword =
      form.currentPassword || form.password || form.confirmPassword;

    if (changingPassword) {
      if (!form.currentPassword) {
        next.currentPassword = "Current password is required";
      }
      if (!form.password || form.password.length < 6) {
        next.password = "New password must be at least 6 characters";
      }
      if (form.password !== form.confirmPassword) {
        next.confirmPassword = "Passwords do not match";
      }
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess("");

    if (!validate()) return;

    try {
      setUpdating(true);

      const payload = {
        name: form.name.trim(),
      };

      if (form.password) {
        payload.currentPassword = form.currentPassword;
        payload.password = form.password;
      }

      const res = await axiosInstance.patch("/user/profile", payload);
      const updatedUser = res.data?.user || res.data;
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));

      setForm((prev) => ({
        ...prev,
        currentPassword: "",
        password: "",
        confirmPassword: "",
      }));
      setSuccess("Profile updated successfully");
    } catch (error) {
      const message = error?.response?.data?.message || "Update failed";
      setErrors((prev) => ({ ...prev, currentPassword: message }));
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
      <div className="p-6 text-center text-red-500">
        Unable to load profile data.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[#112D4E] dark:text-[#DBE2EF]">
          My Profile
        </h1>
        <p className="text-sm text-[#3F72AF] dark:text-[#DBE2EF]">
          Update your name and password. Email is read-only.
        </p>
      </div>

      {success && (
        <div className="p-3 rounded-lg bg-green-100 border border-green-300 text-green-700 text-sm">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-[#112D4E] rounded-xl border border-[#DBE2EF] dark:border-[#3F72AF] p-6 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-[#DBE2EF] dark:bg-[#0a1f3a] flex items-center justify-center">
            <User className="text-[#3F72AF] dark:text-[#DBE2EF]" />
          </div>

          <div className="mt-4 space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <Mail size={16} className="text-[#3F72AF] dark:text-[#DBE2EF]" />
              <span className="text-[#112D4E] dark:text-[#DBE2EF]">
                {user.email || "-"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Shield
                size={16}
                className="text-[#3F72AF] dark:text-[#DBE2EF]"
              />
              <span className="capitalize text-[#112D4E] dark:text-[#DBE2EF]">
                {user.role || "-"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar
                size={16}
                className="text-[#3F72AF] dark:text-[#DBE2EF]"
              />
              <span className="text-[#112D4E] dark:text-[#DBE2EF]">
                Joined{" "}
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "-"}
              </span>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="lg:col-span-2 bg-white dark:bg-[#112D4E] rounded-xl border border-[#DBE2EF] dark:border-[#3F72AF] p-6 shadow-sm space-y-4"
        >
          <div>
            <label className="block text-sm mb-1 text-[#112D4E] dark:text-[#DBE2EF]">
              Name
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg border border-[#DBE2EF] dark:border-[#3F72AF] bg-[#F9F7F7] dark:bg-[#0a1f3a] text-[#112D4E] dark:text-[#DBE2EF]"
            />
            {errors.name && (
              <p className="text-xs text-red-500 mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm mb-1 text-[#112D4E] dark:text-[#DBE2EF]">
              Email
            </label>
            <input
              value={user.email || ""}
              disabled
              className="w-full px-3 py-2 rounded-lg border border-[#DBE2EF] dark:border-[#3F72AF] bg-[#DBE2EF] dark:bg-[#0a1f3a] text-[#112D4E] dark:text-[#DBE2EF] cursor-not-allowed"
            />
          </div>

          <div className="pt-2 border-t border-[#DBE2EF] dark:border-[#3F72AF]">
            <p className="text-sm mb-3 text-[#112D4E] dark:text-[#DBE2EF]">
              Change Password (optional)
            </p>
          </div>

          <div>
            <label className="block text-sm mb-1 text-[#112D4E] dark:text-[#DBE2EF]">
              Current Password
            </label>
            <input
              type="password"
              name="currentPassword"
              value={form.currentPassword}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg border border-[#DBE2EF] dark:border-[#3F72AF] bg-[#F9F7F7] dark:bg-[#0a1f3a] text-[#112D4E] dark:text-[#DBE2EF]"
            />
            {errors.currentPassword && (
              <p className="text-xs text-red-500 mt-1">{errors.currentPassword}</p>
            )}
          </div>

          <div>
            <label className="block text-sm mb-1 text-[#112D4E] dark:text-[#DBE2EF]">
              New Password
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg border border-[#DBE2EF] dark:border-[#3F72AF] bg-[#F9F7F7] dark:bg-[#0a1f3a] text-[#112D4E] dark:text-[#DBE2EF]"
            />
            {errors.password && (
              <p className="text-xs text-red-500 mt-1">{errors.password}</p>
            )}
          </div>

          <div>
            <label className="block text-sm mb-1 text-[#112D4E] dark:text-[#DBE2EF]">
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg border border-[#DBE2EF] dark:border-[#3F72AF] bg-[#F9F7F7] dark:bg-[#0a1f3a] text-[#112D4E] dark:text-[#DBE2EF]"
            />
            {errors.confirmPassword && (
              <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>
            )}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={updating}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#3F72AF] hover:bg-[#112D4E] text-white text-sm font-medium disabled:opacity-70"
            >
              <Save size={16} />
              {updating ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;

import { useEffect, useState } from "react";
import { User, Mail, Shield, Calendar, Save } from "lucide-react";
import axiosInstance from "../../api/axios";
import PageLoader from "../../components/ui/PageLoader";

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

    if (!form.name.trim()) next.name = "Name is required";

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
      const payload = { name: form.name.trim() };

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
      setSuccess("Profile updated successfully.");
    } catch (error) {
      const message = error?.response?.data?.message || "Update failed";
      setErrors((prev) => ({ ...prev, currentPassword: message }));
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <PageLoader label="Loading" detail="Preparing your profile settings" />
    );
  }

  if (!user) {
    return <div className="lms-status-error">Unable to load profile data.</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--lms-text)]">
          My Profile
        </h1>
        <p className="text-sm text-[var(--lms-text-soft)]">
          Update your name and password. Email is read-only.
        </p>
      </div>

      {success ? <div className="lms-status-success">{success}</div> : null}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="neu-panel rounded-[32px] p-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--lms-accent-soft)]">
            <User className="text-[var(--lms-accent-strong)]" />
          </div>

          <div className="mt-4 space-y-3 text-sm">
            {[
              { icon: Mail, value: user.email || "-" },
              { icon: Shield, value: user.role || "-", capitalize: true },
              {
                icon: Calendar,
                value: `Joined ${
                  user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString()
                    : "-"
                }`,
              },
            ].map((item, index) => {
              const Icon = item.icon;

              return (
                <div key={index} className="neu-inset flex items-center gap-2 rounded-[22px] p-3">
                  <Icon size={16} className="text-[var(--lms-accent-strong)]" />
                  <span
                    className={`text-[var(--lms-text)] ${item.capitalize ? "capitalize" : ""}`}
                  >
                    {item.value}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="neu-panel space-y-4 rounded-[32px] p-6 lg:col-span-2"
        >
          <div>
            <label className="mb-1 block text-sm text-[var(--lms-text)]">
              Name
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="neu-input w-full rounded-[22px] px-3 py-2.5"
            />
            {errors.name ? (
              <p className="mt-1 text-xs text-red-500">{errors.name}</p>
            ) : null}
          </div>

          <div>
            <label className="mb-1 block text-sm text-[var(--lms-text)]">
              Email
            </label>
            <input
              value={user.email || ""}
              disabled
              className="neu-input w-full cursor-not-allowed rounded-[22px] px-3 py-2.5 opacity-75"
            />
          </div>

          <div className="border-t border-white/10 pt-2">
            <p className="mb-3 text-sm text-[var(--lms-text)]">
              Change Password (optional)
            </p>
          </div>

          {[
            ["Current Password", "currentPassword"],
            ["New Password", "password"],
            ["Confirm Password", "confirmPassword"],
          ].map(([label, name]) => (
            <div key={name}>
              <label className="mb-1 block text-sm text-[var(--lms-text)]">
                {label}
              </label>
              <input
                type="password"
                name={name}
                value={form[name]}
                onChange={handleChange}
                className="neu-input w-full rounded-[22px] px-3 py-2.5"
              />
              {errors[name] ? (
                <p className="mt-1 text-xs text-red-500">{errors[name]}</p>
              ) : null}
            </div>
          ))}

          <div className="pt-2">
            <button
              type="submit"
              disabled={updating}
              className="neu-button neu-button-primary inline-flex items-center gap-2 rounded-[22px] px-5 py-3 text-sm font-medium disabled:opacity-70"
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

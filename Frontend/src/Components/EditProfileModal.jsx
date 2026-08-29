import { useState } from "react";
import { X, Loader } from "lucide-react";
import {
  updateProfile,
  buildPersonalDetailsPayload,
  buildFamilyPayload,
  buildCareerEducationPayload,
  buildReligionPayload,
  buildLifestylePayload,
} from "../api/profileApi";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const EditProfileModal = ({ isOpen, section, profile, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({});

  // Initialize form data based on section
  const initializeFormData = () => {
    if (!profile) return;

    switch (section) {
      case "personal":
        setFormData({
          day: profile.dateOfBirth ? new Date(profile.dateOfBirth).getDate() : "",
          month: profile.dateOfBirth ? MONTHS[new Date(profile.dateOfBirth).getMonth()] : "",
          year: profile.dateOfBirth ? new Date(profile.dateOfBirth).getFullYear() : "",
          placeOfBirth: profile.placeOfBirth || "",
          gender: profile.gender || "",
          heightCm: profile.heightCm ? convertCmToFeetInches(profile.heightCm) : "",
          location: profile.location?.city || "",
          maritalStatus: profile.maritalStatus || "",
        });
        break;

      case "family":
        setFormData({
          motherTongue: profile.motherTongue || "",
          familyType: profile.family?.familyType || "",
          fatherOccupation: profile.family?.fatherOccupation || "",
          motherOccupation: profile.family?.motherOccupation || "",
          familyValues: profile.family?.familyValues || "",
          numBrothers: profile.family?.numBrothers || "",
          numSisters: profile.family?.numSisters || "",
        });
        break;

      case "career":
        setFormData({
          education: profile.education?.highestDegree || "",
          institution: profile.education?.institution || "",
          occupation: profile.career?.occupation || "",
          companyName: profile.career?.companyName || "",
          annualIncome: profile.career?.annualIncome || "",
        });
        break;

      case "religion":
        setFormData({
          religion: profile.religion || "",
          caste: profile.caste || "",
          gotham: profile.gotham || "",
          rashi: profile.rashi || "",
          nakshtra: profile.nakshtra || "",
        });
        break;

      case "lifestyle":
        setFormData({
          diet: profile.lifestyle?.diet || "",
          smoking: profile.lifestyle?.smoking !== false ? "false" : "true",
          drinking: profile.lifestyle?.drinking !== false ? "false" : "true",
        });
        break;

      default:
        setFormData({});
    }
  };

  const convertCmToFeetInches = (cm) => {
    if (!cm) return "";
    const totalInches = cm / 2.54;
    const feet = Math.floor(totalInches / 12);
    const inches = Math.round(totalInches % 12);
    return `${feet}'${inches}"`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      let payload = {};

      switch (section) {
        case "personal":
          payload = buildPersonalDetailsPayload(formData);
          break;
        case "family":
          payload = buildFamilyPayload(formData);
          break;
        case "career":
          payload = buildCareerEducationPayload(formData);
          break;
        case "religion":
          payload = buildReligionPayload(formData);
          break;
        case "lifestyle":
          payload = buildLifestylePayload(formData);
          break;
        default:
          throw new Error("Unknown section");
      }

      // Don't submit empty payloads
      if (Object.keys(payload).length === 0) {
        setError("No changes to save");
        setLoading(false);
        return;
      }

      await updateProfile(payload);
      onSuccess(); // Refetch profile and close modal
      setFormData({});
    } catch (err) {
      console.error("Failed to update profile:", err);
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  // Open modal hook
  if (isOpen) {
    if (Object.keys(formData).length === 0) {
      initializeFormData();
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl max-w-md w-full mx-4 max-h-96 overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-[#E0BEBF]">
          <h2 className="text-xl font-semibold">
            Edit {section === "career" ? "Career & Education" : section?.charAt(0).toUpperCase() + section?.slice(1)}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Personal Details Fields */}
          {section === "personal" && (
            <>
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  name="day"
                  placeholder="Day"
                  value={formData.day}
                  onChange={handleChange}
                  maxLength="2"
                  className="border border-[#E0BEBF] rounded-lg px-3 py-2 text-sm"
                />
                <select
                  name="month"
                  value={formData.month}
                  onChange={handleChange}
                  className="border border-[#E0BEBF] rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">Month</option>
                  {MONTHS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  name="year"
                  placeholder="Year"
                  value={formData.year}
                  onChange={handleChange}
                  maxLength="4"
                  className="border border-[#E0BEBF] rounded-lg px-3 py-2 text-sm"
                />
              </div>

              <input
                type="text"
                name="placeOfBirth"
                placeholder="Place of Birth"
                value={formData.placeOfBirth}
                onChange={handleChange}
                className="w-full border border-[#E0BEBF] rounded-lg px-3 py-2"
              />

              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full border border-[#E0BEBF] rounded-lg px-3 py-2"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>

              <input
                type="text"
                name="heightCm"
                placeholder="Height (e.g., 5'11\)"
                value={formData.heightCm}
                onChange={handleChange}
                className="w-full border border-[#E0BEBF] rounded-lg px-3 py-2"
              />

              <input
                type="text"
                name="location"
                placeholder="City"
                value={formData.location}
                onChange={handleChange}
                className="w-full border border-[#E0BEBF] rounded-lg px-3 py-2"
              />

              <select
                name="maritalStatus"
                value={formData.maritalStatus}
                onChange={handleChange}
                className="w-full border border-[#E0BEBF] rounded-lg px-3 py-2"
              >
                <option value="">Select Marital Status</option>
                <option value="never">Never Married</option>
                <option value="widowed">Widowed</option>
                <option value="divorced">Divorced</option>
              </select>
            </>
          )}

          {/* Family Background Fields */}
          {section === "family" && (
            <>
              <input
                type="text"
                name="motherTongue"
                placeholder="Mother Tongue"
                value={formData.motherTongue}
                onChange={handleChange}
                className="w-full border border-[#E0BEBF] rounded-lg px-3 py-2"
              />

              <select
                name="familyType"
                value={formData.familyType}
                onChange={handleChange}
                className="w-full border border-[#E0BEBF] rounded-lg px-3 py-2"
              >
                <option value="">Select Family Type</option>
                <option value="joint">Joint</option>
                <option value="nuclear">Nuclear</option>
              </select>

              <input
                type="text"
                name="fatherOccupation"
                placeholder="Father's Occupation"
                value={formData.fatherOccupation}
                onChange={handleChange}
                className="w-full border border-[#E0BEBF] rounded-lg px-3 py-2"
              />

              <input
                type="text"
                name="motherOccupation"
                placeholder="Mother's Occupation"
                value={formData.motherOccupation}
                onChange={handleChange}
                className="w-full border border-[#E0BEBF] rounded-lg px-3 py-2"
              />

              <input
                type="text"
                name="familyValues"
                placeholder="Family Values"
                value={formData.familyValues}
                onChange={handleChange}
                className="w-full border border-[#E0BEBF] rounded-lg px-3 py-2"
              />

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  name="numBrothers"
                  placeholder="Brothers"
                  min="0"
                  value={formData.numBrothers}
                  onChange={handleChange}
                  className="border border-[#E0BEBF] rounded-lg px-3 py-2"
                />
                <input
                  type="number"
                  name="numSisters"
                  placeholder="Sisters"
                  min="0"
                  value={formData.numSisters}
                  onChange={handleChange}
                  className="border border-[#E0BEBF] rounded-lg px-3 py-2"
                />
              </div>
            </>
          )}

          {/* Career & Education Fields */}
          {section === "career" && (
            <>
              <input
                type="text"
                name="education"
                placeholder="Highest Degree"
                value={formData.education}
                onChange={handleChange}
                className="w-full border border-[#E0BEBF] rounded-lg px-3 py-2"
              />

              <input
                type="text"
                name="institution"
                placeholder="College/University"
                value={formData.institution}
                onChange={handleChange}
                className="w-full border border-[#E0BEBF] rounded-lg px-3 py-2"
              />

              <input
                type="text"
                name="occupation"
                placeholder="Occupation"
                value={formData.occupation}
                onChange={handleChange}
                className="w-full border border-[#E0BEBF] rounded-lg px-3 py-2"
              />

              <input
                type="text"
                name="companyName"
                placeholder="Company Name"
                value={formData.companyName}
                onChange={handleChange}
                className="w-full border border-[#E0BEBF] rounded-lg px-3 py-2"
              />

              <input
                type="text"
                name="annualIncome"
                placeholder="Annual Income"
                value={formData.annualIncome}
                onChange={handleChange}
                className="w-full border border-[#E0BEBF] rounded-lg px-3 py-2"
              />
            </>
          )}

          {/* Religion Details Fields */}
          {section === "religion" && (
            <>
              <input
                type="text"
                name="religion"
                placeholder="Religion"
                value={formData.religion}
                onChange={handleChange}
                className="w-full border border-[#E0BEBF] rounded-lg px-3 py-2"
              />

              <input
                type="text"
                name="caste"
                placeholder="Caste"
                value={formData.caste}
                onChange={handleChange}
                className="w-full border border-[#E0BEBF] rounded-lg px-3 py-2"
              />

              <input
                type="text"
                name="gotham"
                placeholder="Gotham"
                value={formData.gotham}
                onChange={handleChange}
                className="w-full border border-[#E0BEBF] rounded-lg px-3 py-2"
              />

              <input
                type="text"
                name="rashi"
                placeholder="Rashi"
                value={formData.rashi}
                onChange={handleChange}
                className="w-full border border-[#E0BEBF] rounded-lg px-3 py-2"
              />

              <input
                type="text"
                name="nakshtra"
                placeholder="Nakshtra"
                value={formData.nakshtra}
                onChange={handleChange}
                className="w-full border border-[#E0BEBF] rounded-lg px-3 py-2"
              />
            </>
          )}

          {/* Lifestyle Fields */}
          {section === "lifestyle" && (
            <>
              <select
                name="diet"
                value={formData.diet}
                onChange={handleChange}
                className="w-full border border-[#E0BEBF] rounded-lg px-3 py-2"
              >
                <option value="">Select Diet</option>
                <option value="vegetarian">Vegetarian</option>
                <option value="non-vegetarian">Non-Vegetarian</option>
                <option value="vegan">Vegan</option>
              </select>

              <select
                name="smoking"
                value={formData.smoking}
                onChange={handleChange}
                className="w-full border border-[#E0BEBF] rounded-lg px-3 py-2"
              >
                <option value="">Smoking</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>

              <select
                name="drinking"
                value={formData.drinking}
                onChange={handleChange}
                className="w-full border border-[#E0BEBF] rounded-lg px-3 py-2"
              >
                <option value="">Drinking</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-[#E0BEBF] rounded-lg text-gray-700 font-medium hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-[#842029] text-white rounded-lg font-medium hover:bg-[#6b1a22] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <Loader size={16} className="animate-spin" />}
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;

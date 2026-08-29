import { useMemo, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

const motherTongues = [
  "Hindi",
  "Marathi",
  "Gujarati",
  "Tamil",
  "Telugu",
  "Kannada",
  "Malayalam",
  "Punjabi",
  "Bengali",
  "Urdu",
  "Odia",
  "English",
];

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function BasicInfo({
  formData,
  setFormData,
  errors,
  setErrors,
  nextStep,
}) {
  const [showPassword, setShowPassword] = useState(false);

  const years = useMemo(() => {
    const arr = [];
    const current = new Date().getFullYear();

    for (let i = current - 18; i >= current - 80; i--) {
      arr.push(i);
    }

    return arr;
  }, []);

  const updateField = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const passwordStrength = () => {
    const pass = formData.password;
    let score = 0;

    if (!pass) return 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[a-z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    return score;
  };

  const strengthColor = () => {
    switch (passwordStrength()) {
      case 1:
        return "bg-red-500";
      case 2:
        return "bg-orange-500";
      case 3:
        return "bg-yellow-500";
      case 4:
        return "bg-lime-500";
      case 5:
        return "bg-green-600";
      default:
        return "bg-gray-200";
    }
  };

  const validate = () => {
    let err = {};

    if (!formData.day) err.day = "Select day";
    if (!formData.month) err.month = "Select month";
    if (!formData.year) err.year = "Select year";

    if (!formData.birthPlace.trim()) err.birthPlace = "Birth place is required";
    else if (formData.birthPlace.length < 3) err.birthPlace = "Minimum 3 characters";

    if (!formData.motherTongue) err.motherTongue = "Select mother tongue";

    if (!formData.gender) err.gender = "Select gender";

    if (!formData.email) err.email = "Email required";
    else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email))
      err.email = "Invalid email";

    if (!formData.password) err.password = "Password required";
    else if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/.test(formData.password)
    )
      err.password = "Weak password (needs 8+ chars, upper, lower, number, special)";

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      nextStep();
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-white rounded-3xl shadow-xl p-10">
      <h1 className="text-3xl font-bold text-[#AE2539]">Basic Information</h1>
      <p className="text-gray-500 mt-2 mb-8">
        Let's begin by knowing a little about you.
      </p>

      {/* DOB */}
      <label className="font-medium mb-2 block text-gray-700">Date of Birth</label>
      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <select
            value={formData.day}
            onChange={(e) => updateField("day", e.target.value)}
            className={`w-full pl-3 py-[10px] rounded-[10px] border-2 focus:ring-1 outline-none transition-colors ${
              errors.day ? "border-red-500" : "border-[#DFDFDF] hover:border-[#AE2539] focus:border-[#AE2539]"
            }`}
          >
            <option value="">Day</option>
            {Array.from({ length: 31 }, (_, i) => (
              <option key={i + 1} value={i + 1}>{i + 1}</option>
            ))}
          </select>
          {errors.day && <p className="text-red-500 text-sm mt-1">{errors.day}</p>}
        </div>

        <div>
          <select
            value={formData.month}
            onChange={(e) => updateField("month", e.target.value)}
            className={`w-full pl-3 pr-4 py-[10px] rounded-[10px] border-2 focus:ring-1 outline-none transition-colors ${
              errors.month ? "border-red-500" : "border-[#DFDFDF] hover:border-[#AE2539] focus:border-[#AE2539]"
            }`}
          >
            <option value="">Month</option>
            {months.map((month) => (
              <option key={month} value={month}>{month}</option>
            ))}
          </select>
          {errors.month && <p className="text-red-500 text-sm mt-1">{errors.month}</p>}
        </div>

        <div>
          <select
            value={formData.year}
            onChange={(e) => updateField("year", e.target.value)}
            className={`w-full pl-3 pr-4 py-[10px] rounded-[10px] border-2 focus:ring-1 outline-none transition-colors ${
              errors.year ? "border-red-500" : "border-[#DFDFDF] hover:border-[#AE2539] focus:border-[#AE2539]"
            }`}
          >
            <option value="">Year</option>
            {years.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          {errors.year && <p className="text-red-500 text-sm mt-1">{errors.year}</p>}
        </div>
      </div>

      {/* Birth Place */}
      <div className="mt-6">
        <input
          type="text"
          value={formData.birthPlace}
          onChange={(e) => updateField("birthPlace", e.target.value)}
          placeholder="Place of Birth"
          className={`w-full py-[10px] px-3 rounded-[10px] border-2 outline-none transition-colors ${
            errors.birthPlace ? "border-red-500" : "border-[#DFDFDF] hover:border-[#AE2539] focus:border-[#AE2539]"
          }`}
        />
        {errors.birthPlace && (
          <p className="text-red-500 mt-1 text-sm">{errors.birthPlace}</p>
        )}
      </div>

      {/* Mother Tongue */}
      <div className="mt-6">
        <select
          value={formData.motherTongue}
          onChange={(e) => updateField("motherTongue", e.target.value)}
          className={`w-full pl-3 pr-4 py-[10px] rounded-[10px] border-2 outline-none transition-colors ${
            errors.motherTongue ? "border-red-500" : "border-[#DFDFDF] hover:border-[#AE2539] focus:border-[#AE2539]"
          }`}
        >
          <option value="">Mother Tongue</option>
          {motherTongues.map((lang) => (
            <option key={lang} value={lang}>{lang}</option>
          ))}
        </select>
        {errors.motherTongue && (
          <p className="text-red-500 mt-1 text-sm">{errors.motherTongue}</p>
        )}
      </div>

      {/* Gender */}
      <div className="mt-6">
        <label className="font-medium block mb-2 text-gray-700">Gender</label>
        <div className="grid grid-cols-2 gap-4">
          {["Male", "Female"].map((genderLabel) => {
            const genderValue = genderLabel.toLowerCase();
            return (
              <button
                key={genderLabel}
                type="button"
                onClick={() => updateField("gender", genderValue)}
                className={`border-2 rounded-xl py-3 transition-all font-medium ${
                  formData.gender === genderValue
                    ? "bg-[#ED5463] text-white border-[#ED5463]"
                    : "border-[#DFDFDF] text-gray-700 hover:border-[#EE7985]"
                }`}
              >
                {genderLabel}
              </button>
            );
          })}
        </div>
        {errors.gender && (
          <p className="text-red-500 mt-1 text-sm">{errors.gender}</p>
        )}
      </div>

      {/* Email */}
      <div className="mt-6">
        <input
          type="email"
          value={formData.email}
          onChange={(e) => updateField("email", e.target.value)}
          placeholder="Email Address"
          className={`w-full px-3 py-[10px] rounded-[10px] border-2 outline-none transition-colors ${
            errors.email ? "border-red-500" : "border-[#DFDFDF] hover:border-[#AE2539] focus:border-[#AE2539]"
          }`}
        />
        {errors.email && (
          <p className="text-red-500 mt-1 text-sm">{errors.email}</p>
        )}
      </div>

      {/* Password */}
      <div className="mt-6">
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={(e) => updateField("password", e.target.value)}
            placeholder="Create Password"
            className={`w-full px-3 py-[10px] rounded-[10px] border-2 outline-none transition-colors ${
              errors.password ? "border-red-500" : "border-[#DFDFDF] hover:border-[#AE2539] focus:border-[#AE2539]"
            }`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-3 text-gray-500 hover:text-gray-700 transition-colors"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        
        {/* Password Strength Indicator */}
        {formData.password && (
          <div className="flex gap-1 mt-2">
            {[1, 2, 3, 4, 5].map((level) => (
              <div
                key={level}
                className={`h-1.5 w-full rounded-full transition-colors ${
                  passwordStrength() >= level ? strengthColor() : "bg-gray-200"
                }`}
              />
            ))}
          </div>
        )}
        
        {errors.password && (
          <p className="text-red-500 mt-1 text-sm">{errors.password}</p>
        )}
      </div>

      {/* Submit Button */}
      <button
        onClick={handleNext}
        className="mt-10 w-full bg-[#ED5463] hover:bg-[#EE7985] transition-all text-white py-3 rounded-xl font-bold text-lg"
      >
        Next
      </button>
    </div>
  );
}
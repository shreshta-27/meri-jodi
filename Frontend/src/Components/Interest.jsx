import React from "react";
import { useNavigate } from "react-router-dom";
/* ---------------------------- */
/* Dropdown Data */
/* ---------------------------- */

const religions = [
  "Hindu",
  "Muslim",
  "Christian",
  "Sikh",
  "Jain",
  "Buddhist",
  "Parsi",
  "Other",
];

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
];

const educations = [
  "High School",
  "Diploma",
  "Bachelor's Degree",
  "Master's Degree",
  "MBA",
  "M.Tech",
  "PhD",
];

const occupations = [
  "Software Engineer",
  "Doctor",
  "Teacher",
  "Business",
  "Government Employee",
  "Lawyer",
  "Student",
  "Self Employed",
  "Other",
];

const incomeRanges = [
  "Below ₹2 LPA",
  "₹2 - ₹5 LPA",
  "₹5 - ₹10 LPA",
  "₹10 - ₹20 LPA",
  "₹20 - ₹35 LPA",
  "₹35 - ₹50 LPA",
  "Above ₹50 LPA",
];

/* ===========================================================
   Hobby Data
=========================================================== */

const hobbies = [
  "Travel",
  "Music",
  "Movies",
  "Reading",
  "Cooking",
  "Photography",
  "Gaming",
  "Cricket",
  "Football",
  "Badminton",
  "Gym",
  "Yoga",
  "Cycling",
  "Swimming",
  "Dancing",
  "Singing",
  "Writing",
  "Painting",
  "Hiking",
  "Trekking",
  "Meditation",
  "Pets",
  "Volunteering",
  "Technology",
  "Fashion",
  "Gardening",
  "Chess",
  "Shopping",
  "Adventure",
  "Blogging",
  "Coding",
  "Entrepreneurship",
  "Podcasts",
  "Fitness",
  "Art",
  "Nature",
];

const castes = {
  Hindu: [
    "Maratha",
    "Brahmin",
    "Rajput",
    "Yadav",
    "Agarwal",
    "Kshatriya",
    "Jat",
    "Lingayat",
    "Nair",
    "Reddy",
  ],
  Muslim: ["Sunni", "Shia", "Pathan", "Syed", "Sheikh"],
  Christian: ["Roman Catholic", "Protestant", "Orthodox"],
  Sikh: ["Jat Sikh", "Khatri", "Ramgarhia"],
  Jain: ["Digambar", "Shwetambar"],
  Buddhist: ["Navayana", "Theravada"],
  Other: [],
};


export default function Interest({
  formData,
  setFormData,
  errors,
  setErrors,
  submitForm,
}) {
  const [showAllHobbies, setShowAllHobbies] = React.useState(false);
   const navigate = useNavigate();
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

  const toggleSelection = (field, value) => {
    const current = formData[field] || [];

    if (current.includes(value)) {
      updateField(
        field,
        current.filter((item) => item !== value)
      );
    } else {
      updateField(field, [...current, value]);
    }
  };

  const validate = () => {
    let err = {};

    if (!formData.minAge) err.minAge = "Select minimum age";
    if (!formData.maxAge) err.maxAge = "Select maximum age";
    
    // Convert to Numbers to prevent string comparison bugs (e.g., "9" > "10")
    if (
      formData.minAge &&
      formData.maxAge &&
      Number(formData.minAge) > Number(formData.maxAge)
    ) {
      err.maxAge = "Maximum age should be greater than minimum age";
    }
    
    if (!formData.religion) err.religion = "Select religion";
    if (!formData.caste) err.caste = "Select caste";
    if (!formData.motherTongue) err.motherTongue = "Select mother tongue";
    if (!formData.partnereducation) err.partnereducation = "Select education";
    if (!formData.partneroccupation) err.partneroccupation = "Select occupation";
    if (!formData.partnerincome) err.partnerincome = "Select income";
    if (!formData.city) err.city = "Enter city";

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      await submitForm();
      navigate("/profile");
    } catch (err) {
      // submitForm already handles alerting errors, so just stop navigation
      console.error("Profile submission failed", err);
    }
  };
  

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header aligned with Personal Details */}
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-800">
          Select Your Preferences
        </h2>
        <p className="text-gray-500 mt-1 text-sm">
          Set your partner preferences to help us find suitable matches for you.
        </p>
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-pink-100 p-5">
        {/* AGE */}
        <div className="mb-4">
          <div className="grid grid-cols-2 gap-5">
            <div>
              <select
                value={formData.minAge}
                onChange={(e) => updateField("minAge", e.target.value)}
                className={`w-full h-14 rounded-xl border-2 px-4 focus:outline-none transition-all duration-300 ${
                  errors.minAge
                    ? "border-red-400"
                    : "border-[#DFDFDF] hover:border-[#AE2539]"
                }`}
              >
                <option value="">Minimum Age</option>
                {Array.from({ length: 43 }, (_, i) => 18 + i).map((age) => (
                  <option key={age} value={age}>{age}</option>
                ))}
              </select>
              {errors.minAge && (
                <p className="text-sm text-red-500 mt-2">{errors.minAge}</p>
              )}
            </div>

            <div>
              <select
                value={formData.maxAge}
                onChange={(e) => updateField("maxAge", e.target.value)}
                className={`w-full h-14 rounded-xl border-2 px-4 focus:outline-none transition-all duration-300 ${
                  errors.maxAge
                    ? "border-red-400"
                    : "border-[#DFDFDF] hover:border-[#AE2539]"
                }`}
              >
                <option value="">Maximum Age</option>
                {Array.from({ length: 43 }, (_, i) => 18 + i).map((age) => (
                  <option key={age} value={age}>{age}</option>
                ))}
              </select>
              {errors.maxAge && (
                <p className="text-sm text-red-500 mt-2">{errors.maxAge}</p>
              )}
            </div>
          </div>
        </div>

        {/* Religion & Caste */}
        <div className="grid md:grid-cols-2 gap-6 mb-4">
          <div>
            <select
              value={formData.religion}
              onChange={(e) => {
                updateField("religion", e.target.value);
                updateField("caste", ""); // Reset caste when religion changes
              }}
              className={`w-full h-14 rounded-xl border-2 px-4 focus:outline-none transition-all duration-300 ${
                errors.religion
                  ? "border-red-400"
                  : "border-[#DFDFDF] hover:border-[#AE2539]"
              }`}
            >
              <option value="">Select Religion</option>
              {religions.map((religion) => (
                <option key={religion} value={religion}>
                  {religion}
                </option>
              ))}
            </select>
            {errors.religion && (
              <p className="text-sm text-red-500 mt-2">{errors.religion}</p>
            )}
          </div>

          <div>
            <select
              value={formData.caste}
              onChange={(e) => updateField("caste", e.target.value)}
              disabled={!formData.religion}
              className={`w-full h-14 rounded-xl border-2 px-4 focus:outline-none transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                errors.caste
                  ? "border-red-400"
                  : "border-[#DFDFDF] hover:border-[#AE2539]"
              }`}
            >
              <option value="">Select Caste</option>
              {formData.religion &&
                castes[formData.religion]?.map((caste) => (
                  <option key={caste} value={caste}>{caste}</option>
                ))}
            </select>
            {errors.caste && (
              <p className="text-sm text-red-500 mt-2">{errors.caste}</p>
            )}
          </div>
        </div>

        {/* Mother Tongue */}
        <div className="mb-4">
          <select
            value={formData.motherTongue}
            onChange={(e) => updateField("motherTongue", e.target.value)}
            className={`w-full h-14 rounded-xl border-2 px-4 focus:outline-none transition-all duration-300 ${
              errors.motherTongue
                ? "border-red-400"
                : "border-[#DFDFDF] hover:border-[#AE2539]"
            }`}
          >
            <option value="">Select Mother Tongue</option>
            {motherTongues.map((lang) => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>
          {errors.motherTongue && (
            <p className="text-sm text-red-500 mt-2">{errors.motherTongue}</p>
          )}
        </div>

        {/* Education & Occupation */}
        <div className="grid md:grid-cols-2 gap-6 mb-4">
          <div>
            <select
              value={formData.partnereducation}
              onChange={(e) => updateField("partnereducation", e.target.value)}
              className={`w-full h-14 rounded-xl border-2 px-4 focus:outline-none transition-all duration-300 ${
                errors.partnereducation
                  ? "border-red-400"
                  : "border-[#DFDFDF] hover:border-[#AE2539]"
              }`}
            >
              <option value="">Select Education</option>
              {educations.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            {errors.education && (
              <p className="text-sm text-red-500 mt-2">{errors.education}</p>
            )}
          </div>

          <div>
            <select
              value={formData.partneroccupation}
              onChange={(e) => updateField("partneroccupation", e.target.value)}
              className={`w-full h-14 rounded-xl border-2 px-4 focus:outline-none transition-all duration-300 ${
                errors.partneroccupation
                  ? "border-red-400"
                  : "border-[#DFDFDF] hover:border-[#AE2539]"
              }`}
            >
              <option value="">Select Occupation</option>
              {occupations.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            {errors.occupation && (
              <p className="text-sm text-red-500 mt-2">{errors.occupation}</p>
            )}
          </div>
        </div>

        {/* Annual Income & City */}
        <div className="grid md:grid-cols-2 gap-6 mb-2">
          <div>
            <select
              value={formData.partnerincome}
              onChange={(e) => updateField("partnerincome", e.target.value)}
              className={`w-full h-14 rounded-xl border-2 px-4 focus:outline-none transition-all duration-300 ${
                errors.partnerincome
                  ? "border-red-400"
                  : "border-[#DFDFDF] hover:border-[#AE2539]"
              }`}
            >
              <option value="">Select Income</option>
              {incomeRanges.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            {errors.income && (
              <p className="text-sm text-red-500 mt-2">{errors.income}</p>
            )}
          </div>

          <div>
            <input
              type="text"
              value={formData.city}
              placeholder="Location"
              onChange={(e) => updateField("city", e.target.value)}
              className={`w-full h-14 rounded-xl border-2 px-4 focus:outline-none transition-all duration-300 ${
                errors.city
                  ? "border-red-400"
                  : "border-[#DFDFDF] hover:border-[#AE2539]"
              }`}
            />
            {errors.city && ( 
              <p className="text-sm text-red-500 mt-2">{errors.city}</p>
            )}
          </div>
        </div>

        {/* Hobbies */}
        <div className="mt-5">
          <h3 className="text-base font-medium text-[#1A1A1AB2] mb-2">
            Choose Hobbies & Interests
          </h3>
          <div className="flex flex-wrap gap-3">
            {(showAllHobbies ? hobbies : hobbies.slice(0, 12)).map((hobby) => (
              <button
                key={hobby}
                type="button"
                onClick={() => toggleSelection("hobbies", hobby)}
                className={`px-4 py-2 rounded-full border-2 transition-all duration-300 ${
                  formData.hobbies?.includes(hobby)
                    ? "bg-[#ED5463] text-white border-[#ED5463]"
                    : "border-[#DFDFDF] hover:border-[#AE2539] hover:text-[#AE2539] text-gray-600"
                }`}
              >
                {hobby}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setShowAllHobbies(!showAllHobbies)}
            className="mt-5 text-[#ED5463] font-medium hover:text-[#AE2539]"
          >
            {showAllHobbies ? "Show Less" : "Show More"}
          </button>
        </div>

        {/* Buttons */}
        <div className="  mt-4">
          {/* <button
            type="button"
            onClick={prevStep}
            className="flex items-center gap-2 px-8 py-3 rounded-xl border border-[#AE2539] text-[#ED5463] hover:bg-[#EE7985] hover:text-white transition-all font-medium"
          >
            Previous
          </button> */}

          <button
            type="button"
            onClick={handleSubmit}
            className="w-full py-3 rounded-xl bg-[#ED5463] text-white hover:bg-[#EE7985] transition-all shadow-lg font-medium"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
import  { useState } from "react";
import { useNavigate } from "react-router-dom";
import registerPageImage from "../assets/login-image.png";
import logo from "../assets/logo2.png";

const CompleteProfilePage = () => {
  const navigate = useNavigate();
  const [selectedOption, setSelectedOption] = useState("upload");

  return (
    <div className="min-h-screen w-full flex bg-white">
      {/* image div */}
      <div className="h-screen w-5/12 hidden lg:block">
        <img
          src={registerPageImage}
          alt="banner image"
          className="h-full w-full object-cover"
        />
      </div>

      {/* form div */}
      <div className="px-8 sm:px-16 lg:px-20 py-8 w-full lg:flex-1 flex flex-col justify-center">
        <div className="mb-12">
          <img src={logo} alt="logo" className="h-10" />
        </div>

        <div className="max-w-2xl">
          <div className="mb-10">
            <button
              onClick={() => navigate("/register")}
              className="text-sm text-[#ED5463] hover:text-[#D63E52] font-medium mb-6 flex items-center gap-1 transition-colors"
            >
              ← Go Back
            </button>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Complete Your Profile
            </h1>
            <p className="text-[#6B7280] text-sm">
              Choose how you would like to create your profile.
            </p>
          </div>

          <div className="space-y-4">
            {/* Upload Biodata Option */}
            <label className="flex items-start gap-4 p-6 border-2 border-[#E5E7EB] rounded-2xl cursor-pointer hover:border-[#ED5463] transition-colors"
              style={{borderColor: selectedOption === "upload" ? "#ED5463" : "#E5E7EB"}}
            >
              <input
                type="radio"
                name="profileOption"
                value="upload"
                checked={selectedOption === "upload"}
                onChange={(e) => setSelectedOption(e.target.value)}
                className="w-6 h-6 mt-1 cursor-pointer accent-[#ED5463]"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">
                  Upload Biodata
                </h3>
                <p className="text-sm text-[#6B7280]">
                  Already have a biodata PDF? Upload it and our AI will automatically extract and fill your profile details for a faster setup.
                </p>
              </div>
            </label>

            {/* Add Details Manually Option */}
            <label className="flex items-start gap-4 p-6 border-2 border-[#E5E7EB] rounded-2xl cursor-pointer hover:border-[#ED5463] transition-colors"
              style={{borderColor: selectedOption === "manual" ? "#ED5463" : "#E5E7EB"}}
            >
              <input
                type="radio"
                name="profileOption"
                value="manual"
                checked={selectedOption === "manual"}
                onChange={(e) => setSelectedOption(e.target.value)}
                className="w-6 h-6 mt-1 cursor-pointer accent-[#ED5463]"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">
                  Add Details Manually
                </h3>
                <p className="text-sm text-[#6B7280]">
                  Prefer to enter information yourself? Fill in your personal, professional, and partner preference details step by step.
                </p>
              </div>
            </label>
          </div>

          {/* Next & Skip Action Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              onClick={() => navigate("/home")}
              className="text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors order-2 sm:order-1 cursor-pointer"
            >
              Skip for now &rarr; Go to Dashboard
            </button>
            <button 
              onClick={() => {
                if (selectedOption === "upload") {
                  navigate("/upload-biodata");
                } else {
                  navigate("/add-details");
                }
              }}
              className="w-full sm:w-auto bg-[#ED5463] text-white px-8 py-3.5 rounded-full font-semibold hover:bg-[#D63E52] transition-colors order-1 sm:order-2 cursor-pointer shadow-md"
            >
              Continue to Details &rarr;
            </button>
          </div>

          {/* Help Section */}
          <div className="mt-12 flex items-center justify-center gap-3">
            <span className="text-sm text-[#6B7280]">Need Help? Call</span>
            <span className="text-sm font-semibold text-gray-900">22211333</span>
            {/* <div className="w-8 h-8 rounded-full bg-gray-300 overflow-hidden">
                Avatar placeholder 
              <div className="w-full h-full bg-gradient-to-br from-[#ED5463]  "></div>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompleteProfilePage;
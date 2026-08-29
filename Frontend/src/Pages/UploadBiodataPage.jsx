import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import registerPageImage from "../assets/login-image.png";
import logo from "../assets/logo2.png";
import axiosInstance from "../api/axiosInstance";

const UploadBiodataPage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (file) => {
    const validTypes = ["application/pdf", "image/jpeg", "image/png"];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!validTypes.includes(file.type)) {
      alert("Please upload PDF, JPG, or PNG files only");
      return;
    }

    if (file.size > maxSize) {
      alert("File size must be less than 10MB");
      return;
    }

    setUploadedFile(file);
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };
  

  const handleInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleGenerate = async () => {
    if (!uploadedFile) {
      setError("Please upload a biodata file first.");
      return;
    }

    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", uploadedFile);

    try {
      const response = await axiosInstance.post("/extraction/extract-biodata", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const result = response.data;
      if (!result.success) {
        const message = result.error || "Failed to extract biodata. Please try again.";
        setError(message);
        return;
      }

      navigate("/add-details", { state: { initialData: result.data } });
    } catch (err) {
      console.error(err);
      setError("An error occurred while uploading. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
              onClick={() => navigate("/complete-profile")}
              className="text-sm text-[#ED5463] hover:text-[#D63E52] font-medium mb-6 flex items-center gap-1 transition-colors"
            >
              ← Go Back
            </button>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Upload Biodata
            </h1>
            <p className="text-[#6B7280] text-sm">
              Upload your biodata PDF and our AI will automatically extract your
              details to create your profile quickly and accurately.
            </p>
          </div>

          {/* Upload Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-12 text-center transition-colors mb-8 ${
              isDragging
                ? "border-[#ED5463] bg-[#FEF2F2]"
                : "border-[#E5E7EB] bg-white"
            } ${uploadedFile ? "bg-[#F9FAFB]" : ""}`}
          >
            {uploadedFile ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 bg-[#ED5463] rounded-full flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <p className="text-gray-900 font-semibold">
                  {uploadedFile.name}
                </p>
                <p className="text-sm text-[#6B7280]">
                  {(uploadedFile.size / 1024).toFixed(2)} KB
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setUploadedFile(null);
                    fileInputRef.current?.click();
                  }}
                  className="text-[#ED5463] text-sm font-semibold hover:underline mt-2"
                >
                  Change File
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <svg
                  className="w-12 h-12 text-[#D1D5DB]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 16v-4m0 0V8m0 4h4m-4 0H8m4-12c4.42 0 8 3.58 8 8s-3.58 8-8 8-8-3.58-8-8 3.58-8 8-8z"
                  />
                </svg>
                <p className="text-gray-900 font-semibold">Drop PDF here</p>
                <p className="text-sm text-[#6B7280]">or</p>
                <button
                  type="button"
                  onClick={handleBrowseClick}
                  className="text-[#ED5463] font-semibold border border-[#ED5463] px-6 py-2 rounded-full hover:bg-[#FEF2F2] transition-colors"
                >
                  Browse Files
                </button>
                <p className="text-xs text-[#9CA3AF] mt-2">
                  PDF, JPG, PNG up to 10MB
                </p>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleInputChange}
              className="hidden"
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={!uploadedFile}
            className={`w-full rounded-full py-3 font-semibold text-white transition-all ${
              uploadedFile
                ? "bg-[#ED5463] hover:bg-[#D63E52] cursor-pointer"
                : "bg-[#ED5463] opacity-50 cursor-not-allowed"
            }`}
          >
            {loading ? "Processing..." : "Generate My Profile"}
          </button>

          {/* Help Section */}
          <div className="mt-12 flex items-center justify-center gap-3">
            <span className="text-sm text-[#6B7280]">Need Help? Call</span>
            <span className="text-sm font-semibold text-gray-900">
              22211333555
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadBiodataPage;
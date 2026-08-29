import { useState } from "react";

const BackButton = ({ onClick, label }) => (
    <button
      onClick={onClick}
      className="flex items-center text-gray-800 font-medium hover:text-gray-600 mb-6 transition-colors"
    >
      <svg
        className="w-5 h-5 mr-2"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10 19l-7-7m0 0l7-7m-7 7h18"
        />
      </svg>
      {label}
    </button>
  );

  const ShieldIcon = () => (
    <div className="flex justify-center mb-4">
      <div className="relative">
        <svg
          className="w-16 h-16 text-rose-700"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path
            fill="#fff"
            d="M10.5 14.5l-3-3 1.5-1.5 1.5 1.5 4.5-4.5 1.5 1.5-6 6z"
          />
        </svg>
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-white border border-rose-700 rounded-full px-2 py-0.5 flex space-x-0.5">
          {[...Array(5)].map((_, i) => (
            <svg
              key={i}
              className="w-2 h-2 text-rose-700"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
      </div>
    </div>
  );
  
const AuthModal = ({ isOpen, onClose }) => {
  // State Management
  const [currentView, setCurrentView] = useState("login"); // login, forgot, inbox, reset, success
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});

  // Validations
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (pass) => pass.length >= 6;

  // Handlers
  const handleLogin = (e) => {
    e.preventDefault();
    let newErrors = {};
    if (!email) newErrors.email = "Email is required";
    if (!password) newErrors.password = "Password is required";
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      console.log("Logging in with:", { email, password });
      // Add standard login logic here
    }
  };

  const handleGoogleLogin = async () => {
    try {
      // Implement Google Auth logic here (see Firebase example below)
      console.log("Initiating Google Auth...");
    } catch (error) {
      console.error("Google Auth Failed", error);
    }
  };

  const handleSendResetLink = (e) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      setErrors({ email: "Please enter a valid email address" });
      return;
    }
    setErrors({});
    setCurrentView("inbox");
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    let newErrors = {};
    if (!validatePassword(newPassword))
      newErrors.newPassword = "Password must be at least 6 characters";
    if (newPassword !== confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setCurrentView("success");
    }
  };

  // Reusable UI Components
  

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 sm:p-8 shadow-2xl relative">
        {/* VIEW: LOGIN */}
        {currentView === "login" && (
          <div className="animate-fade-in">
            <BackButton onClick={onClose} label="Login With email" />
            <ShieldIcon />
            <p className="text-center text-rose-700 text-sm font-medium mb-6">
              Enter your registered email address and password
            </p>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="Email / Phone Number"
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all text-sm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all text-sm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                </button>
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                )}
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setCurrentView("forgot")}
                  className="text-sm text-gray-600 hover:text-rose-600 font-medium"
                >
                  Forget Password ?
                </button>
              </div>

              <button
                type="submit"
                className="w-full bg-rose-200 hover:bg-rose-300 text-white font-semibold py-3 rounded-full transition-colors mt-2"
              >
                Log In
              </button>
            </form>

            <div className="mt-8 flex items-center justify-center">
              <div className="border-t border-gray-200 flex-grow"></div>
              <span className="px-4 text-gray-500 text-sm">OR</span>
              <div className="border-t border-gray-200 flex-grow"></div>
            </div>

            <button
              onClick={handleGoogleLogin}
              className="w-full mt-8 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-3 rounded-full flex items-center justify-center transition-colors"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </button>
          </div>
        )}

        {/* VIEW: FORGOT PASSWORD */}
        {currentView === "forgot" && (
          <div className="animate-fade-in">
            <BackButton
              onClick={() => setCurrentView("login")}
              label="Go Back"
            />
            <ShieldIcon />
            <h2 className="text-xl font-bold text-center text-gray-900 mt-4 mb-2">
              Forgot Password?
            </h2>
            <p className="text-center text-gray-500 text-sm mb-6 px-4">
              Enter your registered email address and we'll send you link to
              reset your password.
            </p>

            <form onSubmit={handleSendResetLink} className="space-y-6">
              <div>
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all text-sm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>
              <button
                type="submit"
                className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3 rounded-full transition-colors"
              >
                Send Reset Link
              </button>
            </form>
          </div>
        )}

        {/* VIEW: CHECK INBOX */}
        {currentView === "inbox" && (
          <div className="animate-fade-in text-center">
            <BackButton
              onClick={() => setCurrentView("forgot")}
              label="Go Back"
            />
            <ShieldIcon />
            <h2 className="text-xl font-bold text-gray-900 mt-4 mb-2">
              Check your inbox!
            </h2>
            <p className="text-gray-500 text-sm mb-6 px-4">
              A password reset link has been sent to{" "}
              <span className="font-semibold text-gray-800">
                {email || "example@gmail.com"}
              </span>
              <br />
              Please follow the instructions in the email to create a new
              password.
            </p>

            <button
              onClick={() => setCurrentView("reset")}
              className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3 rounded-full transition-colors mb-4"
            >
              Resend Email
            </button>
            <p className="text-sm text-gray-500">
              {email || "example@gmail.com"} not your email address?{" "}
              <button
                onClick={() => setCurrentView("forgot")}
                className="text-rose-600 font-semibold hover:underline"
              >
                Edit
              </button>
            </p>
          </div>
        )}

        {/* VIEW: RESET PASSWORD */}
        {currentView === "reset" && (
          <div className="animate-fade-in">
            <BackButton
              onClick={() => setCurrentView("login")}
              label="Go Back"
            />
            <ShieldIcon />
            <h2 className="text-xl font-bold text-center text-gray-900 mt-4 mb-2">
              Reset Your Password!
            </h2>
            <p className="text-center text-gray-500 text-sm mb-6">
              Create a new password for your account.
            </p>

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Enter your new password"
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all text-sm"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                </button>
                {errors.newPassword && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.newPassword}
                  </p>
                )}
              </div>

              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Re-enter new password"
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all text-sm"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                </button>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3 rounded-full transition-colors mt-2"
              >
                Reset Password
              </button>
            </form>
          </div>
        )}

        {/* VIEW: SUCCESS */}
        {currentView === "success" && (
          <div className="animate-fade-in text-center">
            <BackButton
              onClick={() => setCurrentView("login")}
              label="Go Back"
            />
            <ShieldIcon />
            <h2 className="text-xl font-bold text-gray-900 mt-4 mb-2">
              Password Reset Successful!
            </h2>
            <p className="text-gray-500 text-sm mb-8 px-4">
              Your password has been updated. You can now sign in using your new
              password.
            </p>

            <button
              onClick={() => setCurrentView("login")}
              className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3 rounded-full transition-colors"
            >
              Back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthModal;

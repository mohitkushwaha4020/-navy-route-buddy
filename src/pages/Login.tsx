import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

const Login = () => {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<"student" | "driver" | "admin">("student");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!identifier.trim() || !password.trim()) {
      toast.error("Please enter your email and password");
      return;
    }

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Admin Login - Hardcoded
    if (role === "admin") {
      if (identifier === "admin@busbay.com" && password === "admin123") {
        toast.success("Welcome, Admin!");
        navigate("/admin");
      } else {
        toast.error("Invalid admin credentials!");
      }
      setIsLoading(false);
      return;
    }

    // Driver Login - Check from localStorage
    if (role === "driver") {
      const storedBuses = localStorage.getItem("buses");
      const buses = storedBuses ? JSON.parse(storedBuses) : [];
      
      // Check if driver exists with matching email and password
      const driver = buses.find(
        (bus: any) => bus.driverEmail === identifier && bus.driverPassword === password
      );

      if (driver) {
        toast.success(`Welcome, ${driver.driver}!`);
        // Store driver info for dashboard
        localStorage.setItem("currentDriver", JSON.stringify(driver));
        navigate("/driver");
      } else {
        toast.error("Invalid driver credentials! Contact admin.");
      }
      setIsLoading(false);
      return;
    }

    // Student Login - Check from localStorage
    if (role === "student") {
      const storedStudents = localStorage.getItem("students");
      const students = storedStudents ? JSON.parse(storedStudents) : [];
      
      // Check email and password only
      const student = students.find(
        (s: any) => s.email === identifier && s.password === password
      );

      if (student) {
        toast.success(`Welcome, ${student.name}!`);
        // Store student info for dashboard
        localStorage.setItem("currentStudent", JSON.stringify(student));
        navigate("/student");
      } else {
        toast.error("Invalid student credentials! Contact admin.");
      }
      setIsLoading(false);
      return;
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#f0f9ff] flex flex-col">
      {/* Header Section - Navy Blue with Curved Bottom */}
      <div className="bg-[#1e3a8a] pt-12 sm:pt-16 pb-8 sm:pb-12 px-4 sm:px-6 rounded-b-[30px] shadow-lg">
        <div className="container mx-auto text-center">
          {/* Logo */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-md">
            <span className="text-3xl sm:text-4xl">🚌</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Navy Route Buddy</h1>
          <p className="text-xs sm:text-sm text-[#dbeafe]">Track your bus in real-time</p>
        </div>
      </div>

      {/* Login Card */}
      <div className="flex-1 px-4 sm:px-6 -mt-6">
        <div className="bg-white rounded-2xl shadow-xl p-5 sm:p-6 max-w-md mx-auto">
          <h2 className="text-xl sm:text-2xl font-bold text-[#1e293b] mb-1">Welcome Back!</h2>
          <p className="text-xs sm:text-sm text-gray-600 mb-5 sm:mb-6">Select your role to continue</p>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Role Selector */}
            <div className="flex gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => setRole("student")}
                className={`flex-1 py-3 sm:py-4 px-2 sm:px-3 rounded-xl border-2 transition-all ${
                  role === "student"
                    ? "bg-[#1e3a8a] border-[#1e3a8a] shadow-lg"
                    : "bg-[#f8fafc] border-[#e2e8f0]"
                }`}
              >
                <div className="text-2xl sm:text-3xl mb-1">🎓</div>
                <div className={`text-xs sm:text-sm font-semibold ${role === "student" ? "text-white" : "text-gray-600"}`}>
                  Student
                </div>
              </button>

              <button
                type="button"
                onClick={() => setRole("driver")}
                className={`flex-1 py-3 sm:py-4 px-2 sm:px-3 rounded-xl border-2 transition-all ${
                  role === "driver"
                    ? "bg-[#1e3a8a] border-[#1e3a8a] shadow-lg"
                    : "bg-[#f8fafc] border-[#e2e8f0]"
                }`}
              >
                <div className="text-2xl sm:text-3xl mb-1">🚗</div>
                <div className={`text-xs sm:text-sm font-semibold ${role === "driver" ? "text-white" : "text-gray-600"}`}>
                  Driver
                </div>
              </button>

              <button
                type="button"
                onClick={() => setRole("admin")}
                className={`flex-1 py-3 sm:py-4 px-2 sm:px-3 rounded-xl border-2 transition-all ${
                  role === "admin"
                    ? "bg-[#1e3a8a] border-[#1e3a8a] shadow-lg"
                    : "bg-[#f8fafc] border-[#e2e8f0]"
                }`}
              >
                <div className="text-2xl sm:text-3xl mb-1">👨‍💼</div>
                <div className={`text-xs sm:text-sm font-semibold ${role === "admin" ? "text-white" : "text-gray-600"}`}>
                  Admin
                </div>
              </button>
            </div>

            {/* Email Input */}
            <div className="flex items-center bg-[#f8fafc] rounded-xl px-3 sm:px-4 border border-[#e2e8f0]">
              <span className="text-lg sm:text-xl mr-2 sm:mr-3">📧</span>
              <input
                type="email"
                placeholder="Enter your email"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="flex-1 py-3 sm:py-4 bg-transparent outline-none text-[#1e293b] text-sm sm:text-base"
              />
            </div>

            {/* Password Input */}
            <div className="flex items-center bg-[#f8fafc] rounded-xl px-3 sm:px-4 border border-[#e2e8f0]">
              <span className="text-lg sm:text-xl mr-2 sm:mr-3">🔒</span>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="flex-1 py-3 sm:py-4 bg-transparent outline-none text-[#1e293b] text-sm sm:text-base"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="p-2 text-gray-500"
              >
                {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
              </button>
            </div>

            {/* Helper Text */}
            {role === "student" && (
              <div className="flex items-start bg-[#eff6ff] p-3 rounded-lg border-l-4 border-[#3b82f6]">
                <span className="text-lg mr-2">ℹ️</span>
                <p className="text-sm text-[#1e40af]">
                  Use credentials provided by admin
                </p>
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 text-white py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg shadow-lg disabled:opacity-60 transition-all"
            >
              {isLoading ? "⏳ Logging in..." : "🚀 Login"}
            </button>
          </form>

          {/* Demo Credentials - Role Specific */}
          <div className="mt-5 sm:mt-6 p-3 sm:p-4 bg-[#eff6ff] rounded-xl border border-[#bfdbfe]">
            <p className="text-xs font-semibold text-[#1e40af] mb-2 sm:mb-3 text-center">
              🎯 Demo Credentials - Click to Auto-fill
            </p>
            
            {/* Admin Credential */}
            {role === "admin" && (
              <button
                type="button"
                onClick={() => {
                  setIdentifier("admin@busbay.com");
                  setPassword("admin123");
                  toast.info("Admin credentials filled!");
                }}
                className="w-full bg-white hover:bg-gray-50 border border-[#1e3a8a] text-[#1e3a8a] py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg text-xs sm:text-sm font-medium transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 sm:gap-2">
                    <span className="text-base sm:text-lg">👨‍💼</span>
                    <span>Admin Demo Login</span>
                  </span>
                  <span className="text-[10px] sm:text-xs opacity-70">admin@busbay.com</span>
                </div>
              </button>
            )}

            {/* Driver Credential */}
            {role === "driver" && (
              <div>
                <button
                  type="button"
                  onClick={() => {
                    const storedBuses = localStorage.getItem("buses");
                    const buses = storedBuses ? JSON.parse(storedBuses) : [];
                    if (buses.length > 0 && buses[0].driverEmail && buses[0].driverPassword) {
                      setIdentifier(buses[0].driverEmail);
                      setPassword(buses[0].driverPassword);
                      toast.info(`${buses[0].driver} credentials filled!`);
                    } else {
                      setIdentifier("driver@busbay.com");
                      setPassword("driver123");
                      toast.info("Demo driver credentials filled!");
                    }
                  }}
                  className="w-full bg-white hover:bg-gray-50 border border-[#1e3a8a] text-[#1e3a8a] py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg text-xs sm:text-sm font-medium transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 sm:gap-2">
                      <span className="text-base sm:text-lg">🚗</span>
                      <span>Driver Demo Login</span>
                    </span>
                    <span className="text-[10px] sm:text-xs opacity-70">Auto-fill</span>
                  </div>
                </button>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Use credentials provided by admin
                </p>
              </div>
            )}

            {/* Student Credential */}
            {role === "student" && (
              <div>
                <button
                  type="button"
                  onClick={() => {
                    const storedStudents = localStorage.getItem("students");
                    const students = storedStudents ? JSON.parse(storedStudents) : [];
                    if (students.length > 0 && students[0].email && students[0].password) {
                      setIdentifier(students[0].email);
                      setPassword(students[0].password);
                      toast.info(`${students[0].name} credentials filled!`);
                    } else {
                      setIdentifier("student@busbay.com");
                      setPassword("student123");
                      toast.info("Demo student credentials filled!");
                    }
                  }}
                  className="w-full bg-white hover:bg-gray-50 border border-[#1e3a8a] text-[#1e3a8a] py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg text-xs sm:text-sm font-medium transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 sm:gap-2">
                      <span className="text-base sm:text-lg">🎓</span>
                      <span>Student Demo Login</span>
                    </span>
                    <span className="text-[10px] sm:text-xs opacity-70">Auto-fill</span>
                  </div>
                </button>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Use credentials provided by admin
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-500 text-xs sm:text-sm mt-4 sm:mt-6 pb-4">
          Secure • Real-time • Reliable
        </p>
      </div>
    </div>
  );
};

export default Login;

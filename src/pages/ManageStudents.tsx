import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, X, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

interface Student {
  id: number;
  name: string;
  email: string;
  password?: string;
  rollNo: string;
  phone?: string;
  status: "approved" | "pending";
  pickupPoint?: string;
  assignedBusId?: number;
}

const ManageStudents = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [buses, setBuses] = useState<any[]>([]);
  const [availableStops, setAvailableStops] = useState<string[]>([]);

  // Load students from localStorage on mount
  useEffect(() => {
    const storedStudents = localStorage.getItem("students");
    if (storedStudents) {
      setStudents(JSON.parse(storedStudents));
    }
    
    // Load buses for pickup point selection
    const storedBuses = localStorage.getItem("buses");
    if (storedBuses) {
      setBuses(JSON.parse(storedBuses));
      
      // Extract all unique stops from all buses
      const allStops = new Set<string>();
      JSON.parse(storedBuses).forEach((bus: any) => {
        if (bus.stops && Array.isArray(bus.stops)) {
          bus.stops.forEach((stop: string) => allStops.add(stop));
        }
      });
      setAvailableStops(Array.from(allStops).sort());
    }
  }, []);

  // Save students to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("students", JSON.stringify(students));
  }, [students]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    rollNo: "",
    phone: "",
    status: "pending" as "approved" | "pending",
    pickupPoint: "",
    assignedBusId: undefined as number | undefined,
  });

  const handleAdd = () => {
    if (!formData.name || !formData.email || !formData.rollNo || !formData.phone) {
      toast.error("Please fill all required fields!");
      return;
    }

    const newStudent: Student = {
      id: Date.now(),
      ...formData,
    };

    setStudents([...students, newStudent]);
    setShowAddModal(false);
    setFormData({ name: "", email: "", password: "", rollNo: "", phone: "", status: "pending", pickupPoint: "", assignedBusId: undefined });
    toast.success("Student added successfully!");
  };

  const handleKeyPress = (e: React.KeyboardEvent, nextFieldId?: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (nextFieldId) {
        const nextField = document.getElementById(nextFieldId);
        if (nextField) {
          nextField.focus();
        }
      }
    }
  };

  const handleApprove = (studentId: number) => {
    setStudents(students.map(student => 
      student.id === studentId 
        ? { ...student, status: "approved" as "approved" | "pending" }
        : student
    ));
    toast.success("Student approved!");
  };

  const openDetailsModal = (student: Student) => {
    setSelectedStudent(student);
    setShowDetailsModal(true);
  };

  const openEditModal = (student: Student) => {
    setSelectedStudent(student);
    setFormData({
      name: student.name,
      email: student.email,
      password: student.password || "",
      rollNo: student.rollNo,
      phone: student.phone || "",
      status: student.status,
      pickupPoint: student.pickupPoint || "",
      assignedBusId: student.assignedBusId,
    });
    setShowDetailsModal(false);
    setShowEditModal(true);
  };

  const handleEdit = () => {
    if (!selectedStudent || !formData.name || !formData.email || !formData.rollNo || !formData.phone) {
      toast.error("Please fill all required fields!");
      return;
    }

    setStudents(students.map(student => 
      student.id === selectedStudent.id 
        ? { ...student, ...formData }
        : student
    ));
    setShowEditModal(false);
    setSelectedStudent(null);
    setFormData({ name: "", email: "", password: "", rollNo: "", phone: "", status: "pending", pickupPoint: "", assignedBusId: undefined });
    toast.success("Student updated successfully!");
  };

  return (
    <div className="min-h-screen bg-[#f0f9ff]">
      {/* Header */}
      <header className="bg-[#1e3a8a] pt-8 sm:pt-12 pb-6 sm:pb-8 px-4 sm:px-6 rounded-b-[25px] shadow-lg">
        <div className="container mx-auto flex items-center gap-2 sm:gap-4">
          <button
            onClick={() => navigate("/admin")}
            className="text-white hover:bg-white/20 p-1.5 sm:p-2 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <div>
            <h1 className="text-xl sm:text-3xl font-bold text-white mb-0.5 sm:mb-1">Manage Students</h1>
            <p className="text-xs sm:text-sm text-[#dbeafe]">View and approve student registrations</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-7xl">
        {/* Add Student Button */}
        <button
          onClick={() => setShowAddModal(true)}
          className="mb-4 sm:mb-6 bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-medium flex items-center gap-2 shadow-lg transition-colors text-sm sm:text-base"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          Add New Student
        </button>

        {/* Students Grid */}
        {students.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-md">
            <div className="text-6xl mb-4">🎓</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No Students Yet</h3>
            <p className="text-gray-600">Click "Add New Student" to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {students.map((student) => (
            <div key={student.id} className="bg-white rounded-xl p-5 shadow-md">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-bold text-[#1e3a8a]">🎓 {student.name}</h3>
                  <p className="text-sm text-[#3b82f6]">{student.rollNo}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    student.status === "approved" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {student.status === "approved" ? "✅ Approved" : "⏳ Pending"}
                </span>
              </div>
              <div className="text-sm text-gray-600 mb-4">
                📧 {student.email}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => openEditModal(student)}
                  className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => openDetailsModal(student)}
                  className="flex-1 bg-[#f8fafc] hover:bg-gray-100 text-[#1e3a8a] py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  View Details
                </button>
                {student.status === "pending" && (
                  <button
                    onClick={() => handleApprove(student.id)}
                    className="flex-1 bg-green-50 hover:bg-green-100 text-green-600 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Approve
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        )}
      </main>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-[#1e3a8a]">Add New Student</h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                <input
                  id="studentName"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  onKeyPress={(e) => handleKeyPress(e, "studentEmail")}
                  placeholder="e.g., John Doe"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                <input
                  id="studentEmail"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  onKeyPress={(e) => handleKeyPress(e, "studentPassword")}
                  placeholder="e.g., john@example.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <input
                    id="studentPassword"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    onKeyPress={(e) => handleKeyPress(e, "studentRollNo")}
                    placeholder="Enter password"
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Roll Number *</label>
                <input
                  id="studentRollNo"
                  type="text"
                  value={formData.rollNo}
                  onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
                  onKeyPress={(e) => handleKeyPress(e, "studentPhone")}
                  placeholder="e.g., STU001"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                <input
                  id="studentPhone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="e.g., +1 234 567 8900"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pickup Point</label>
                <select
                  value={formData.pickupPoint}
                  onChange={(e) => {
                    setFormData({ ...formData, pickupPoint: e.target.value, assignedBusId: undefined });
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent outline-none"
                >
                  <option value="">Select Pickup Point</option>
                  {availableStops.map((stop) => (
                    <option key={stop} value={stop}>{stop}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Buses passing through this stop will be shown to student
                </p>
              </div>

              {formData.pickupPoint && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Assign Specific Bus (Optional)</label>
                  <select
                    value={formData.assignedBusId || ""}
                    onChange={(e) => setFormData({ ...formData, assignedBusId: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent outline-none"
                  >
                    <option value="">No specific bus</option>
                    {buses.filter(b => b.stops && b.stops.includes(formData.pickupPoint)).map((bus) => (
                      <option key={bus.id} value={bus.id}>
                        {bus.busNumber} - {bus.driver} ({bus.route})
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Leave empty to show all buses passing through this stop
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as "approved" | "pending" })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent outline-none"
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                className="flex-1 px-4 py-3 bg-[#1e3a8a] text-white rounded-lg hover:bg-[#1e3a8a]/90 transition-colors"
              >
                Add Student
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-[#1e3a8a]">Student Details</h2>
              <button onClick={() => setShowDetailsModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-center mb-6">
                <div className="w-24 h-24 bg-[#1e3a8a] rounded-full flex items-center justify-center text-4xl">
                  🎓
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between py-3 border-b border-gray-200">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium text-gray-900">{selectedStudent.name}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-200">
                  <span className="text-gray-600">Roll No:</span>
                  <span className="font-medium text-gray-900">{selectedStudent.rollNo}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-200">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium text-gray-900">{selectedStudent.email}</span>
                </div>
                <div className="flex justify-between py-3">
                  <span className="text-gray-600">Status:</span>
                  <span className={`font-medium ${selectedStudent.status === "approved" ? "text-green-600" : "text-yellow-600"}`}>
                    {selectedStudent.status === "approved" ? "✅ Approved" : "⏳ Pending"}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowDetailsModal(false)}
              className="w-full mt-6 px-4 py-3 bg-[#1e3a8a] text-white rounded-lg hover:bg-[#1e3a8a]/90 font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-[#1e3a8a]">Edit Student</h2>
              <button onClick={() => { setShowEditModal(false); setSelectedStudent(null); }} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., John Doe"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g., john@example.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Leave blank to keep current"
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Roll Number *</label>
                <input
                  type="text"
                  value={formData.rollNo}
                  onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
                  placeholder="e.g., STU001"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="e.g., +1 234 567 8900"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pickup Point</label>
                <select
                  value={formData.pickupPoint}
                  onChange={(e) => {
                    setFormData({ ...formData, pickupPoint: e.target.value, assignedBusId: undefined });
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent outline-none"
                >
                  <option value="">Select Pickup Point</option>
                  {availableStops.map((stop) => (
                    <option key={stop} value={stop}>{stop}</option>
                  ))}
                </select>
              </div>

              {formData.pickupPoint && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Assign Specific Bus (Optional)</label>
                  <select
                    value={formData.assignedBusId || ""}
                    onChange={(e) => setFormData({ ...formData, assignedBusId: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent outline-none"
                  >
                    <option value="">No specific bus</option>
                    {buses.filter(b => b.stops && b.stops.includes(formData.pickupPoint)).map((bus) => (
                      <option key={bus.id} value={bus.id}>
                        {bus.busNumber} - {bus.driver} ({bus.route})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as "approved" | "pending" })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent outline-none"
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setShowEditModal(false); setSelectedStudent(null); }}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEdit}
                className="flex-1 px-4 py-3 bg-[#1e3a8a] text-white rounded-lg hover:bg-[#1e3a8a]/90 transition-colors"
              >
                Update Student
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageStudents;

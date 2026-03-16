import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, X, Eye, EyeOff, Search } from "lucide-react";
import { toast } from "sonner";

interface Bus {
  id: number;
  busNumber: string;
  route: string;
  driver: string;
  status: "active" | "inactive";
  students?: number;
  currentLocation?: string;
  driverEmail?: string;
  driverPassword?: string;
  driverPhone?: string;
  stops?: string[];
  photo?: string;
}

const ManageBuses = () => {
  const navigate = useNavigate();
  const [buses, setBuses] = useState<Bus[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Load buses from localStorage on mount
  useEffect(() => {
    const storedBuses = localStorage.getItem("buses");
    if (storedBuses) {
      setBuses(JSON.parse(storedBuses));
    }
  }, []);

  // Save buses to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("buses", JSON.stringify(buses));
  }, [buses]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedBus, setSelectedBus] = useState<Bus | null>(null);
  const [formData, setFormData] = useState({
    busNumber: "",
    route: "",
    driver: "",
    driverEmail: "",
    driverPassword: "",
    driverPhone: "",
    status: "active" as "active" | "inactive",
    stops: [] as string[],
    photo: "",
  });
  const [newStop, setNewStop] = useState("");
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleAdd = () => {
    if (!formData.busNumber || !formData.driver || !formData.driverEmail || !formData.driverPhone) {
      toast.error("Please fill all required fields!");
      return;
    }

    const newBus: Bus = {
      id: Date.now(),
      ...formData,
      students: 0,
      currentLocation: "Parking",
    };

    setBuses([...buses, newBus]);
    setShowAddModal(false);
    resetForm();
    toast.success("Bus added successfully!");
  };

  const handleEdit = () => {
    if (!selectedBus || !formData.busNumber || !formData.driver || !formData.driverEmail || !formData.driverPhone) {
      toast.error("Please fill all required fields!");
      return;
    }

    setBuses(buses.map(bus => 
      bus.id === selectedBus.id 
        ? { ...bus, ...formData }
        : bus
    ));
    setShowEditModal(false);
    setSelectedBus(null);
    resetForm();
    toast.success("Bus updated successfully!");
  };

  const resetForm = () => {
    setFormData({
      busNumber: "",
      route: "",
      driver: "",
      driverEmail: "",
      driverPassword: "",
      driverPhone: "",
      status: "active",
      stops: [],
      photo: "",
    });
    setNewStop("");
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

  const handleAddStop = () => {
    if (newStop.trim()) {
      setFormData({ ...formData, stops: [...formData.stops, newStop.trim()] });
      setNewStop("");
    }
  };

  const handleRemoveStop = (index: number) => {
    setFormData({ ...formData, stops: formData.stops.filter((_, i) => i !== index) });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, photo: reader.result as string });
        setShowPhotoOptions(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTakePhoto = () => {
    // In a real app, this would open camera
    toast.info("Camera feature requires mobile device or webcam access");
    setShowPhotoOptions(false);
  };

  const handleDelete = () => {
    if (!selectedBus) return;

    setBuses(buses.filter(bus => bus.id !== selectedBus.id));
    setShowDeleteModal(false);
    setSelectedBus(null);
    toast.success("Bus deleted successfully!");
  };

  const openEditModal = (bus: Bus) => {
    setSelectedBus(bus);
    setFormData({
      busNumber: bus.busNumber,
      route: bus.route,
      driver: bus.driver,
      driverEmail: bus.driverEmail || "",
      driverPassword: bus.driverPassword || "",
      driverPhone: bus.driverPhone || "",
      status: bus.status,
      stops: bus.stops || [],
      photo: bus.photo || "",
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (bus: Bus) => {
    setSelectedBus(bus);
    setShowDeleteModal(true);
  };

  // Filter buses based on search query
  const filteredBuses = buses.filter(bus => 
    bus.busNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bus.driver.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bus.route?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bus.driverPhone?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            <h1 className="text-xl sm:text-3xl font-bold text-white mb-0.5 sm:mb-1">Manage Buses</h1>
            <p className="text-xs sm:text-sm text-[#dbeafe]">Add, edit, or remove buses</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-7xl">
        {/* Add Bus Button and Search */}
        <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row gap-3 sm:gap-4">
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-medium flex items-center justify-center gap-2 shadow-lg transition-colors text-sm sm:text-base"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            Add New Bus
          </button>
          
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by bus number, driver, route..."
              className="w-full pl-10 pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent outline-none text-sm sm:text-base"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Buses Grid */}
        {filteredBuses.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-md">
            <div className="text-6xl mb-4">🚌</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              {searchQuery ? "No Buses Found" : "No Buses Yet"}
            </h3>
            <p className="text-gray-600">
              {searchQuery 
                ? `No buses match "${searchQuery}"`
                : "Click \"Add New Bus\" to get started"
              }
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="mt-4 text-[#1e3a8a] hover:underline"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredBuses.map((bus) => (
            <div key={bus.id} className="bg-white rounded-xl p-5 shadow-md">
              {/* Bus Photo */}
              {bus.photo && (
                <div className="mb-3">
                  <img src={bus.photo} alt={bus.busNumber} className="w-full h-32 object-cover rounded-lg" />
                </div>
              )}
              
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-bold text-[#1e3a8a]">🚌 {bus.busNumber}</h3>
                  <p className="text-sm text-[#3b82f6]">{bus.route || "No route assigned"}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    bus.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {bus.status === "active" ? "🟢 Active" : "⭕ Inactive"}
                </span>
              </div>
              <div className="space-y-1 text-sm text-gray-600 mb-4">
                <div>👤 Driver: {bus.driver}</div>
                {bus.driverPhone && <div>📞 {bus.driverPhone}</div>}
                {bus.stops && bus.stops.length > 0 && (
                  <div>📍 {bus.stops.length} stops</div>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => openEditModal(bus)}
                  className="flex-1 bg-[#f8fafc] hover:bg-gray-100 text-[#1e3a8a] py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => openDeleteModal(bus)}
                  className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
        )}
      </main>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full my-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-[#1e3a8a]">🚌 Add New Bus</h2>
              <button onClick={() => { setShowAddModal(false); resetForm(); }} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              {/* Photo Upload Section */}
              <div className="text-center">
                <label className="block text-sm font-medium text-gray-700 mb-3">Bus Photo</label>
                {formData.photo ? (
                  <div className="relative inline-block">
                    <img src={formData.photo} alt="Bus" className="w-32 h-32 rounded-xl object-cover border-2 border-[#1e3a8a]" />
                    <button
                      onClick={() => setFormData({ ...formData, photo: "" })}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <button
                      onClick={() => setShowPhotoOptions(!showPhotoOptions)}
                      className="w-32 h-32 mx-auto border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center hover:border-[#1e3a8a] transition-colors"
                    >
                      <span className="text-4xl mb-2">📷</span>
                      <span className="text-xs text-gray-600">Add Photo</span>
                    </button>
                    
                    {showPhotoOptions && (
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 p-2 z-10 w-48">
                        <label className="block w-full text-left px-4 py-3 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoUpload}
                            className="hidden"
                          />
                          <span className="flex items-center gap-2">
                            <span>🖼️</span>
                            <span>Upload from Gallery</span>
                          </span>
                        </label>
                        <button
                          onClick={handleTakePhoto}
                          className="w-full text-left px-4 py-3 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <span className="flex items-center gap-2">
                            <span>📸</span>
                            <span>Take a Photo</span>
                          </span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Bus Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bus Number *</label>
                <input
                  id="busNumber"
                  type="text"
                  value={formData.busNumber}
                  onChange={(e) => setFormData({ ...formData, busNumber: e.target.value })}
                  onKeyPress={(e) => handleKeyPress(e, "driverName")}
                  placeholder="e.g., BUS-001"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent outline-none"
                />
              </div>

              {/* Driver Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Driver Name *</label>
                <input
                  id="driverName"
                  type="text"
                  value={formData.driver}
                  onChange={(e) => setFormData({ ...formData, driver: e.target.value })}
                  onKeyPress={(e) => handleKeyPress(e, "driverEmail")}
                  placeholder="e.g., John Doe"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent outline-none"
                />
              </div>

              {/* Driver Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Driver Email *</label>
                <input
                  id="driverEmail"
                  type="email"
                  value={formData.driverEmail}
                  onChange={(e) => setFormData({ ...formData, driverEmail: e.target.value })}
                  onKeyPress={(e) => handleKeyPress(e, "driverPassword")}
                  placeholder="e.g., driver@example.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent outline-none"
                />
              </div>

              {/* Driver Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Driver Password</label>
                <div className="relative">
                  <input
                    id="driverPassword"
                    type={showPassword ? "text" : "password"}
                    value={formData.driverPassword}
                    onChange={(e) => setFormData({ ...formData, driverPassword: e.target.value })}
                    onKeyPress={(e) => handleKeyPress(e, "driverPhone")}
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

              {/* Driver Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Driver Phone *</label>
                <input
                  id="driverPhone"
                  type="tel"
                  value={formData.driverPhone}
                  onChange={(e) => setFormData({ ...formData, driverPhone: e.target.value })}
                  onKeyPress={(e) => handleKeyPress(e, "routeName")}
                  placeholder="e.g., +1 234 567 8900"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent outline-none"
                />
              </div>

              {/* Route Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Route Name</label>
                <input
                  id="routeName"
                  type="text"
                  value={formData.route}
                  onChange={(e) => setFormData({ ...formData, route: e.target.value })}
                  onKeyPress={(e) => handleKeyPress(e, "stopInput")}
                  placeholder="e.g., Route A"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent outline-none"
                />
              </div>

              {/* Route Stops */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Route Stops</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newStop}
                    onChange={(e) => setNewStop(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddStop())}
                    placeholder="Enter stop name"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent outline-none"
                  />
                  <button
                    onClick={handleAddStop}
                    className="px-4 py-3 bg-[#1e3a8a] text-white rounded-xl hover:bg-[#1e3a8a]/90 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                {formData.stops.length > 0 && (
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {formData.stops.map((stop, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg">
                        <span className="text-sm">📍 {stop}</span>
                        <button
                          onClick={() => handleRemoveStop(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as "active" | "inactive" })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent outline-none"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setShowAddModal(false); resetForm(); }}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                className="flex-1 px-4 py-3 bg-[#1e3a8a] text-white rounded-xl hover:bg-[#1e3a8a]/90 transition-colors"
              >
                Add Bus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal - Same as Add Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full my-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-[#1e3a8a]">✏️ Edit Bus</h2>
              <button onClick={() => { setShowEditModal(false); resetForm(); }} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              {/* Photo Upload Section */}
              <div className="text-center">
                <label className="block text-sm font-medium text-gray-700 mb-3">Bus Photo</label>
                {formData.photo ? (
                  <div className="relative inline-block">
                    <img src={formData.photo} alt="Bus" className="w-32 h-32 rounded-xl object-cover border-2 border-[#1e3a8a]" />
                    <button
                      onClick={() => setFormData({ ...formData, photo: "" })}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <button
                      onClick={() => setShowPhotoOptions(!showPhotoOptions)}
                      className="w-32 h-32 mx-auto border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center hover:border-[#1e3a8a] transition-colors"
                    >
                      <span className="text-4xl mb-2">📷</span>
                      <span className="text-xs text-gray-600">Add Photo</span>
                    </button>
                    
                    {showPhotoOptions && (
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 p-2 z-10 w-48">
                        <label className="block w-full text-left px-4 py-3 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoUpload}
                            className="hidden"
                          />
                          <span className="flex items-center gap-2">
                            <span>🖼️</span>
                            <span>Upload from Gallery</span>
                          </span>
                        </label>
                        <button
                          onClick={handleTakePhoto}
                          className="w-full text-left px-4 py-3 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <span className="flex items-center gap-2">
                            <span>📸</span>
                            <span>Take a Photo</span>
                          </span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Bus Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bus Number *</label>
                <input
                  id="editBusNumber"
                  type="text"
                  value={formData.busNumber}
                  onChange={(e) => setFormData({ ...formData, busNumber: e.target.value })}
                  onKeyPress={(e) => handleKeyPress(e, "editDriverName")}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent outline-none"
                />
              </div>

              {/* Driver Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Driver Name *</label>
                <input
                  id="editDriverName"
                  type="text"
                  value={formData.driver}
                  onChange={(e) => setFormData({ ...formData, driver: e.target.value })}
                  onKeyPress={(e) => handleKeyPress(e, "editDriverEmail")}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent outline-none"
                />
              </div>

              {/* Driver Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Driver Email *</label>
                <input
                  id="editDriverEmail"
                  type="email"
                  value={formData.driverEmail}
                  onChange={(e) => setFormData({ ...formData, driverEmail: e.target.value })}
                  onKeyPress={(e) => handleKeyPress(e, "editDriverPassword")}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent outline-none"
                />
              </div>

              {/* Driver Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Driver Password</label>
                <div className="relative">
                  <input
                    id="editDriverPassword"
                    type={showPassword ? "text" : "password"}
                    value={formData.driverPassword}
                    onChange={(e) => setFormData({ ...formData, driverPassword: e.target.value })}
                    onKeyPress={(e) => handleKeyPress(e, "editDriverPhone")}
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

              {/* Driver Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Driver Phone *</label>
                <input
                  id="editDriverPhone"
                  type="tel"
                  value={formData.driverPhone}
                  onChange={(e) => setFormData({ ...formData, driverPhone: e.target.value })}
                  onKeyPress={(e) => handleKeyPress(e, "editRouteName")}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent outline-none"
                />
              </div>

              {/* Route Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Route Name</label>
                <input
                  id="editRouteName"
                  type="text"
                  value={formData.route}
                  onChange={(e) => setFormData({ ...formData, route: e.target.value })}
                  onKeyPress={(e) => handleKeyPress(e, "editStopInput")}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent outline-none"
                />
              </div>

              {/* Route Stops */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Route Stops</label>
                <div className="flex gap-2 mb-2">
                  <input
                    id="editStopInput"
                    type="text"
                    value={newStop}
                    onChange={(e) => setNewStop(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddStop())}
                    placeholder="Enter stop name"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddStop}
                    className="px-4 py-3 bg-[#1e3a8a] text-white rounded-xl hover:bg-[#1e3a8a]/90 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                {formData.stops.length > 0 && (
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {formData.stops.map((stop, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg">
                        <span className="text-sm">📍 {stop}</span>
                        <button
                          onClick={() => handleRemoveStop(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as "active" | "inactive" })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent outline-none"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setShowEditModal(false); resetForm(); }}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEdit}
                className="flex-1 px-4 py-3 bg-[#1e3a8a] text-white rounded-xl hover:bg-[#1e3a8a]/90 transition-colors"
              >
                Update Bus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedBus && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">⚠️</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Delete Bus?</h2>
              <p className="text-gray-600">
                Are you sure you want to delete <span className="font-semibold">{selectedBus.busNumber}</span>? This action cannot be undone.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageBuses;

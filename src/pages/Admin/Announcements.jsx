import React, { useState, useEffect } from "react";
import axios from "axios";

const AddAnnouncementForm = ({ onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    startDate: "",
    endDate: "",
    type: "General",
    isActive: true
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("You must be logged in to add an announcement");
        return;
      }

      const response = await axios.post(
        "https://localhost:7098/api/Announcement",
        {
          ...formData,
          startDate: new Date(formData.startDate).toISOString(),
          endDate: new Date(formData.endDate).toISOString()
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        onAdd(response.data.data);
        onClose();
      } else {
        throw new Error(response.data.message || 'Failed to add announcement');
      }
    } catch (error) {
      console.error("Error adding announcement:", error);
      alert(error.response?.data?.message || 'Error adding announcement');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-800">
          Add New Announcement
        </h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          ✕
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter announcement title..."
          />
        </div>
        <div>
          <label
            htmlFor="message"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Message
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows="3"
            placeholder="Enter your announcement message..."
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="startDate"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Start Date
            </label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label
              htmlFor="endDate"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              End Date
            </label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        <div>
          <label
            htmlFor="type"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Type
          </label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="General">General</option>
            <option value="Promotion">Promotion</option>
            <option value="Event">Event</option>
            <option value="Maintenance">Maintenance</option>
          </select>
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isActive"
            name="isActive"
            checked={formData.isActive}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label
            htmlFor="isActive"
            className="ml-2 block text-sm text-gray-700"
          >
            Active
          </label>
        </div>
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-gradient-to-r from-[#3B6CF7] to-[#4A7CFA] text-white rounded-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-95 shadow-md hover:shadow-[#3B6CF7]/30"
          >
            Add Announcement
          </button>
        </div>
      </form>
    </div>
  );
};

const EditAnnouncementForm = ({ announcement, onClose, onEdit }) => {
  const [formData, setFormData] = useState({
    title: announcement.title,
    message: announcement.message,
    startDate: announcement.startDate?.split('T')[0],
    endDate: announcement.endDate?.split('T')[0],
    type: announcement.type,
    isActive: announcement.isActive
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `https://localhost:7098/api/Announcement/${announcement.id}`,
        {
          ...formData,
          startDate: new Date(formData.startDate).toISOString(),
          endDate: new Date(formData.endDate).toISOString()
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        onEdit(response.data.data);
        onClose();
      } else {
        throw new Error(response.data.message || 'Failed to update announcement');
      }
    } catch (error) {
      console.error("Error updating announcement:", error);
      alert(error.response?.data?.message || 'Error updating announcement');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-800">
          Edit Announcement
        </h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          ✕
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label
            htmlFor="message"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Message
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows="3"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="startDate"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Start Date
            </label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label
              htmlFor="endDate"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              End Date
            </label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        <div>
          <label
            htmlFor="type"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Type
          </label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="General">General</option>
            <option value="Promotion">Promotion</option>
            <option value="Event">Event</option>
            <option value="Maintenance">Maintenance</option>
          </select>
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isActive"
            name="isActive"
            checked={formData.isActive}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label
            htmlFor="isActive"
            className="ml-2 block text-sm text-gray-700"
          >
            Active
          </label>
        </div>
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-gradient-to-r from-[#3B6CF7] to-[#4A7CFA] text-white rounded-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-95 shadow-md hover:shadow-[#3B6CF7]/30"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await axios.get("https://localhost:7098/api/Announcement");
      if (response.data.success) {
        setAnnouncements(response.data.data || []);
        setError(null);
      } else {
        throw new Error(response.data.message || 'Failed to fetch announcements');
      }
    } catch (error) {
      console.error("Error fetching announcements:", error);
      setError("Failed to load announcements. Please try again later.");
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleAdd = async (newAnnouncement) => {
    await fetchAnnouncements();
  };

  const handleEdit = async (editedAnnouncement) => {
    await fetchAnnouncements();
  };

  const handleRemove = async (id) => {
    if (!window.confirm("Are you sure you want to delete this announcement?")) return;

    try {
      const token = localStorage.getItem("token");
      const response = await axios.delete(
        `https://localhost:7098/api/Announcement/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        await fetchAnnouncements();
      } else {
        throw new Error(response.data.message || 'Failed to delete announcement');
      }
    } catch (error) {
      console.error("Error deleting announcement:", error);
      alert(error.response?.data?.message || 'Error deleting announcement');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">Announcements</h2>
        <p className="text-gray-600 mt-1">Manage your store announcements</p>
        <div className="flex justify-center items-center h-64 bg-white rounded-lg shadow-sm">
          <div className="animate-pulse flex space-x-4">
            <div className="rounded-full bg-gray-200 h-12 w-12"></div>
            <div className="flex-1 space-y-4 py-1">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">Announcements</h2>
        <p className="text-gray-600 mt-1">Manage your store announcements</p>
        <div className="flex justify-center items-center h-64 bg-white rounded-lg shadow-sm">
          <div className="text-center">
            <p className="text-red-500 font-medium mb-4">{error}</p>
            <button
              onClick={fetchAnnouncements}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors duration-200"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Announcements</h2>
      <p className="text-gray-600 mt-1">Manage your store announcements</p>
      <div className="flex justify-between items-center">
        <div></div>
        {!showForm && !editingAnnouncement && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-gradient-to-r from-[#3B6CF7] to-[#4A7CFA] text-white rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-95 shadow-md hover:shadow-[#3B6CF7]/30"
          >
            + Add Announcement
          </button>
        )}
      </div>

      {showForm && (
        <AddAnnouncementForm
          onClose={() => setShowForm(false)}
          onAdd={handleAdd}
        />
      )}

      {editingAnnouncement && (
        <EditAnnouncementForm
          announcement={editingAnnouncement}
          onClose={() => setEditingAnnouncement(null)}
          onEdit={handleEdit}
        />
      )}

      {!showForm && !editingAnnouncement && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="divide-y divide-gray-200">
            {announcements.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No announcements found. Add your first announcement to get started.
              </div>
            ) : (
              announcements.map((announcement) => (
                <div
                  key={announcement.id}
                  className="p-6 hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-left text-lg font-medium text-gray-900">
                        {announcement.title}
                      </h3>
                      <p className="text-left text-gray-600 mt-1">{announcement.message}</p>
                      <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                        <span>Type: {announcement.type}</span>
                        <span>•</span>
                        <span>Start: {new Date(announcement.startDate).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>End: {new Date(announcement.endDate).toLocaleDateString()}</span>
                        <span>•</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          announcement.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}>
                          {announcement.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => setEditingAnnouncement(announcement)}
                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleRemove(announcement.id)}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Announcements;

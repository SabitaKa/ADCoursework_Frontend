import React, { useState } from "react";

const AddOrderForm = ({ onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    member: "",
    items: "",
    status: "Pending"
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd({
      id: Date.now(), // temporary ID generation
      member: formData.member,
      items: parseInt(formData.items),
      status: formData.status
    });
    onClose();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-800">
          Add New Order
        </h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          ✕
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="member"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Member Name
          </label>
          <input
            type="text"
            id="member"
            name="member"
            value={formData.member}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter member name..."
          />
        </div>
        <div>
          <label
            htmlFor="items"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Number of Items
          </label>
          <input
            type="number"
            id="items"
            name="items"
            value={formData.items}
            onChange={handleChange}
            required
            min="1"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label
            htmlFor="status"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Order Status
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
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
            Add Order
          </button>
        </div>
      </form>
    </div>
  );
};

const EditOrderForm = ({ order, onClose, onEdit }) => {
  const [formData, setFormData] = useState({
    member: order.member,
    items: order.items,
    status: order.status
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onEdit({
      ...order,
      ...formData,
      items: parseInt(formData.items)
    });
    onClose();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-800">
          Edit Order
        </h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          ✕
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="member"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Member Name
          </label>
          <input
            type="text"
            id="member"
            name="member"
            value={formData.member}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label
            htmlFor="items"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Number of Items
          </label>
          <input
            type="number"
            id="items"
            name="items"
            value={formData.items}
            onChange={handleChange}
            required
            min="1"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label
            htmlFor="status"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Order Status
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
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

const Orders = () => {
  const [orders, setOrders] = useState([
    { id: 101, member: "Usha Gurung", items: 3, status: "Pending" },
    { id: 102, member: "Ram Shah", items: 1, status: "Completed" },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);

  const handleDelete = (id) => {
    setOrders((prev) => prev.filter((order) => order.id !== id));
  };

  const handleEdit = (editedOrder) => {
    setOrders((prev) =>
      prev.map((order) => (order.id === editedOrder.id ? editedOrder : order))
    );
  };

  const handleAdd = (newOrder) => {
    setOrders((prev) => [...prev, newOrder]);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Manage Orders</h2>
      <p className="text-gray-600 mb-4">Add, edit, and delete orders.</p>

      <div className="flex justify-between items-center mb-6">
        <div></div>
        {!showForm && !editingOrder && (
          <button 
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-gradient-to-r from-[#3B6CF7] to-[#4A7CFA] text-white rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-95 shadow-md hover:shadow-[#3B6CF7]/30"
          >
            + Add Order
          </button>
        )}
      </div>

      {showForm && (
        <AddOrderForm
          onClose={() => setShowForm(false)}
          onAdd={handleAdd}
        />
      )}

      {editingOrder && (
        <EditOrderForm
          order={editingOrder}
          onClose={() => setEditingOrder(null)}
          onEdit={handleEdit}
        />
      )}

      {!showForm && !editingOrder && (
        <table className="w-full table-auto bg-white rounded shadow">
          <thead className="bg-gray-100 text-gray-700 text-left">
            <tr>
              <th className="p-4 text-center">Order ID</th>
              <th className="p-4 text-center">Member</th>
              <th className="p-4 text-center">Items</th>
              <th className="p-4 text-center">Status</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id} className="border-t hover:bg-gray-50">
                <td className="p-4 text-center">{order.id}</td>
                <td className="p-4 text-center">{order.member}</td>
                <td className="p-4 text-center">{order.items}</td>
                <td className="p-4 text-center">
                  <span className={`text-sm font-medium ${order.status === "Completed" ? "text-green-600" : "text-yellow-600"}`}>
                    {order.status}
                  </span>
                </td>
                <td className="p-4 text-center space-x-3">
                  <button 
                    onClick={() => setEditingOrder(order)}
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(order.id)}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Orders;

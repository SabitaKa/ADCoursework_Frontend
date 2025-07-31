import { useState, useEffect } from "react"
import axios from "axios"
import { Percent } from "lucide-react"

const Discounts = () => {
  const [discounts, setDiscounts] = useState([])
  const [books, setBooks] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingDiscount, setEditingDiscount] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [toast, setToast] = useState({ show: false, message: '', type: '' })
  const [form, setForm] = useState({
    bookId: "",
    discountPercentage: "",
    startDate: "",
    endDate: ""
  })

  // Show toast message
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type })
    setTimeout(() => {
      setToast({ show: false, message: '', type: '' })
    }, 3000)
  }

  // Fetch all discounts
  const fetchDiscounts = async () => {
    try {
      setLoading(true)
      const response = await axios.get("https://localhost:7098/api/discounts", {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      if (response.data.success) {
        setDiscounts(response.data.data || [])
        setError(null)
      } else {
        throw new Error(response.data.message || 'Failed to fetch discounts')
      }
    } catch (error) {
      console.error("Error fetching discounts:", error)
      setError("Failed to load discounts. Please try again later.")
      setDiscounts([])
    } finally {
      setLoading(false)
    }
  }

  // Fetch all books
  const fetchBooks = async () => {
    try {
      const response = await axios.get("https://localhost:7098/api/books/all")
      setBooks(response.data.data?.items || [])
    } catch (error) {
      console.error("Error fetching books:", error)
    }
  }

  useEffect(() => {
    fetchDiscounts()
    fetchBooks()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm({
      ...form,
      [name]: value,
    })
  }

  // Add new discount
  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        showToast("You must be logged in to add a discount", "error")
        return
      }

      const response = await axios.post("https://localhost:7098/api/discounts/add", {
        ...form,
        startDate: new Date(form.startDate).toISOString(),
        endDate: new Date(form.endDate).toISOString()
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.data.success) {
        await fetchDiscounts()
        setShowForm(false)
        resetForm()
        showToast('Discount added successfully!')
      } else {
        throw new Error(response.data.message || 'Failed to add discount')
      }
    } catch (error) {
      console.error("Error adding discount:", error)
      showToast(error.response?.data?.message || 'Error adding discount', 'error')
    }
  }

  // Edit discount
  const handleEdit = async (e) => {
    e.preventDefault()

    try {
      const token = localStorage.getItem("token")
      const response = await axios.put(`https://localhost:7098/api/discounts/${editingDiscount.id}/update`, {
        ...form,
        startDate: new Date(form.startDate).toISOString(),
        endDate: new Date(form.endDate).toISOString()
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.data.success) {
        await fetchDiscounts()
        setEditingDiscount(null)
        resetForm()
        showToast('Discount updated successfully!')
      } else {
        throw new Error(response.data.message || 'Failed to update discount')
      }
    } catch (error) {
      console.error("Error updating discount:", error)
      showToast(error.response?.data?.message || 'Error updating discount', 'error')
    }
  }

  // Delete discount
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this discount?")) return

    try {
      const token = localStorage.getItem("token")
      const response = await axios.delete(`https://localhost:7098/api/discounts/${id}/delete`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.data.success) {
        await fetchDiscounts()
        showToast('Discount deleted successfully!')
      } else {
        throw new Error(response.data.message || 'Failed to delete discount')
      }
    } catch (error) {
      console.error("Error deleting discount:", error)
      showToast(error.response?.data?.message || 'Error deleting discount', 'error')
    }
  }

  const resetForm = () => {
    setForm({
      bookId: "",
      discountPercentage: "",
      startDate: "",
      endDate: ""
    })
  }

  const startEditing = (discount) => {
    setEditingDiscount(discount)
    setForm({
      bookId: discount.bookId,
      discountPercentage: discount.discountPercentage,
      startDate: discount.startDate?.split('T')[0],
      endDate: discount.endDate?.split('T')[0]
    })
  }

  if (loading) {
    return (
      <div className="p-8 bg-gray-50 min-h-screen">
        <h2 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-4">Manage Discounts</h2>
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
    )
  }

  if (error) {
    return (
      <div className="p-8 bg-gray-50 min-h-screen">
        <h2 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-4">Manage Discounts</h2>
        <div className="flex justify-center items-center h-64 bg-white rounded-lg shadow-sm">
          <div className="text-center">
            <p className="text-red-500 font-medium mb-4">{error}</p>
            <button
              onClick={fetchDiscounts}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors duration-200"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${
          toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'
        } text-white`}>
          {toast.message}
        </div>
      )}

      <h2 className="text-3xl font-bold mb-2 text-gray-800">Manage Discounts</h2>
      <p className="text-gray-600 mb-6 pb-4 border-b">Add, edit, and delete discounts for books.</p>

      <div className="flex justify-between items-center mb-6">
        <div className="text-sm text-gray-500">
          {discounts.length} {discounts.length === 1 ? "discount" : "discounts"} active
        </div>
        {!showForm && !editingDiscount && (
          <button
            className="px-5 py-2.5 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors duration-200 shadow-sm flex items-center font-medium"
            onClick={() => setShowForm(true)}
          >
            <span className="mr-1 text-lg">+</span> Add Discount
          </button>
        )}
      </div>

      {showForm || editingDiscount ? (
        <div className="bg-white p-8 rounded-lg shadow-md mb-8 border border-gray-100">
          <h3 className="text-xl font-bold mb-6 text-gray-800 pb-2 border-b">
            {editingDiscount ? "Edit Discount" : "Add New Discount"}
          </h3>
          <form onSubmit={editingDiscount ? handleEdit : handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Book</label>
              <select
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                name="bookId"
                value={form.bookId}
                onChange={handleChange}
                required
              >
                <option value="">Select a book</option>
                {books.map((book) => (
                  <option key={book.id} value={book.id}>
                    {book.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Discount Percentage</label>
              <div className="relative">
                <input
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  name="discountPercentage"
                  value={form.discountPercentage}
                  onChange={handleChange}
                  required
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <Percent className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                type="date"
                name="startDate"
                value={form.startDate}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                type="date"
                name="endDate"
                value={form.endDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="md:col-span-2 flex justify-end gap-4 mt-6 pt-4 border-t">
              <button
                type="button"
                onClick={() => {
                  if (editingDiscount) {
                    setEditingDiscount(null)
                  } else {
                    setShowForm(false)
                  }
                  resetForm()
                }}
                className="px-5 py-2.5 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors duration-200 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-sm font-medium"
              >
                {editingDiscount ? "Update Discount" : "Add Discount"}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow-md">
          <table className="w-full table-auto">
            <thead className="bg-gray-100 text-gray-700 text-left">
              <tr>
                <th className="px-6 text-left py-4 font-semibold">Book Title</th>
                <th className="px-6 text-center py-4 font-semibold">ISBN</th>
                <th className="px-6 text-center py-4 font-semibold">Discount</th>
                <th className="px-6 text-center py-4 font-semibold">Start Date</th>
                <th className="px-6 text-center py-4 font-semibold">End Date</th>
                <th className="px-6 text-center py-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {discounts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No discounts found. Add your first discount to get started.
                  </td>
                </tr>
              ) : (
                discounts.map((discount) => (
                  <tr key={discount.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 text-left py-4 font-medium">
                      {discount.bookTitle}
                    </td>
                    <td className="px-6 py-4 text-center text-gray-600">
                      {discount.isbn}
                    </td>
                    <td className="px-6 py-4 text-center text-gray-600">
                      {discount.discountPercentage}%
                    </td>
                    <td className="px-6 py-4 text-center text-gray-600">
                      {new Date(discount.startDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-center text-gray-600">
                      {new Date(discount.endDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center space-x-3">
                        <button
                          className="px-3.5 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 text-sm font-medium shadow-sm"
                          onClick={() => startEditing(discount)}
                        >
                          Edit
                        </button>
                        <button
                          className="px-3.5 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200 text-sm font-medium shadow-sm"
                          onClick={() => handleDelete(discount.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default Discounts 
import { useState, useEffect } from "react"
import axios from "axios"

const Books = () => {
  const [books, setBooks] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingBook, setEditingBook] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [authors, setAuthors] = useState([])
  const [publishers, setPublishers] = useState([])
  const [genres, setGenres] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const [toast, setToast] = useState({ show: false, message: '', type: '' })
  const [paginationMetadata, setPaginationMetadata] = useState({
    currentPage: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 1,
    hasPrevious: false,
    hasNext: false
  })
  const [form, setForm] = useState({
    title: "",
    isbn: "",
    publicationDate: "",
    language: "",
    description: "",
    price: "",
    stockQuantity: "",
    isAvailable: false,
    format: "",
    coverImageUrl: null,
    isAwardWinner: false,
    isComingSoon: false,
    publisherId: "",
    authorId: "",
    genreIds: [],
  })
  const [showGenreDropdown, setShowGenreDropdown] = useState(false)

  // Show toast message
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type })
    setTimeout(() => {
      setToast({ show: false, message: '', type: '' })
    }, 3000)
  }

  // Fetch all books with pagination
  const fetchBooks = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`https://localhost:7098/api/books/all?page=${currentPage}&pageSize=${pageSize}`)
      setBooks(response.data.data?.items || [])
      setPaginationMetadata(response.data.data?.metadata || {
        currentPage: 1,
        pageSize: 10,
        totalItems: 0,
        totalPages: 1,
        hasPrevious: false,
        hasNext: false
      })
      setError(null)
    } catch (error) {
      console.error("Error fetching books:", error)
      setError("Failed to load books. Please try again later.")
      setBooks([])
    } finally {
      setLoading(false)
    }
  }

  // Fetch authors
  const fetchAuthors = async () => {
    try {
      const response = await axios.get("https://localhost:7098/api/author/all")
      setAuthors(response.data.data || [])
    } catch (error) {
      console.error("Error fetching authors:", error)
    }
  }

  // Fetch publishers
  const fetchPublishers = async () => {
    try {
      const response = await axios.get("https://localhost:7098/api/publisher/all")
      setPublishers(response.data.data || [])
    } catch (error) {
      console.error("Error fetching publishers:", error)
    }
  }

  // Fetch genres
  const fetchGenres = async () => {
    try {
      const response = await axios.get("https://localhost:7098/api/genre/all")
      setGenres(response.data.data || [])
    } catch (error) {
      console.error("Error fetching genres:", error)
    }
  }

  useEffect(() => {
    fetchBooks()
    fetchAuthors()
    fetchPublishers()
    fetchGenres()
  }, [currentPage]) // Refetch when page changes

  useEffect(() => {
    const handleClickOutside = (event) => {
      const dropdown = document.querySelector('.genre-dropdown')
      if (showGenreDropdown && dropdown && !dropdown.contains(event.target)) {
        setShowGenreDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showGenreDropdown])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    if (name === 'genreIds') {
      const genreId = value
      setForm(prev => ({
        ...prev,
        genreIds: prev.genreIds.includes(genreId)
          ? prev.genreIds.filter(id => id !== genreId)
          : [...prev.genreIds, genreId]
      }))
    } else {
      setForm({
        ...form,
        [name]: type === "checkbox" ? checked : value,
      })
    }
  }

  const handleFileChange = (e) => {
    setForm({
      ...form,
      coverImageUrl: e.target.files[0],
    })
  }

  // Add new book
  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        alert("You must be logged in to add a book")
        return
      }

      const formData = new FormData()
      for (const key in form) {
        if (key === "coverImageUrl" && form[key]) {
          formData.append("file", form[key])
        } else if (key === "genreIds") {
          form.genreIds.forEach(genreId => {
            formData.append("genreIds", genreId)
          })
        } else {
          formData.append(key, form[key])
        }
      }

      await axios.post("https://localhost:7098/api/books/add", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      })

      // Refresh the books list to get the updated data
      await fetchBooks()
      setShowForm(false)
      resetForm()
      showToast('Book added successfully!')
    } catch (error) {
      console.error("Error adding book:", error)
      showToast(error.response?.data?.message || 'Error adding book', 'error')
    }
  }

  // Edit book
  const handleEdit = async (e) => {
    e.preventDefault()

    try {
      const token = localStorage.getItem("token")
      const formData = new FormData()
      for (const key in form) {
        if (key === "coverImageUrl" && form[key] instanceof File) {
          formData.append("file", form[key])
        } else if (key === "genreIds") {
          form.genreIds.forEach(genreId => {
            formData.append("genreIds", genreId)
          })
        } else {
          formData.append(key, form[key])
        }
      }

      await axios.put(`https://localhost:7098/api/books/${editingBook.id}/update`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      })

      // Refresh the books list to get the updated data
      await fetchBooks()
      setEditingBook(null)
      resetForm()
      showToast('Book updated successfully!')
    } catch (error) {
      console.error("Error updating book:", error)
      showToast(error.response?.data?.message || 'Error updating book', 'error')
    }
  }

  // Delete book
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this book?")) return

    try {
      const token = localStorage.getItem("token")
      const userRole = localStorage.getItem("role")
      
      if (!token) {
        showToast('You must be logged in to delete books', 'error')
        return
      }

      if (userRole !== 'Admin') {
        showToast('Only Admin users can delete books', 'error')
        return
      }

      await axios.delete(`https://localhost:7098/api/books/${id}/delete`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      await fetchBooks()
      showToast('Book deleted successfully!')
    } catch (error) {
      console.error("Error deleting book:", error)
      
      // Handle specific error cases
      if (error.response?.status === 401) {
        showToast('Your session has expired. Please log in again.', 'error')
        // Clear invalid authentication data
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('userId')
        localStorage.removeItem('role')
        localStorage.removeItem('user')
        // Redirect to login
        window.location.href = '/login'
      } else if (error.response?.status === 403) {
        showToast('Access denied. Only Admin users can delete books.', 'error')
      } else if (error.response?.data?.errors?.innerException?.message?.includes('violates foreign key constraint')) {
        showToast('Cannot delete this book because it has been ordered by customers. Consider marking it as unavailable instead.', 'error')
      } else {
        showToast(error.response?.data?.message || 'Error deleting book', 'error')
      }
    }
  }

  const resetForm = () => {
    setForm({
      title: "",
      isbn: "",
      publicationDate: "",
      language: "",
      description: "",
      price: "",
      stockQuantity: "",
      isAvailable: false,
      format: "",
      coverImageUrl: null,
      isAwardWinner: false,
      isComingSoon: false,
      publisherId: "",
      authorId: "",
      genreIds: [],
    })
  }

  const startEditing = (book) => {
    // Find publisher ID
    const publisher = publishers.find(p => p.name === book.publisherName)
    
    // Find author ID
    const author = authors.find(a => a.name === book.authorName)
    
    // Find genre IDs
    const genreIds = book.genres?.map(genreName => {
      const genre = genres.find(g => g.name === genreName)
      return genre?.id || ''
    }).filter(id => id) || []

    setEditingBook(book)
    setForm({
      title: book.title,
      isbn: book.isbn,
      publicationDate: book.publicationDate?.split('T')[0],
      language: book.language,
      description: book.description,
      price: book.price,
      stockQuantity: book.stockQuantity,
      isAvailable: book.isAvailable,
      format: book.format,
      coverImageUrl: book.coverImageUrl,
      isAwardWinner: book.isAwardWinner,
      isComingSoon: book.isComingSoon,
      publisherId: publisher?.id || '',
      authorId: author?.id || '',
      genreIds: genreIds,
    })
  }

  if (loading) {
    return (
      <div className="p-8 bg-gray-50 min-h-screen">
        <h2 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-4">Manage Books</h2>
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
        <h2 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-4">Manage Books</h2>
        <div className="flex justify-center items-center h-64 bg-white rounded-lg shadow-sm">
          <div className="text-center">
            <p className="text-red-500 font-medium mb-4">{error}</p>
            <button
              onClick={fetchBooks}
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

      <h2 className="text-3xl font-bold mb-2 text-gray-800">Manage Books</h2>
      <p className="text-gray-600 mb-6 pb-4 border-b">Add, edit, and delete books from the catalog.</p>

      <div className="flex justify-between items-center mb-6">
        <div className="text-sm text-gray-500">
          {books.length} {books.length === 1 ? "book" : "books"} in catalog
        </div>
        {!showForm && !editingBook && (
          <button
            className="px-5 py-2.5 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors duration-200 shadow-sm flex items-center font-medium"
            onClick={() => setShowForm(true)}
          >
            <span className="mr-1 text-lg">+</span> Add Book
          </button>
        )}
      </div>

      {showForm || editingBook ? (
        <div className="bg-white p-8 rounded-lg shadow-md mb-8 border border-gray-100">
          <h3 className="text-xl font-bold mb-6 text-gray-800 pb-2 border-b">
            {editingBook ? "Edit Book" : "Add New Book"}
          </h3>
          <form onSubmit={editingBook ? handleEdit : handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                placeholder="Book title"
                name="title"
                value={form.title}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ISBN</label>
              <input
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                placeholder="ISBN number"
                name="isbn"
                value={form.isbn}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Publication Date</label>
              <input
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                type="date"
                name="publicationDate"
                value={form.publicationDate}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
              <input
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                placeholder="Book language"
                name="language"
                value={form.language}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
              <input
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                placeholder="Book price"
                type="number"
                step="0.01"
                name="price"
                value={form.price}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
              <input
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                placeholder="Available stock"
                type="number"
                name="stockQuantity"
                value={form.stockQuantity}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Format</label>
              <input
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                placeholder="Book format (e.g., Hardcover, Paperback)"
                name="format"
                value={form.format}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image</label>
              <input
                className="w-full p-2.5 border border-gray-300 rounded-md file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 focus:outline-none"
                type="file"
                accept="image/*"
                name="coverImageUrl"
                onChange={handleFileChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Publisher</label>
              <select
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                name="publisherId"
                value={form.publisherId}
                onChange={handleChange}
                required
              >
                <option value="">Select a publisher</option>
                {publishers.map((publisher) => (
                  <option key={publisher.id} value={publisher.id}>
                    {publisher.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
              <select
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                name="authorId"
                value={form.authorId}
                onChange={handleChange}
                required
              >
                <option value="">Select an author</option>
                {authors.map((author) => (
                  <option key={author.id} value={author.id}>
                    {author.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Genres</label>
              <div className="relative genre-dropdown">
                <div
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all cursor-pointer"
                  onClick={() => setShowGenreDropdown(prev => !prev)}
                >
                  {form.genreIds.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {form.genreIds.map(genreId => {
                        const genre = genres.find(g => g.id === genreId)
                        return (
                          <span
                            key={genreId}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800"
                          >
                            {genre?.name}
                            <button
                              type="button"
                              className="ml-1 text-emerald-600 hover:text-emerald-800"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleChange({ target: { name: 'genreIds', value: genreId } })
                              }}
                            >
                              ×
                            </button>
                          </span>
                        )
                      })}
                    </div>
                  ) : (
                    <span className="text-gray-500">Select genres</span>
                  )}
                </div>
                {showGenreDropdown && (
                  <div 
                    className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {genres.map((genre) => (
                      <label
                        key={genre.id}
                        className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          name="genreIds"
                          value={genre.id}
                          checked={form.genreIds.includes(genre.id)}
                          onChange={handleChange}
                          className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <span className="ml-2 text-sm text-gray-700">{genre.name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all min-h-[120px]"
                placeholder="Book description"
                name="description"
                value={form.description}
                onChange={handleChange}
                required
              />
            </div>

            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  name="isAvailable"
                  checked={form.isAvailable}
                  onChange={handleChange}
                  className="h-5 w-5 text-emerald-600 rounded focus:ring-emerald-500 border-gray-300"
                />
                <span className="text-gray-700 font-medium">Available</span>
              </label>

              <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  name="isAwardWinner"
                  checked={form.isAwardWinner}
                  onChange={handleChange}
                  className="h-5 w-5 text-emerald-600 rounded focus:ring-emerald-500 border-gray-300"
                />
                <span className="text-gray-700 font-medium">Award Winner</span>
              </label>

              <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  name="isComingSoon"
                  checked={form.isComingSoon}
                  onChange={handleChange}
                  className="h-5 w-5 text-emerald-600 rounded focus:ring-emerald-500 border-gray-300"
                />
                <span className="text-gray-700 font-medium">Coming Soon</span>
              </label>
            </div>

            <div className="md:col-span-2 flex justify-end gap-4 mt-6 pt-4 border-t">
              <button
                type="button"
                onClick={() => {
                  if (editingBook) {
                    setEditingBook(null)
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
                {editingBook ? "Update Book" : "Add Book"}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow-md">
          <table className="w-full table-auto">
            <thead className="bg-gray-100 text-gray-700 text-left">
              <tr>
                <th className="px-6 text-left py-4 font-semibold">Title</th>
                <th className="px-6 text-center py-4 font-semibold">Author</th>
                <th className="px-6 text-center py-4 font-semibold">Price</th>
                <th className="px-6 text-center py-4 font-semibold">Stock</th>
                <th className="px-6 text-center py-4 font-semibold">Status</th>
                <th className="px-6 text-center py-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {books.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No books found in the catalog. Add your first book to get started.
                  </td>
                </tr>
              ) : (
                books.map((book) => (
                  <tr key={book.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 text-left py-4 font-medium">{book.title}</td>
                    <td className="px-6 py-4 text-gray-600">{book.authorName || book.author || "Unknown"}</td>
                    <td className="px-6 py-4 text-gray-600">${book.price?.toFixed(2)}</td>
                    <td className="px-6 py-4 text-gray-600">{book.stockQuantity || book.stock || 0}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                          book.isAvailable
                            ? "bg-green-100 text-green-800 border border-green-200"
                            : "bg-red-100 text-red-800 border border-red-200"
                        }`}
                      >
                        {book.isAvailable ? "Available" : "Unavailable"}
                      </span>
                      {book.isAwardWinner && (
                        <span className="ml-2 px-3 py-1.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                          Award Winner
                        </span>
                      )}
                      {book.isComingSoon && (
                        <span className="ml-2 px-3 py-1.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                          Coming Soon
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center space-x-3">
                        <button
                          className="px-3.5 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 text-sm font-medium shadow-sm"
                          onClick={() => startEditing(book)}
                        >
                          Edit
                        </button>
                        <button
                          className="px-3.5 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200 text-sm font-medium shadow-sm"
                          onClick={() => handleDelete(book.id)}
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

          {/* Pagination Controls */}
          {paginationMetadata.totalItems > 0 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Showing {((paginationMetadata.currentPage - 1) * paginationMetadata.pageSize) + 1} to {Math.min(paginationMetadata.currentPage * paginationMetadata.pageSize, paginationMetadata.totalItems)} of {paginationMetadata.totalItems} books
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={!paginationMetadata.hasPrevious}
                    className={`px-3 py-1 rounded-md ${
                      !paginationMetadata.hasPrevious
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                    }`}
                  >
                    First
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => prev - 1)}
                    disabled={!paginationMetadata.hasPrevious}
                    className={`px-3 py-1 rounded-md ${
                      !paginationMetadata.hasPrevious
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                    }`}
                  >
                    Previous
                  </button>

                  {/* Page Numbers */}
                  <div className="flex items-center space-x-1">
                    {[...Array(paginationMetadata.totalPages)].map((_, index) => {
                      const pageNumber = index + 1;
                      // Show first page, last page, current page, and pages around current page
                      if (
                        pageNumber === 1 ||
                        pageNumber === paginationMetadata.totalPages ||
                        (pageNumber >= paginationMetadata.currentPage - 1 && pageNumber <= paginationMetadata.currentPage + 1)
                      ) {
                        return (
                          <button
                            key={pageNumber}
                            onClick={() => setCurrentPage(pageNumber)}
                            className={`px-3 py-1 rounded-md ${
                              paginationMetadata.currentPage === pageNumber
                                ? 'bg-blue-600 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                            }`}
                          >
                            {pageNumber}
                          </button>
                        );
                      } else if (
                        pageNumber === paginationMetadata.currentPage - 2 ||
                        pageNumber === paginationMetadata.currentPage + 2
                      ) {
                        return <span key={pageNumber} className="px-1">...</span>;
                      }
                      return null;
                    })}
                  </div>

                  <button
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    disabled={!paginationMetadata.hasNext}
                    className={`px-3 py-1 rounded-md ${
                      !paginationMetadata.hasNext
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                    }`}
                  >
                    Next
                  </button>
                  <button
                    onClick={() => setCurrentPage(paginationMetadata.totalPages)}
                    disabled={!paginationMetadata.hasNext}
                    className={`px-3 py-1 rounded-md ${
                      !paginationMetadata.hasNext
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                    }`}
                  >
                    Last
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Books

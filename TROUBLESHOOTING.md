# Troubleshooting Guide

## Authentication and Authorization Issues

### Problem: 403 Forbidden Errors on Cart API

**Symptoms:**
- Console shows: `Failed to load resource: the server responded with a status of 403 ()`
- CartContext.jsx shows: `Error fetching cart: AxiosError`

**Root Cause:**
The Cart API (`/api/cart`) requires the "Member" role, but users might be logged in with "Admin" or "Staff" roles.

**Solution Implemented:**
1. Updated `CartContext.jsx` to only fetch cart data for users with "Member" role
2. Added proper error handling for different user roles
3. Clear error messages explaining role restrictions

**Code Changes:**
```javascript
// Only fetch cart for Member users
if (userRole !== 'Member') {
  setCartItems([]);
  setItemCount(0);
  setError('Cart functionality is not available for Admin and Staff users.');
  return;
}
```

### Problem: 401 Unauthorized Errors on Book Delete

**Symptoms:**
- Console shows: `Failed to load resource: the server responded with a status of 401 ()`
- Books.jsx shows: `Error deleting book: AxiosError`

**Root Cause:**
The book delete endpoint requires "Admin" role, but the user might not be properly authenticated or have the correct role.

**Solution Implemented:**
1. Added role validation before attempting delete operation
2. Enhanced error handling for authentication failures
3. Automatic logout and redirect on token expiration

**Code Changes:**
```javascript
if (userRole !== 'Admin') {
  showToast('Only Admin users can delete books', 'error')
  return
}
```

### Problem: 400 Bad Request Errors on Cart Add

**Symptoms:**
- Console shows: `Failed to load resource: the server responded with a status of 400 ()`
- CartContext.jsx shows: `Error adding to cart: AxiosError`

**Root Cause:**
The cart add operation might fail due to:
1. Book not being available for purchase
2. Invalid book data
3. User not having Member role
4. Book being out of stock

**Solution Implemented:**
1. Added comprehensive validation before sending cart requests
2. Enhanced error handling with specific error messages
3. Added debugging logs to track request data
4. Added checks for book availability and stock

**Code Changes:**
```javascript
// Validate book availability
if (!book.isAvailable) {
  setCartError('This book is not available for purchase.');
  return;
}

// Check user role
if (userRole !== 'Member') {
  setCartError('Cart functionality is only available for Member users.');
  return;
}
```

### Problem: React DevTools Recommendation

**Symptoms:**
- Browser shows recommendation to install React DevTools

**Solution Implemented:**
1. Created `DevToolsNotice.jsx` component
2. Added dismissible notification with installation link
3. Integrated into main App component

### Problem: Debug Logs in Console

**Symptoms:**
- Console shows: "No review found for this book"
- Console shows: "Found user review: [object]"

**Solution Implemented:**
1. Removed debug console.log statements from BookDetails.jsx
2. Cleaned up unnecessary logging

## User Roles and Permissions

### Available Roles:
1. **Admin** - Full system access
   - Can manage books, authors, publishers, genres
   - Can create announcements and discounts
   - Can view all orders
   - Cannot use shopping cart

2. **Staff** - Order management access
   - Can view and manage orders
   - Cannot use shopping cart
   - Cannot manage books or other content

3. **Member** - Customer access
   - Can use shopping cart
   - Can place orders
   - Can write reviews
   - Cannot access admin features

### Role-Based Feature Access:

| Feature | Admin | Staff | Member |
|---------|-------|-------|--------|
| Shopping Cart | ❌ | ❌ | ✅ |
| Book Management | ✅ | ❌ | ❌ |
| Order Management | ✅ | ✅ | ❌ |
| User Reviews | ❌ | ❌ | ✅ |
| Announcements | ✅ | ❌ | ❌ |

## Authentication Flow

### Login Process:
1. User submits credentials
2. Backend validates and returns JWT token
3. Frontend stores token and user data in localStorage
4. User is redirected based on role

### Token Storage:
```javascript
localStorage.setItem("token", token);
localStorage.setItem("refreshToken", refreshToken);
localStorage.setItem("userId", userId);
localStorage.setItem("role", role);
localStorage.setItem("user", JSON.stringify(response.data.data));
```

### Error Handling:
- **401 Unauthorized**: Token expired or invalid
  - Clear all authentication data
  - Redirect to login page
- **403 Forbidden**: Insufficient permissions
  - Show role-specific error message
  - Prevent action execution
- **400 Bad Request**: Invalid data or business rule violation
  - Show specific validation error message
  - Prevent action execution

## Development Setup

### React DevTools Installation:
1. Visit: https://react.dev/link/react-devtools
2. Install browser extension
3. Restart browser
4. Open developer tools to see React tab

### Testing Different Roles:

**Admin User:**
- Email: admin@bookstore.com
- Password: AdminBookStore@123

**Staff User:**
- Email: staff@bookstore.com
- Password: StaffBookStore@123

**Member User:**
- Register a new account through the signup page

## Common Issues and Solutions

### Issue: Cart not loading for Admin/Staff users
**Solution:** This is expected behavior. Cart functionality is only available for Member users.

### Issue: Cannot delete books as Staff user
**Solution:** Only Admin users can delete books. Staff users can only manage orders.

### Issue: Session expires frequently
**Solution:** JWT tokens have a limited lifespan. Users need to log in again when tokens expire.

### Issue: Role-based access errors
**Solution:** Ensure users are logged in with the correct role for the feature they're trying to access.

### Issue: 400 error when adding to cart
**Solution:** Check that:
1. User is logged in as a Member
2. Book is available for purchase (isAvailable = true)
3. Book has stock (stockQuantity > 0)
4. Book data is valid

### Issue: Debug logs in console
**Solution:** Debug logs have been removed. If you see any remaining logs, they are intentional for debugging specific issues.

## Best Practices

1. **Always check user role before making API calls**
2. **Handle authentication errors gracefully**
3. **Provide clear error messages to users**
4. **Use role-based routing for protected pages**
5. **Clear invalid authentication data on errors**
6. **Validate data before sending to backend**
7. **Check business rules (availability, stock) before operations**

## API Endpoints and Required Roles

| Endpoint | Method | Required Role | Description |
|----------|--------|---------------|-------------|
| `/api/cart` | GET | Member | Get user's cart |
| `/api/cart/add` | POST | Member | Add item to cart |
| `/api/cart/update` | PUT | Member | Update cart item |
| `/api/cart/remove` | DELETE | Member | Remove item from cart |
| `/api/cart/clear` | DELETE | Member | Clear entire cart |
| `/api/books/{id}/delete` | DELETE | Admin | Delete a book |
| `/api/books/add` | POST | Admin | Add a new book |
| `/api/books/{id}/update` | PUT | Admin | Update a book |
| `/api/orders` | GET | Staff, Admin | Get all orders |
| `/api/orders/{id}` | PUT | Staff, Admin | Update order status |

## Debugging Tips

### For Cart Issues:
1. Check browser console for request data logs
2. Verify user role is "Member"
3. Check book availability and stock
4. Ensure user is logged in with valid token

### For Authentication Issues:
1. Check localStorage for token and role
2. Verify token hasn't expired
3. Check user permissions for the action

### For API Errors:
1. Check network tab for request/response details
2. Verify request payload format
3. Check backend logs for detailed error messages 
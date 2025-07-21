# Sourceasy Login Logic Update

## Overview
This document describes the updated login logic for Sourceasy that implements separate user type management with restricted access to different profile pages.

## New Login Flow

### 1. User Authentication Process
1. **Google Sign-in**: User clicks "Continue with Google"
2. **Database Check**: System checks email in both databases:
   - **Supplier Database** (`chemicals-new` index, `chemicals` namespace)
   - **Buyer Database** (`buyer` index, `buyers` namespace)
3. **User Type Determination**:
   - If email found in supplier database → **Supplier**
   - If email found in buyer database → **Buyer**
   - If email not found in either → **New User** (requires phone number)

### 2. New User Registration
- **Phone Number Required**: New users must provide phone number
- **Buyer Registration**: New users are automatically registered as buyers
- **Database Storage**: Buyer records stored in separate `buyer` index
- **No Login Without Phone**: Users cannot proceed without providing phone number

### 3. User Type Restrictions

#### Supplier Access
- ✅ Can access `/dashboard/profile` (supplier profile)
- ❌ Cannot access `/dashboard/profile-mockup` (buyer profile)
- ✅ Can access all other dashboard features

#### Buyer Access
- ✅ Can access `/dashboard/profile-mockup` (buyer profile)
- ❌ Cannot access `/dashboard/profile` (supplier profile)
- ✅ Can access all other dashboard features

### 4. Database Schema

#### Supplier Database (`chemicals-new` index)
```json
{
  "Seller Name": "Company Name",
  "Seller Email Address": "email@example.com",
  "Seller POC Contact Number": "phone",
  "Seller Verified": true/false,
  "Seller Rating": 0-5,
  "Region": "Region",
  "Seller Address": "Address",
  "User Type": "supplier"
}
```

#### Buyer Database (`buyer` index)
```json
{
  "Buyer Name": "Buyer Name",
  "Buyer Email": "email@example.com",
  "Buyer Phone": "phone",
  "Buyer Verified": true/false,
  "Region": "Region",
  "Created At": "timestamp",
  "User Type": "buyer"
}
```

## Implementation Details

### Backend Changes

#### 1. Updated `/api/check-email` Endpoint
- Checks both supplier and buyer databases
- Returns user type and appropriate data
- Handles phone number requirement for new users

#### 2. Updated `/api/add-buyer` Endpoint
- Stores buyer records in separate `buyer` index
- Uses `buyers` namespace for organization
- Includes proper metadata structure

### Frontend Changes

#### 1. App.tsx Updates
- Route protection based on user type
- Automatic redirects for unauthorized access
- Updated authentication logic

#### 2. Login.tsx Updates
- Mandatory phone number collection
- Clear user type assignment
- Improved error handling

#### 3. DashboardNavbar Updates
- Dynamic navigation based on user type
- Appropriate profile link routing

## Setup Instructions

### 1. Create Buyer Index in Pinecone
```bash
# Run the setup script
node backend/setup-buyer-index.js
```

### 2. Test the Implementation
```bash
# Run the test script
node backend/test-new-login-logic.js
```

### 3. Environment Variables
Ensure your `.env` file includes:
```env
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX_NAME=chemicals-new
```

## Migration Notes

### Existing Users
- Existing supplier users will continue to work as before
- Existing buyer users (if any) need to be migrated to new buyer index
- New users will automatically use the new system

### Data Migration
If you have existing buyer data in the supplier database, you'll need to:
1. Identify buyer records
2. Migrate them to the new buyer index
3. Update their user type in Firestore

## Testing Checklist

- [ ] Supplier login works correctly
- [ ] Existing buyer login works correctly
- [ ] New user registration requires phone number
- [ ] Suppliers can only access supplier profile
- [ ] Buyers can only access buyer profile
- [ ] Navigation shows correct profile links
- [ ] Route protection works as expected
- [ ] Database queries work correctly

## Error Handling

### Common Issues
1. **Buyer Index Not Found**: Run setup script
2. **Namespace Issues**: Ensure `buyers` namespace exists
3. **Route Access Denied**: Check user type assignment
4. **Phone Number Missing**: Validate form submission

### Debugging
- Check browser console for authentication errors
- Verify Pinecone index configuration
- Test database queries with provided test script
- Monitor network requests for API errors

## Security Considerations

- Phone number validation and sanitization
- User type verification on all protected routes
- Database access control through proper filtering
- Session management with user type persistence

## Future Enhancements

- Phone number verification via SMS
- Enhanced buyer profile features
- Supplier-to-buyer conversion process
- Advanced user type management 
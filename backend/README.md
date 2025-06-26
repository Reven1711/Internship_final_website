# Sourceasy Backend

This is the backend server for the Sourceasy application that handles email sending and Pinecone database integration.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file in the backend directory with the following variables:

```env
# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Pinecone Configuration
PINECONE_API_KEY=your-pinecone-api-key
PINECONE_INDEX_NAME=chemicals-new

# OpenAI Configuration
OPENAI_API_KEY=your-openai-api-key

# Admin Configuration
ADMIN_EMAILS=admin1@example.com,admin2@example.com

# Server Configuration
PORT=5000
```

## Environment Variables

### Email Configuration

- `EMAIL_USER`: Your Gmail address
- `EMAIL_PASS`: Your Gmail app password (not your regular password)

### Pinecone Configuration

- `PINECONE_API_KEY`: Your Pinecone API key
- `PINECONE_INDEX_NAME`: The name of your Pinecone index (default: "chemicals-new")

### OpenAI Configuration

- `OPENAI_API_KEY`: Your OpenAI API key for AI moderation

### Admin Configuration

- `ADMIN_EMAILS`: Comma-separated list of admin email addresses that can access the admin dashboard

### Server Configuration

- `PORT`: The port on which the server will run (default: 5000)

## API Endpoints

### POST /api/check-email

Checks if an email exists in the Pinecone database.

**Request Body:**

```json
{
  "email": "user@example.com"
}
```

**Response:**

```json
{
  "exists": true,
  "message": "Email found in database",
  "supplierData": {
    "sellerName": "Supplier Name",
    "sellerEmail": "supplier@example.com",
    "sellerVerified": true,
    "sellerRating": 4.5,
    "region": "Gujarat",
    "sellerAddress": "Supplier Address",
    "sellerPOCContact": "+91-1234567890"
  }
}
```

### POST /api/send-email

Sends an email using the contact form.

**Request Body:**

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "company": "Company Name",
  "message": "Message content",
  "to": "recipient@example.com"
}
```

## Running the Server

```bash
npm start
```

The server will start on `http://localhost:5000` (or the port specified in your `.env` file).

## Pinecone Database Schema

The Pinecone index should contain the following fields in the metadata:

- ID
- Minimum Order Quantity
- PIN Code
- Product Address
- Product Category
- Product Description
- Product Name
- Product Rating
- Product Unit
- Region
- Seller Address
- Seller Email Address
- Seller Name
- Seller POC Contact Number
- Seller Rating
- Seller Verified

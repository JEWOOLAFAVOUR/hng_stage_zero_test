# HNG Backend Track 01

A TypeScript Express.js API that provides user information and random cat facts with security features and rate limiting.

## Features

- User profile endpoint with personal information
- Random cat fact integration from external API
- Rate limiting (100 requests per 15 minutes)
- Security headers with Helmet
- CORS support
- Request logging with Morgan
- TypeScript support with proper type definitions
- Production-ready build system

## API Endpoints

### GET /me

Returns user information along with a random cat fact.

**Response:**

```json
{
  "status": "success",
  "user": {
    "email": "jewoolafavour2020@gmail.com",
    "name": "Jewoola Favour",
    "stack": "Node.js/Express"
  },
  "timestamp": "2025-10-17T10:30:00.000Z",
  "fact": "Cats sleep 70% of their lives."
}
```

## Technologies Used

- Node.js
- Express.js
- TypeScript
- Axios for HTTP requests
- Express Rate Limit for API protection
- Helmet for security headers
- Morgan for request logging
- CORS for cross-origin requests
- Dotenv for environment variables

## Installation

1. Clone the repository

```bash
git clone https://github.com/JEWOOLAFAVOUR/hng_stage_zero_test.git
cd hng_stage_zero_test
```

2. Install dependencies

```bash
npm install
```

3. Create a .env file (optional)

```bash
PORT=3000
```

## Development

Run in development mode with auto-reload:

```bash
npm run dev
```

Run TypeScript directly:

```bash
npm run start:dev
```

## Production

Build the TypeScript code:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

Clean build files:

```bash
npm run clean
```

## Security Features

- Rate limiting to prevent API abuse
- Security headers via Helmet middleware
- CORS configuration for cross-origin requests
- Input timeout handling for external API calls
- Global error handling middleware
- 404 route handling

## Error Handling

The API includes comprehensive error handling:

- External API failures are gracefully handled
- Rate limiting returns appropriate error messages
- 404 responses for undefined routes
- Global error handler for unexpected errors

## Author

Jewoola Favour

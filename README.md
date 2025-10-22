# HNG Backend Track 01

A TypeScript Express.js API that provides user information, random cat facts, and a complete string analysis service.

## Features

- User profile endpoint with personal information
- Random cat fact integration from external API
- String analyzer service with filtering capabilities
- Natural language query processing
- Rate limiting (100 requests per 15 minutes)
- Security headers with Helmet
- CORS support
- Request logging with Morgan
- TypeScript support with proper type definitions
- Production-ready build system

## API Endpoints

### GET /me

Returns user information along with a random cat fact.

### String Analyzer Endpoints

**POST /strings** - Analyze and store a string

```json
{
  "value": "hello world"
}
```

**GET /strings** - Get all strings with optional filtering

- Query params: `is_palindrome`, `min_length`, `max_length`, `word_count`, `contains_character`

**GET /strings/{string_value}** - Get specific string analysis

**GET /strings/filter-by-natural-language** - Filter using natural language

- Example: `?query=all single word palindromic strings`

**DELETE /strings/{string_value}** - Remove a string

### String Analysis Features

Each analyzed string includes:

- Length and word count
- Palindrome detection
- Unique character count
- SHA-256 hash for identification
- Character frequency mapping

## Technologies Used

- Node.js & Express.js
- TypeScript
- Axios for HTTP requests
- Built-in crypto module for SHA-256 hashing
- Express Rate Limit for API protection
- Helmet for security headers
- Morgan for request logging
- CORS for cross-origin requests
- Dotenv for environment variables

## Getting Started

1. Clone the repository

```bash
git clone https://github.com/JEWOOLAFAVOUR/hng_stage_zero_test.git
cd hng_stage_zero_test
```

2. Install dependencies

```bash
npm install
```

3. Create .env file (optional)

```bash
PORT=3000
```

4. Start development server

```bash
npm run dev
```

## Available Scripts

- `npm run dev` - Development with auto-reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Run production build
- `npm run clean` - Remove build files

## Testing the API

Try these example requests:

```bash
# Get user info
curl http://localhost:3000/me

# Analyze a string
curl -X POST http://localhost:3000/strings \
  -H "Content-Type: application/json" \
  -d '{"value": "racecar"}'

# Get palindromes only
curl "http://localhost:3000/strings?is_palindrome=true"

# Natural language search
curl "http://localhost:3000/strings/filter-by-natural-language?query=single%20word%20palindromes"
```

## Author

Jewoola Favour

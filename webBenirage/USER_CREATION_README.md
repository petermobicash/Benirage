# User Creation Scripts

This directory contains scripts to create users via the BENIRAGE admin API.

## Prerequisites

1. **Start the User Creation Server**
   ```bash
   node backend/create-admin-user.js
   ```
   This starts the server on `http://localhost:3001`

2. **Environment Variables**
   Make sure your `.env` file contains:
   ```env
   VITE_SUPABASE_URL=http://localhost:54321
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

## Available Scripts

### 1. Full Featured Script: `create-user-curl.sh`

A comprehensive script with options and colored output.

**Usage:**
```bash
# Basic usage (uses default settings)
./create-user-curl.sh

# With custom API key
./create-user-curl.sh --api-key your-secret-key

# With custom URL
./create-user-curl.sh --url http://localhost:3001

# Show help
./create-user-curl.sh --help
```

**Features:**
- Colored output for better readability
- Error handling and status reporting
- JSON response parsing (if `jq` is available)
- Detailed help information

### 2. Simple Script: `simple-user-curl.sh`

A minimal one-line curl command.

**Usage:**
```bash
./simple-user-curl.sh
```

## Created Users

Both scripts create the following users:

| Email | Role | Password |
|-------|------|----------|
| `admin@benirage.org` | Super Administrator | `password123` |
| `editor@benirage.org` | Content Editor | `password123` |
| `author@benirage.org` | Content Author | `password123` |
| `reviewer@benirage.org` | Content Reviewer | `password123` |
| `user@benirage.org` | Regular User | `password123` |

## Manual curl Command

If you prefer to use curl directly:

```bash
curl -X POST http://localhost:3001/create-admin-user \
  -H "Content-Type: application/json" \
  -H "x-api-key: benirage-admin-2024"
```

## Troubleshooting

### Server Not Running
```
Error: Failed to connect to the API endpoint
```
**Solution:** Start the server first:
```bash
node backend/create-admin-user.js
```

### Wrong API Key
```
HTTP 401 - Unauthorized
```
**Solution:** Check that you're using the correct API key. Default is `benirage-admin-2024`.

### Endpoint Not Found
```
HTTP 404 - Not Found
```
**Solution:** Make sure the server is running and you're using the correct URL.

## Security Note

The API key `benirage-admin-2024` is the default development key. For production use, set a secure API key in your environment variables:
```env
ADMIN_API_KEY=your-secure-api-key-here
```

And update your scripts accordingly:
```bash
./create-user-curl.sh --api-key your-secure-api-key-here
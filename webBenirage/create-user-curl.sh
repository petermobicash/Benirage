#!/bin/bash

# ========================================
# BENIRAGE USER CREATION CURL SCRIPT
# ========================================
# This script creates users via the admin API endpoint
#
# Usage:
#   ./create-user-curl.sh [options]
#
# Options:
#   --help              Show this help message
#   --api-key KEY       API key (default: benirage-admin-2024)
#   --url URL          API base URL (default: http://localhost:3001)
#   --endpoint ENDPOINT API endpoint (default: /create-admin-user)
#
# Examples:
#   ./create-user-curl.sh
#   ./create-user-curl.sh --api-key my-secret-key
#   ./create-user-curl.sh --url http://localhost:3001 --api-key benirage-admin-2024
# ========================================

# Default configuration
API_KEY="benirage-admin-2024"
BASE_URL="http://localhost:3001"
ENDPOINT="/create-admin-user"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to show usage
show_help() {
    echo "========================================="
    echo "BENIRAGE USER CREATION CURL SCRIPT"
    echo "========================================="
    echo "This script creates users via the admin API endpoint"
    echo ""
    echo "Usage:"
    echo "  $0 [options]"
    echo ""
    echo "Options:"
    echo "  --help              Show this help message"
    echo "  --api-key KEY       API key (default: benirage-admin-2024)"
    echo "  --url URL          API base URL (default: http://localhost:3001)"
    echo "  --endpoint ENDPOINT API endpoint (default: /create-admin-user)"
    echo ""
    echo "Examples:"
    echo "  $0"
    echo "  $0 --api-key my-secret-key"
    echo "  $0 --url http://localhost:3001 --api-key benirage-admin-2024"
    echo "========================================="
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --help)
            show_help
            exit 0
            ;;
        --api-key)
            API_KEY="$2"
            shift 2
            ;;
        --url)
            BASE_URL="$2"
            shift 2
            ;;
        --endpoint)
            ENDPOINT="$2"
            shift 2
            ;;
        *)
            print_error "Unknown option: $1"
            echo ""
            show_help
            exit 1
            ;;
    esac
done

# Construct the full URL
FULL_URL="${BASE_URL}${ENDPOINT}"

print_info "Creating users via API endpoint..."
print_info "URL: $FULL_URL"
print_info "API Key: $API_KEY"
echo ""

# Make the curl request
print_info "Sending request to create users..."

RESPONSE=$(curl -s -w "\n%{http_code}" \
    -X POST \
    "$FULL_URL" \
    -H "Content-Type: application/json" \
    -H "x-api-key: $API_KEY" \
    2>/dev/null)

# Extract HTTP status code (last line)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)

# Extract response body (all lines except last)
RESPONSE_BODY=$(echo "$RESPONSE" | head -n -1)

# Check if curl was successful
if [ $? -ne 0 ]; then
    print_error "Failed to connect to the API endpoint"
    print_error "Make sure the server is running on $BASE_URL"
    print_error "You can start it with: node backend/create-admin-user.js"
    exit 1
fi

# Parse the JSON response
if [ "$HTTP_CODE" = "200" ]; then
    print_success "Users created successfully!"

    # Try to parse JSON to show details
    if command -v jq &> /dev/null; then
        echo ""
        echo "Detailed Results:"
        echo "$RESPONSE_BODY" | jq '.'
    else
        echo ""
        echo "Response:"
        echo "$RESPONSE_BODY" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE_BODY"
    fi

    # Show created users summary
    print_info "The following users should now be available:"
    echo "  - admin@benirage.org (Super Administrator)"
    echo "  - editor@benirage.org (Content Editor)"
    echo "  - author@benirage.org (Content Author)"
    echo "  - reviewer@benirage.org (Content Reviewer)"
    echo "  - user@benirage.org (Regular User)"
    echo ""
    print_info "All users have password: password123"

elif [ "$HTTP_CODE" = "401" ]; then
    print_error "Unauthorized - Invalid API key"
    print_info "Make sure you're using the correct API key"
    print_info "Current key: $API_KEY"

elif [ "$HTTP_CODE" = "404" ]; then
    print_error "Endpoint not found"
    print_info "Make sure the server is running and the endpoint exists"
    print_info "Expected endpoint: $FULL_URL"

else
    print_error "HTTP $HTTP_CODE"
    print_info "Response: $RESPONSE_BODY"
fi

echo ""
print_info "Script completed."
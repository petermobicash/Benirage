#!/bin/bash

# Admin User Creation via API Script
# This script creates admin users by calling the backend API endpoint

# Configuration
API_URL="http://localhost:3001/create-admin-user"
API_KEY="benirage-admin-2024"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if the API server is running
check_api_server() {
    print_info "Checking if API server is running on port 3001..."
    
    if curl -s --connect-timeout 3 http://localhost:3001 > /dev/null 2>&1; then
        print_success "API server is running"
        return 0
    else
        print_error "API server is not running on port 3001"
        return 1
    fi
}

# Start the API server if not running
start_api_server() {
    print_info "Starting the admin user creation API server..."
    
    # Check if we're in the right directory
    if [ ! -f "backend/create-admin-user.js" ]; then
        print_error "Backend script not found. Please run this script from the project root directory."
        exit 1
    fi
    
    # Start the server in background
    cd backend
    nohup node create-admin-user.js > ../logs/admin-api-server.log 2>&1 &
    SERVER_PID=$!
    cd ..
    
    print_info "Server starting with PID: $SERVER_PID"
    
    # Wait for server to start
    sleep 3
    
    # Check if server started successfully
    if kill -0 $SERVER_PID 2>/dev/null; then
        print_success "API server started successfully"
        echo $SERVER_PID > .api_server_pid
        return 0
    else
        print_error "Failed to start API server"
        print_info "Check the logs: tail -f logs/admin-api-server.log"
        return 1
    fi
}

# Create admin users via API
create_admin_users() {
    print_info "Creating admin users via API..."
    
    # Make the API request
    response=$(curl -s -X POST "$API_URL" \
        -H "Content-Type: application/json" \
        -H "x-api-key: $API_KEY" \
        -w "\n%{http_code}")
    
    # Extract HTTP status code (last line)
    http_code=$(echo "$response" | tail -n 1)
    
    # Extract response body (all but last line)
    response_body=$(echo "$response" | head -n -1)
    
    # Check if request was successful
    if [ "$http_code" = "200" ]; then
        print_success "API request successful"
        
        # Parse and display results
        echo "$response_body" | jq '.' 2>/dev/null || echo "$response_body"
        
        # Check if users were created successfully
        success_count=$(echo "$response_body" | jq -r '.results[] | select(.success == true) | .email' 2>/dev/null | wc -l)
        if [ "$success_count" -gt 0 ]; then
            print_success "Created $success_count admin user(s) successfully"
            
            # Display the users that were created
            echo ""
            print_info "Admin users created:"
            echo "$response_body" | jq -r '.results[] | select(.success == true) | "   📧 \(.email) - \(.message)"' 2>/dev/null
            
            return 0
        else
            print_warning "No new users were created (users may already exist)"
            return 1
        fi
    else
        print_error "API request failed with HTTP status: $http_code"
        echo "Response: $response_body"
        return 1
    fi
}

# Display user credentials
display_credentials() {
    print_info "Admin user credentials:"
    echo ""
    echo "🔑 Super Administrator:"
    echo "   📧 admin@benirage.org"
    echo "   🔑 password123"
    echo ""
    echo "📝 Content Editor:"
    echo "   📧 editor@benirage.org"
    echo "   🔑 password123"
    echo ""
    echo "✍️  Content Author:"
    echo "   📧 author@benirage.org"
    echo "   🔑 password123"
    echo ""
    echo "👀 Content Reviewer:"
    echo "   📧 reviewer@benirage.org"
    echo "   🔑 password123"
    echo ""
    echo "👤 Regular User:"
    echo "   📧 user@benirage.org"
    echo "   🔑 password123"
    echo ""
}

# Test the created users
test_admin_users() {
    print_info "Testing admin user login functionality..."
    
    # Test admin user login
    if command -v node >/dev/null 2>&1; then
        node -e "
        const { createClient } = require('@supabase/supabase-js');
        const supabase = createClient(
          process.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321',
          process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
        );
        
        async function testLogin() {
          try {
            const { data, error } = await supabase.auth.signInWithPassword({
              email: 'admin@benirage.org',
              password: 'password123'
            });
            
            if (error) {
              console.log('❌ Admin login test failed:', error.message);
            } else {
              console.log('✅ Admin login test successful');
            }
          } catch (err) {
            console.log('❌ Admin login test error:', err.message);
          }
        }
        
        testLogin();
        " 2>/dev/null || print_warning "Could not test login (missing dependencies or Supabase config)"
    else
        print_warning "Node.js not available, skipping login test"
    fi
}

# Cleanup function
cleanup() {
    if [ -f ".api_server_pid" ]; then
        SERVER_PID=$(cat .api_server_pid)
        if kill -0 $SERVER_PID 2>/dev/null; then
            print_info "Stopping API server (PID: $SERVER_PID)..."
            kill $SERVER_PID
            rm .api_server_pid
            print_success "API server stopped"
        fi
    fi
}

# Set trap to cleanup on exit
trap cleanup EXIT

# Main execution
main() {
    echo "========================================"
    echo "🚀 ADMIN USER CREATION VIA API"
    echo "========================================"
    echo ""
    
    # Check if API server is running
    if ! check_api_server; then
        print_info "Attempting to start API server..."
        if ! start_api_server; then
            print_error "Could not start API server. Please run manually:"
            print_info "cd backend && node create-admin-user.js"
            exit 1
        fi
    fi
    
    # Create admin users
    if create_admin_users; then
        # Display credentials
        display_credentials
        
        # Test the users
        test_admin_users
        
        print_success "Admin user creation completed successfully!"
        echo ""
        print_info "Next steps:"
        print_info "1. Start your development server: npm run dev"
        print_info "2. Navigate to: http://localhost:3000"
        print_info "3. Log in with any of the admin credentials above"
        print_info "4. Access the admin dashboard and CMS features"
    else
        print_error "Admin user creation failed"
        exit 1
    fi
}

# Handle command line arguments
case "${1:-}" in
    "test")
        check_api_server
        ;;
    "start")
        start_api_server
        ;;
    "create")
        create_admin_users
        ;;
    "help"|"-h"|"--help")
        echo "Admin User Creation via API"
        echo ""
        echo "Usage: $0 [command]"
        echo ""
        echo "Commands:"
        echo "  (no command)  Full process: check server, start if needed, create users, and test"
        echo "  test          Only test if API server is running"
        echo "  start         Only start the API server"
        echo "  create        Only create admin users (requires running server)"
        echo "  help          Show this help message"
        echo ""
        echo "Environment variables:"
        echo "  VITE_SUPABASE_URL       Supabase project URL"
        echo "  VITE_SUPABASE_ANON_KEY  Supabase anonymous key"
        echo "  SUPABASE_SERVICE_ROLE_KEY Supabase service role key"
        ;;
    *)
        main
        ;;
esac
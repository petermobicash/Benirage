# Archived: Function Search Path Fixes

## Why These Were Archived

These migration files were superseded by [`097_final_function_search_path_fix.sql`](../../../097_final_function_search_path_fix.sql), which provides a more targeted and efficient approach to fixing function search path security issues.

## Archived Files

1. **060_fix_function_search_paths.sql** (225 lines)
   - First attempt at fixing function search paths
   - Created helper function to fix search paths
   - Fixed ~100 functions

2. **081_fix_function_search_paths.sql** (658 lines)
   - Second comprehensive attempt
   - Recreated many functions with `SET search_path = ''`
   - More thorough but still incomplete

3. **084_fix_remaining_function_search_paths.sql** (54 lines)
   - Attempted to fix remaining functions
   - Only fixed 2 functions (cleanup_old_audit_logs, archive_old_content)

4. **095_fix_function_search_path_security.sql** (805 lines)
   - Most comprehensive attempt
   - Fixed ~40 functions
   - Still had issues with some functions

## What Superseded Them

**Migration 097** (`097_final_function_search_path_fix.sql`) provides a targeted fix for the specific functions that were causing security warnings:
- `get_is_super_admin()`
- `get_current_user_id()`
- `is_authenticated()`
- `get_current_user_id_text()`

This targeted approach is more maintainable and addresses the root cause without recreating dozens of functions unnecessarily.

## Impact

- **No data loss**: These migrations only modified function definitions
- **No breaking changes**: The final migration (097) provides all necessary fixes
- **Improved maintainability**: Single source of truth for function security

## Reference

If you need to understand the evolution of this fix, these archived files show the iterative process of solving the function search path security issue.
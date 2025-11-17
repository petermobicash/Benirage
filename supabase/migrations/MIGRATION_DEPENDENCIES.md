# Migration Dependencies and Cleanup Summary

## Overview
This document tracks the dependencies and relationships between Supabase migrations, including cleanup actions taken to resolve warning messages.

## Cleanup Actions Performed (2025-11-13)

### Files Archived to `archived/duplicates/`:
1. `999_add_comprehensive_rls_policies.sql` - Duplicate of 100_comprehensive_rls_policies_29_tables.sql
2. `086_fix_rls_performance_warnings.sql` - Superseded by 089
3. `087_rls_performance_final.sql` - Superseded by 089
4. `088_safe_rls_optimization.sql` - Superseded by 089

### Files Archived to `archived/obsolete/`:
1. `024_fix_profiles_rls_infinite_recursion.sql` - Superseded by 062

## Active Migrations (Kept)

### Core Schema Migrations
- `000_initial_schema.sql` - Base table definitions
- `001_create_chat_schema.sql` - Chat system tables
- `005_add_cms_tables.sql` - Content management system
- `002_add_missing_tables_and_columns.sql` - Missing table additions

### Table Creation Migrations
- `021_add_suggestions_table.sql` - Suggestions functionality
- `071_add_video_calls_tables.sql` - Video call system
- `073_add_audit_logs_and_notifications.sql` - Audit logging
- `085_create_stories_system.sql` - Story system

### Fix Migrations (Active)
- `059_fix_chat_messages_rls.sql` - Chat RLS policies
- `062_fix_profiles_rls_recursion.sql` - User profiles recursion fix
- `089_final_type_safe_rls.sql` - Latest RLS performance fixes

### Final Configuration Migrations
- `100_comprehensive_rls_policies_29_tables.sql` - Comprehensive RLS policies
- `097_final_function_search_path_fix.sql` - Function security fixes
- `096_validate_function_security.sql` - Security validation

## Migration Dependencies

### Dependency Chain:
```
000_initial_schema.sql
├── 001_create_chat_schema.sql
├── 002_add_missing_tables_and_columns.sql
└── 005_add_cms_tables.sql
    ├── 021_add_suggestions_table.sql
    ├── 059_fix_chat_messages_rls.sql
    ├── 062_fix_profiles_rls_recursion.sql
    └── 100_comprehensive_rls_policies_29_tables.sql
        └── 089_final_type_safe_rls.sql
            └── 097_final_function_search_path_fix.sql
```

### Critical Dependencies:
- **RLS Policies**: `100_comprehensive_rls_policies_29_tables.sql` must run after base table creation
- **Function Security**: `097_final_function_search_path_fix.sql` should run after all RLS fixes
- **Profile Fixes**: `062_fix_profiles_rls_recursion.sql` supersedes older profile fixes

## Migration Order (Recommended)

For fresh installations, apply migrations in this order:

1. **Base Schema** (000-005)
2. **Feature Tables** (021, 025, 071-085)
3. **Core Fixes** (059, 062)
4. **RLS Policies** (100)
5. **Performance & Security** (089, 096-097)

## Warning Resolution

### Before Cleanup:
- Multiple "policy does not exist" warnings
- Duplicate function definitions
- Confusing migration history

### After Cleanup:
- Clean migration runs without duplicate warnings
- Single source of truth for RLS policies
- Simplified maintenance

## Testing Recommendations

After cleanup, verify:
1. ✅ All tables are created correctly
2. ✅ RLS policies work as expected
3. ✅ No infinite recursion in profile checks
4. ✅ Chat functionality works properly
5. ✅ Admin permissions function correctly

## Future Migration Guidelines

1. **Avoid duplicates**: Check existing migrations before creating new fixes
2. **Use proper naming**: Include table names and fix types in migration names
3. **Dependency documentation**: Update this file when adding new migrations
4. **Archive obsolete**: Move superseded migrations to archived folder

---

**Last Updated**: 2025-11-13  
**Cleanup Status**: Complete  
**Active Migrations**: 35  
**Archived Migrations**: 5
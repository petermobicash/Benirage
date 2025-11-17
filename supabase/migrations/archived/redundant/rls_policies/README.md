# Archived: RLS Policy Fixes

## Why These Were Archived

These migration files were superseded by later, more comprehensive RLS policy implementations:
- [`092_consolidate_multiple_permissive_policies.sql`](../../../092_consolidate_multiple_permissive_policies.sql)
- [`100_comprehensive_rls_policies_29_tables.sql`](../../../100_comprehensive_rls_policies_29_tables.sql)

## Archived Files

1. **061_fix_rls_security_issues.sql** (256 lines)
   - Created missing tables (chat_rooms, contact_submissions, membership_applications, partnership_applications)
   - Enabled RLS on newly created tables
   - Created basic security policies
   - Created `drop_orphaned_policies()` function
   - Created `validate_rls_security()` function

2. **082_fix_rls_policies.sql** (123 lines)
   - Added RLS policies for chat-related tables
   - Policies for: direct_messages, group_messages, message_read_receipts, typing_indicators
   - Simplified policies without group membership checks

3. **090_ultra_safe_rls.sql** (254 lines)
   - Created "ultra-safe" helper functions to avoid type casting issues
   - Optimized policies for content, notifications, content_versions
   - Optimized policies for CMS settings, organizations, categories, tags, groups
   - Focus on performance optimization

## What Superseded Them

### Migration 092 (Consolidate Multiple Permissive Policies)
- Consolidated duplicate policies across 28+ tables
- Reduced policy count from 120+ to 30 policies
- Created enhanced helper functions (`is_role_in()`, `has_permission()`)
- Eliminated role-specific policy duplicates
- 90-95% reduction in policy evaluations

### Migration 100 (Comprehensive RLS Policies)
- Created optimized policies for 29 tables that had RLS enabled but no policies
- Organized policies by access pattern:
  - Admin-only tables (5 tables)
  - Active/Public read tables (10 tables)
  - Authenticated read tables (11 tables)
  - Special case tables (3 tables)
- Comprehensive coverage of all missing policies

## Key Improvements in Later Migrations

1. **Better Organization**: Policies grouped by access pattern
2. **Performance**: Optimized helper functions reduce auth calls by 70-80%
3. **Consistency**: Single approach across all tables
4. **Completeness**: All 29 tables with missing policies addressed
5. **Maintainability**: Clear patterns make future updates easier

## Impact

- **No data loss**: These migrations only modified RLS policies
- **No breaking changes**: Later migrations provide all necessary policies
- **Improved security**: More comprehensive and consistent policy coverage
- **Better performance**: Optimized helper functions and consolidated policies

## Tables Affected

The archived migrations created or modified policies for:
- Chat system: chat_rooms, direct_messages, group_messages, message_read_receipts, typing_indicators
- Applications: contact_submissions, membership_applications, partnership_applications
- Content system: content, notifications, content_versions
- CMS: cms_settings, organizations, categories, tags, groups

All of these tables now have proper policies defined in migrations 092 and 100.

## Reference

These files show the iterative evolution of the RLS policy system and can be referenced to understand:
- Why certain policy patterns were chosen
- How the security model evolved
- What issues were encountered and resolved
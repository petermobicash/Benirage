-- Seed data for the application
-- This file provides sample data for testing and development

-- ===============================================
-- 1. SAMPLE CONTENT FOR COMMENTING SYSTEM
-- ===============================================

-- Insert sample content for testing comments
INSERT INTO content (id, title, slug, content, type, status, author, author_id, published_at, featured_image, meta_description, views_count, likes_count, comments_count)
VALUES
    (
        gen_random_uuid(),
        'Welcome to BENIRAGE Community',
        'welcome-to-benirage',
        'Welcome to the BENIRAGE community platform! This is where we connect, share ideas, and build meaningful relationships. Our community is built on the principles of collaboration, respect, and continuous learning.

        We believe in the power of community-driven initiatives and the importance of creating spaces where everyone can contribute and grow. Whether you''re here to learn, share, or connect, you''re part of something special.

        Feel free to explore, ask questions, and engage with fellow community members. Together, we can achieve great things!',
        'page',
        'published',
        'BENIRAGE Team',
        NULL,
        NOW(),
        NULL,
        'Welcome to the BENIRAGE community platform where we connect and share ideas',
        0,
        0,
        0
    ),
    (
        gen_random_uuid(),
        'Philosophy and Ethics Discussion',
        'philosophy-ethics',
        'At BENIRAGE, we believe that philosophy and ethics form the foundation of meaningful community engagement. Our approach is guided by principles of respect, integrity, and collective wisdom.

        We encourage open dialogue and diverse perspectives, always striving to understand different viewpoints while maintaining our core values. Every voice matters, and every contribution helps us grow stronger as a community.

        Join us in exploring life''s big questions and discovering how we can make a positive impact together.',
        'page',
        'published',
        'Philosophy Team',
        NULL,
        NOW(),
        NULL,
        'Discussion on philosophy and ethics in community engagement',
        0,
        0,
        0
    ),
    (
        gen_random_uuid(),
        'Community Guidelines',
        'community-guidelines',
        'Our community thrives when we all follow these simple guidelines:

        1. **Respect Everyone**: Treat all members with dignity and kindness
        2. **Share Knowledge**: Contribute your expertise and learn from others
        3. **Stay Positive**: Focus on solutions and maintain constructive dialogue
        4. **Be Inclusive**: Welcome diversity and different perspectives
        5. **Take Responsibility**: Own your words and actions

        These guidelines help us maintain a safe, supportive, and enriching environment for everyone. By following them, we create space for genuine connections and meaningful growth.',
        'page',
        'published',
        'Community Moderators',
        NULL,
        NOW(),
        NULL,
        'Community guidelines for respectful and constructive engagement',
        0,
        0,
        0
    )
ON CONFLICT (slug) DO NOTHING;

-- ===============================================
-- 2. SAMPLE CHAT MESSAGES
-- ===============================================

-- Insert some sample chat messages for testing
INSERT INTO chat_messages (id, sender_id, sender_name, message_text, message_type, room_id, created_at)
VALUES
    (
        gen_random_uuid(),
        'demo-user-1',
        'Community Manager',
        '👋 Welcome everyone! Feel free to introduce yourselves and share what brings you to our community.',
        'text',
        NULL,
        NOW() - INTERVAL '2 hours'
    ),
    (
        gen_random_uuid(),
        'demo-user-2',
        'New Member',
        'Hi everyone! I''m excited to be part of this community and looking forward to learning from all of you.',
        'text',
        NULL,
        NOW() - INTERVAL '1 hour'
    ),
    (
        gen_random_uuid(),
        'demo-user-3',
        'Regular Contributor',
        'Great to see new faces! This community has been incredibly supportive in my journey. Happy to help anyone getting started.',
        'text',
        NULL,
        NOW() - INTERVAL '30 minutes'
    )
ON CONFLICT DO NOTHING;

-- ===============================================
-- 3. SAMPLE USER PROFILES
-- ===============================================

-- Insert sample user profiles for testing presence features
INSERT INTO user_profiles (id, user_id, username, display_name, status, is_online, last_seen)
VALUES
    (
        gen_random_uuid(),
        NULL,
        'community_manager',
        'Community Manager',
        'online',
        true,
        NOW()
    ),
    (
        gen_random_uuid(),
        NULL,
        'new_member',
        'New Member',
        'online',
        true,
        NOW()
    ),
    (
        gen_random_uuid(),
        NULL,
        'contributor',
        'Regular Contributor',
        'away',
        false,
        NOW() - INTERVAL '15 minutes'
    )
ON CONFLICT (user_id) DO NOTHING;

-- ===============================================
-- 4. SAMPLE FORM SUBMISSIONS AND APPLICATIONS
-- ===============================================

-- Sample contact submissions
INSERT INTO contact_submissions (id, first_name, last_name, email, organization, subject, message, preferred_contact, urgency, status, submission_date)
VALUES
    (
        gen_random_uuid(),
        'Jean',
        'Mugabo',
        'jean.mugabo@email.com',
        'Kigali Innovation Hub',
        'Partnership Inquiry',
        'We are interested in exploring partnership opportunities with BENIRAGE. Our organization focuses on youth development and we believe there are synergies between our missions.',
        'email',
        'normal',
        'new',
        NOW() - INTERVAL '5 days'
    ),
    (
        gen_random_uuid(),
        'Marie',
        'Uwimana',
        'marie.uwimana@email.com',
        NULL,
        'Volunteer Opportunities',
        'I am a university student studying community development and would like to volunteer with BENIRAGE. I have experience in event organization and social media management.',
        'email',
        'normal',
        'new',
        NOW() - INTERVAL '3 days'
    ),
    (
        gen_random_uuid(),
        'Patrick',
        'Nkurunziza',
        'patrick.n@email.com',
        'Local NGO',
        'Event Collaboration',
        'We would like to discuss potential collaboration on an upcoming community event focused on cultural preservation and youth engagement.',
        'email',
        'normal',
        'in_progress',
        NOW() - INTERVAL '1 day'
    )
ON CONFLICT DO NOTHING;

-- Sample membership applications
INSERT INTO membership_applications (id, first_name, last_name, email, phone, organization, occupation, interests, work_experience, why_join, status, submission_date)
VALUES
    (
        gen_random_uuid(),
        'Alice',
        'Kabera',
        'alice.kabera@email.com',
        '+250788111222',
        'Local NGO',
        'Community Development Officer',
        '["Community Development", "Youth Empowerment", "Cultural Preservation"]'::jsonb,
        '5 years experience in community development and project management',
        'I want to join BENIRAGE to contribute to community development initiatives and connect with like-minded individuals working towards positive social change.',
        'pending',
        NOW() - INTERVAL '7 days'
    ),
    (
        gen_random_uuid(),
        'David',
        'Mukiza',
        'david.mukiza@email.com',
        '+250789333444',
        'Kigali International School',
        'Teacher',
        '["Education", "Youth Development", "Leadership"]'::jsonb,
        '8 years teaching experience with focus on character development',
        'BENIRAGE''s focus on wisdom and cultural values aligns with my passion for education and community building.',
        'pending',
        NOW() - INTERVAL '4 days'
    )
ON CONFLICT DO NOTHING;

-- Sample volunteer applications
INSERT INTO volunteer_applications (id, first_name, last_name, email, phone, location, date_of_birth, gender, program_interests, nationality, occupation, education, experience, languages, skills, submission_date, status)
VALUES
    (
        gen_random_uuid(),
        'Grace',
        'Uwimana',
        'grace.uwimana@email.com',
        '+250788555666',
        'Kigali, Rwanda',
        '1995-08-20',
        'Female',
        '["Youth Programs", "Community Outreach", "Cultural Events"]'::jsonb,
        'Rwandan',
        'University Student',
        'Bachelor''s in Progress - Social Work',
        'Interned at local NGO for 6 months, organized community events',
        '["Kinyarwanda", "English", "French"]'::jsonb,
        '["Event Planning", "Social Media", "Community Engagement"]'::jsonb,
        NOW() - INTERVAL '6 days',
        'pending'
    ),
    (
        gen_random_uuid(),
        'Emmanuel',
        'Ndayishimiye',
        'emmanuel.n@email.com',
        '+250789777888',
        'Musanze, Rwanda',
        '1988-03-10',
        'Male',
        '["Cultural Preservation", "Leadership Training", "Mentoring"]'::jsonb,
        'Rwandan',
        'Cultural Heritage Officer',
        'Bachelor''s in Cultural Studies',
        '5 years experience in cultural preservation programs',
        '["Kinyarwanda", "English", "Swahili"]'::jsonb,
        '["Cultural Research", "Workshop Facilitation", "Documentation"]'::jsonb,
        NOW() - INTERVAL '2 days',
        'approved'
    )
ON CONFLICT DO NOTHING;

-- Sample partnership applications
INSERT INTO partnership_applications (id, organization_name, contact_person, email, phone, website, organization_type, description, goals, resources, expectations, status, submission_date)
VALUES
    (
        gen_random_uuid(),
        'Rwanda Youth Development Initiative',
        'Sarah Uwimana',
        'sarah@rydi.rw',
        '+250788999000',
        'www.rydi.rw',
        'NGO',
        'RYDI focuses on empowering young people through education, skills training, and entrepreneurship programs.',
        'We aim to collaborate on youth leadership programs and share resources for community development initiatives.',
        '["Training Facilities", "Experienced Staff", "Educational Materials"]'::jsonb,
        'Access to BENIRAGE network and cultural expertise for our programs',
        'pending',
        NOW() - INTERVAL '8 days'
    ),
    (
        gen_random_uuid(),
        'Kigali Cultural Center',
        'Jean Baptiste',
        'jbapt@kigalicc.rw',
        '+250789111222',
        'www.kigalicc.rw',
        'Cultural Institution',
        'The Kigali Cultural Center promotes Rwandan arts, crafts, and cultural heritage through exhibitions and educational programs.',
        'Partner with BENIRAGE to organize cultural festivals and develop educational content about Rwandan traditions.',
        '["Exhibition Space", "Cultural Artifacts", "Expertise in Rwandan Culture"]'::jsonb,
        'Collaboration with BENIRAGE community for broader reach and impact',
        'pending',
        NOW() - INTERVAL '5 days'
    )
ON CONFLICT DO NOTHING;

-- Sample donations
INSERT INTO donations (id, donor_name, donor_email, amount, currency, frequency, payment_method, designation, newsletter_signup, anonymous_donation, donation_date, payment_status)
VALUES
    (
        gen_random_uuid(),
        'Michael Johnson',
        'michael.j@email.com',
        50000.00,
        'RWF',
        'one-time',
        'mobile_money',
        'General Support',
        true,
        false,
        NOW() - INTERVAL '10 days',
        'completed'
    ),
    (
        gen_random_uuid(),
        'Anonymous Donor',
        NULL,
        100000.00,
        'RWF',
        'monthly',
        'bank_transfer',
        'Youth Programs',
        false,
        true,
        NOW() - INTERVAL '7 days',
        'completed'
    ),
    (
        gen_random_uuid(),
        'Christine Mukamana',
        'christine.m@email.com',
        25000.00,
        'RWF',
        'one-time',
        'mobile_money',
        'Cultural Preservation',
        true,
        false,
        NOW() - INTERVAL '3 days',
        'pending'
    )
ON CONFLICT DO NOTHING;

-- ===============================================
-- 5. SAMPLE GROUP PERMISSIONS AND ASSIGNMENTS
-- ===============================================

-- Get existing group and permission IDs for assignments
DO $$
DECLARE
    super_admin_group_id UUID;
    admin_group_id UUID;
    editor_group_id UUID;
    author_group_id UUID;
    reviewer_group_id UUID;

    create_content_perm_id UUID;
    edit_content_perm_id UUID;
    delete_content_perm_id UUID;
    publish_content_perm_id UUID;
    review_content_perm_id UUID;
    manage_users_perm_id UUID;
    manage_groups_perm_id UUID;
    view_analytics_perm_id UUID;
BEGIN
    -- Get group IDs
    SELECT id INTO super_admin_group_id FROM groups WHERE name = 'Super Administrators' LIMIT 1;
    SELECT id INTO admin_group_id FROM groups WHERE name = 'Administrators' LIMIT 1;
    SELECT id INTO editor_group_id FROM groups WHERE name = 'Content Managers' LIMIT 1;
    SELECT id INTO author_group_id FROM groups WHERE name = 'Content Initiators' LIMIT 1;
    SELECT id INTO reviewer_group_id FROM groups WHERE name = 'Content Reviewers' LIMIT 1;

    -- Get permission IDs
    SELECT id INTO create_content_perm_id FROM permissions WHERE slug = 'create.content' LIMIT 1;
    SELECT id INTO edit_content_perm_id FROM permissions WHERE slug = 'edit.content' LIMIT 1;
    SELECT id INTO delete_content_perm_id FROM permissions WHERE slug = 'delete.content' LIMIT 1;
    SELECT id INTO publish_content_perm_id FROM permissions WHERE slug = 'publish.content' LIMIT 1;
    SELECT id INTO review_content_perm_id FROM permissions WHERE slug = 'review.content' LIMIT 1;
    SELECT id INTO manage_users_perm_id FROM permissions WHERE slug = 'manage.users' LIMIT 1;
    SELECT id INTO manage_groups_perm_id FROM permissions WHERE slug = 'manage.groups' LIMIT 1;
    SELECT id INTO view_analytics_perm_id FROM permissions WHERE slug = 'view.analytics' LIMIT 1;

    -- Assign permissions to Super Administrators (full access)
    IF super_admin_group_id IS NOT NULL AND create_content_perm_id IS NOT NULL THEN
        INSERT INTO group_permissions (group_id, permission_id, created_at)
        VALUES
            (super_admin_group_id, create_content_perm_id, NOW()),
            (super_admin_group_id, edit_content_perm_id, NOW()),
            (super_admin_group_id, delete_content_perm_id, NOW()),
            (super_admin_group_id, publish_content_perm_id, NOW()),
            (super_admin_group_id, review_content_perm_id, NOW()),
            (super_admin_group_id, manage_users_perm_id, NOW()),
            (super_admin_group_id, manage_groups_perm_id, NOW()),
            (super_admin_group_id, view_analytics_perm_id, NOW())
        ON CONFLICT (group_id, permission_id) DO NOTHING;
    END IF;

    -- Assign permissions to Administrators (most access except system management)
    IF admin_group_id IS NOT NULL AND create_content_perm_id IS NOT NULL THEN
        INSERT INTO group_permissions (group_id, permission_id, created_at)
        VALUES
            (admin_group_id, create_content_perm_id, NOW()),
            (admin_group_id, edit_content_perm_id, NOW()),
            (admin_group_id, delete_content_perm_id, NOW()),
            (admin_group_id, publish_content_perm_id, NOW()),
            (admin_group_id, review_content_perm_id, NOW()),
            (admin_group_id, manage_users_perm_id, NOW()),
            (admin_group_id, view_analytics_perm_id, NOW())
        ON CONFLICT (group_id, permission_id) DO NOTHING;
    END IF;

    -- Assign permissions to Content Managers (content workflow)
    IF editor_group_id IS NOT NULL AND create_content_perm_id IS NOT NULL THEN
        INSERT INTO group_permissions (group_id, permission_id, created_at)
        VALUES
            (editor_group_id, create_content_perm_id, NOW()),
            (editor_group_id, edit_content_perm_id, NOW()),
            (editor_group_id, publish_content_perm_id, NOW()),
            (editor_group_id, review_content_perm_id, NOW()),
            (editor_group_id, view_analytics_perm_id, NOW())
        ON CONFLICT (group_id, permission_id) DO NOTHING;
    END IF;

    -- Assign permissions to Content Initiators (basic content creation)
    IF author_group_id IS NOT NULL AND create_content_perm_id IS NOT NULL THEN
        INSERT INTO group_permissions (group_id, permission_id, created_at)
        VALUES
            (author_group_id, create_content_perm_id, NOW()),
            (author_group_id, edit_content_perm_id, NOW())
        ON CONFLICT (group_id, permission_id) DO NOTHING;
    END IF;

    -- Assign permissions to Content Reviewers (review only)
    IF reviewer_group_id IS NOT NULL AND review_content_perm_id IS NOT NULL THEN
        INSERT INTO group_permissions (group_id, permission_id, created_at)
        VALUES
            (reviewer_group_id, review_content_perm_id, NOW())
        ON CONFLICT (group_id, permission_id) DO NOTHING;
    END IF;

    RAISE NOTICE '✅ Group permissions assigned successfully';
END $$;

-- ===============================================
-- 6. SUCCESS MESSAGE
-- ===============================================

DO $$
DECLARE
    contact_count INTEGER;
    membership_count INTEGER;
    volunteer_count INTEGER;
    partnership_count INTEGER;
    donation_count INTEGER;
    group_permission_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO contact_count FROM contact_submissions;
    SELECT COUNT(*) INTO membership_count FROM membership_applications;
    SELECT COUNT(*) INTO volunteer_count FROM volunteer_applications;
    SELECT COUNT(*) INTO partnership_count FROM partnership_applications;
    SELECT COUNT(*) INTO donation_count FROM donations;
    SELECT COUNT(*) INTO group_permission_count FROM group_permissions;

    RAISE NOTICE '========================================';
    RAISE NOTICE 'COMPLETE SAMPLE DATA SEEDED SUCCESSFULLY';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ Created sample content for commenting';
    RAISE NOTICE '✅ Added sample chat messages';
    RAISE NOTICE '✅ Created sample user profiles';
    RAISE NOTICE '✅ Added % contact submissions', contact_count;
    RAISE NOTICE '✅ Added % membership applications', membership_count;
    RAISE NOTICE '✅ Added % volunteer applications', volunteer_count;
    RAISE NOTICE '✅ Added % partnership applications', partnership_count;
    RAISE NOTICE '✅ Added % donations', donation_count;
    RAISE NOTICE '✅ Added % group permission assignments', group_permission_count;
    RAISE NOTICE '';
    RAISE NOTICE 'The application now has comprehensive sample data for:';
    RAISE NOTICE '- Content pages with commenting enabled';
    RAISE NOTICE '- Chat messages for testing';
    RAISE NOTICE '- User profiles for presence features';
    RAISE NOTICE '- Contact form submissions';
    RAISE NOTICE '- Membership applications';
    RAISE NOTICE '- Volunteer applications';
    RAISE NOTICE '- Partnership applications';
    RAISE NOTICE '- Donation records';
    RAISE NOTICE '- Group permission assignments';
    RAISE NOTICE '';
    RAISE NOTICE 'You can now test all features with realistic data!';
    RAISE NOTICE '========================================';
END $$;
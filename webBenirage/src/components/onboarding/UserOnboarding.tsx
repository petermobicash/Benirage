/**
 * User Onboarding Workflow Component
 * Guides new users through account setup and system familiarization
 */

import React, { useState } from 'react';
import { CheckCircle, Circle, ArrowRight, ArrowLeft, X, User, Shield, Users, Settings, BookOpen, CheckSquare } from 'lucide-react';
import Button from '../ui/Button';
import FormField from '../ui/FormField';
import { useToast } from '../../hooks/useToast';
import { supabase } from '../../lib/supabase';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  component: React.ReactNode;
  required: boolean;
  completed: boolean;
}

interface UserOnboardingProps {
  userId: string;
  userEmail: string;
  onComplete: () => void;
  onSkip: () => void;
}

interface ProfileData {
  name: string;
  department: string;
  position: string;
  bio: string;
  phone: string;
  location: string;
  timezone: string;
  language_preference: string;
}

interface NotificationPreferences {
  email_notifications: boolean;
  push_notifications: boolean;
  weekly_digest: boolean;
  security_alerts: boolean;
}

const UserOnboarding: React.FC<UserOnboardingProps> = ({
  userId,
  userEmail,
  onComplete,
  onSkip
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [profileData, setProfileData] = useState<ProfileData>({
    name: '',
    department: '',
    position: '',
    bio: '',
    phone: '',
    location: '',
    timezone: 'UTC',
    language_preference: 'en'
  });
  const [groupSelections, setGroupSelections] = useState<string[]>([]);
  const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreferences>({
    email_notifications: true,
    push_notifications: true,
    weekly_digest: true,
    security_alerts: true
  });
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to Beni Rage',
      description: 'Let\'s get you set up with your account',
      icon: <User className="w-6 h-6" />,
      component: <WelcomeStep userEmail={userEmail} />,
      required: true,
      completed: completedSteps.has('welcome')
    },
    {
      id: 'profile',
      title: 'Complete Your Profile',
      description: 'Add your personal information and preferences',
      icon: <User className="w-6 h-6" />,
      component: <ProfileStep
        profileData={profileData}
        setProfileData={setProfileData}
      />,
      required: true,
      completed: completedSteps.has('profile')
    },
    {
      id: 'permissions',
      title: 'Understand Your Permissions',
      description: 'Learn about your role and what you can do',
      icon: <Shield className="w-6 h-6" />,
      component: <PermissionsStep />,
      required: true,
      completed: completedSteps.has('permissions')
    },
    {
      id: 'groups',
      title: 'Join Groups',
      description: 'Connect with teams and communities',
      icon: <Users className="w-6 h-6" />,
      component: <GroupsStep
        selections={groupSelections}
        setSelections={setGroupSelections}
      />,
      required: false,
      completed: completedSteps.has('groups')
    },
    {
      id: 'notifications',
      title: 'Set Notification Preferences',
      description: 'Choose how you want to stay updated',
      icon: <Settings className="w-6 h-6" />,
      component: <NotificationsStep
        preferences={notificationPreferences}
        setPreferences={setNotificationPreferences}
      />,
      required: false,
      completed: completedSteps.has('notifications')
    },
    {
      id: 'tutorial',
      title: 'Quick Tutorial',
      description: 'Learn the basics of using the platform',
      icon: <BookOpen className="w-6 h-6" />,
      component: <TutorialStep />,
      required: false,
      completed: completedSteps.has('tutorial')
    }
  ];

  const handleStepComplete = async (stepId: string) => {
    setCompletedSteps(prev => new Set([...prev, stepId]));

    if (stepId === 'profile') {
      await saveProfile();
    } else if (stepId === 'groups') {
      await saveGroupSelections();
    } else if (stepId === 'notifications') {
      await saveNotificationPreferences();
    }
  };

  const saveProfile = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          name: profileData.name,
          full_name: profileData.name,
          department: profileData.department,
          position: profileData.position,
          bio: profileData.bio,
          phone: profileData.phone,
          location: profileData.location,
          timezone: profileData.timezone,
          language_preference: profileData.language_preference,
          profile_completed: true,
          onboarding_completed: true
        })
        .eq('user_id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error saving profile:', error);
      showToast('Failed to save profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const saveGroupSelections = async () => {
    if (groupSelections.length === 0) return;

    setLoading(true);
    try {
      // This would typically call your group assignment API
      // For now, we'll just mark as completed
      console.log('Would assign user to groups:', groupSelections);
    } catch (error) {
      console.error('Error saving group selections:', error);
      showToast('Failed to save group selections', 'error');
    } finally {
      setLoading(false);
    }
  };

  const saveNotificationPreferences = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          notification_preferences: notificationPreferences
        })
        .eq('user_id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error saving notification preferences:', error);
      showToast('Failed to save notification preferences', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    const step = steps[currentStep];
    if (step && !step.completed) {
      await handleStepComplete(step.id);
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      // Mark onboarding as completed
      await supabase
        .from('user_profiles')
        .update({
          onboarding_completed: true,
          onboarding_completed_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      // Log onboarding completion in console for now
      console.log('User completed onboarding:', { userId, timestamp: new Date().toISOString() });

      showToast('Welcome to Beni Rage! Your account is ready.', 'success');
      onComplete();
    } catch (error) {
      console.error('Error completing onboarding:', error);
      showToast('Failed to complete onboarding', 'error');
    } finally {
      setLoading(false);
    }
  };

  const currentStepData = steps[currentStep];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Welcome to Beni Rage!</h2>
            <p className="text-gray-600">Let's get you set up and ready to go</p>
          </div>
          <Button variant="ghost" onClick={onSkip}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex items-center space-x-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    index <= currentStep ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {step.completed ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : index === currentStep ? (
                      step.icon
                    ) : (
                      <Circle className="w-4 h-4" />
                    )}
                  </div>
                  <div className="hidden sm:block">
                    <p className={`text-sm font-medium ${index <= currentStep ? 'text-gray-900' : 'text-gray-500'}`}>
                      {step.title}
                    </p>
                    {!step.required && (
                      <p className="text-xs text-gray-400">Optional</p>
                    )}
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <ArrowRight className="w-4 h-4 text-gray-400 mx-4 hidden sm:block" />
                )}
              </div>
            ))}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="min-h-96 mb-6">
          {currentStepData?.component}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              Step {currentStep + 1} of {steps.length}
            </span>
            {currentStep === steps.length - 1 ? (
              <Button
                onClick={handleComplete}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700"
              >
                {loading ? 'Completing...' : 'Complete Setup'}
                <CheckSquare className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleNext} disabled={loading}>
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Step Components
const WelcomeStep: React.FC<{ userEmail: string }> = ({ userEmail }) => (
  <div className="text-center py-8">
    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
      <User className="w-8 h-8 text-blue-600" />
    </div>
    <h3 className="text-xl font-semibold text-gray-900 mb-2">Welcome to Beni Rage!</h3>
    <p className="text-gray-600 mb-4">
      We're excited to have you join our community. This quick setup will help you get the most out of your account.
    </p>
    <div className="bg-blue-50 p-4 rounded-lg">
      <p className="text-sm text-blue-800">
        <strong>Your account:</strong> {userEmail}
      </p>
    </div>
  </div>
);

const ProfileStep: React.FC<{
  profileData: ProfileData;
  setProfileData: (data: ProfileData) => void;
}> = ({ profileData, setProfileData }) => (
  <div className="space-y-4">
    <div className="text-center mb-6">
      <h3 className="text-lg font-medium text-gray-900 mb-2">Tell us about yourself</h3>
      <p className="text-gray-600">This information helps us personalize your experience</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField
        label="Full Name"
        type="text"
        value={profileData.name}
        onChange={(value) => setProfileData({ ...profileData, name: value })}
        required
        placeholder="Enter your full name"
      />

      <FormField
        label="Department"
        type="text"
        value={profileData.department}
        onChange={(value) => setProfileData({ ...profileData, department: value })}
        placeholder="e.g., Content, Membership, Administration"
      />

      <FormField
        label="Position"
        type="text"
        value={profileData.position}
        onChange={(value) => setProfileData({ ...profileData, position: value })}
        placeholder="e.g., Manager, Coordinator, Specialist"
      />

      <FormField
        label="Phone"
        type="tel"
        value={profileData.phone}
        onChange={(value) => setProfileData({ ...profileData, phone: value })}
        placeholder="+250 ..."
      />

      <FormField
        label="Location"
        type="text"
        value={profileData.location}
        onChange={(value) => setProfileData({ ...profileData, location: value })}
        placeholder="City, Country"
      />

      <FormField
        label="Timezone"
        type="select"
        value={profileData.timezone}
        onChange={(value) => setProfileData({ ...profileData, timezone: value })}
        options={[
          { value: 'UTC', label: 'UTC' },
          { value: 'Africa/Kigali', label: 'East Africa Time' },
          { value: 'America/New_York', label: 'Eastern Time' },
          { value: 'Europe/London', label: 'Greenwich Mean Time' }
        ]}
      />
    </div>

    <FormField
      label="Bio"
      type="textarea"
      value={profileData.bio}
      onChange={(value) => setProfileData({ ...profileData, bio: value })}
      rows={3}
      placeholder="Tell us a bit about yourself..."
    />
  </div>
);

const PermissionsStep: React.FC = () => (
  <div className="space-y-4">
    <div className="text-center mb-6">
      <h3 className="text-lg font-medium text-gray-900 mb-2">Your Role & Permissions</h3>
      <p className="text-gray-600">Understanding what you can do in the system</p>
    </div>

    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      <div className="flex items-start space-x-3">
        <Shield className="w-5 h-5 text-yellow-600 mt-0.5" />
        <div>
          <h4 className="font-medium text-yellow-800">Role: Community Member</h4>
          <p className="text-sm text-yellow-700 mt-1">
            You have access to view content, participate in discussions, and manage your profile.
            As you contribute more to the community, you may be granted additional permissions.
          </p>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="font-medium text-green-800 mb-2">What you can do:</h4>
        <ul className="text-sm text-green-700 space-y-1">
          <li>• View and read content</li>
          <li>• Participate in discussions</li>
          <li>• Edit your profile</li>
          <li>• Join groups and communities</li>
          <li>• Receive notifications</li>
        </ul>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-800 mb-2">Growing your access:</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Contribute regularly to gain editor access</li>
          <li>• Join specialized groups for advanced features</li>
          <li>• Take on volunteer roles for expanded permissions</li>
          <li>• Community leaders get moderation capabilities</li>
        </ul>
      </div>
    </div>
  </div>
);

const GroupsStep: React.FC<{
  selections: string[];
  setSelections: (selections: string[]) => void;
}> = ({ selections, setSelections }) => {
  const availableGroups = [
    { id: 'general', name: 'General Discussion', description: 'Open forum for all community members' },
    { id: 'culture', name: 'Cultural Exchange', description: 'Share and learn about Rwandan culture' },
    { id: 'volunteers', name: 'Volunteer Network', description: 'Connect with volunteer opportunities' },
    { id: 'events', name: 'Event Organizers', description: 'Plan and coordinate community events' }
  ];

  const handleGroupToggle = (groupId: string) => {
    const newSelections = selections.includes(groupId)
      ? selections.filter((id: string) => id !== groupId)
      : [...selections, groupId];
    setSelections(newSelections);
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Join Communities</h3>
        <p className="text-gray-600">Connect with groups that interest you</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {availableGroups.map((group) => (
          <div key={group.id} className="border rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                checked={selections.includes(group.id)}
                onChange={() => handleGroupToggle(group.id)}
                className="mt-1"
              />
              <div>
                <h4 className="font-medium text-gray-900">{group.name}</h4>
                <p className="text-sm text-gray-600">{group.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Tip:</strong> You can always join or leave groups later from your profile settings.
          Group membership helps you connect with like-minded community members.
        </p>
      </div>
    </div>
  );
};

const NotificationsStep: React.FC<{
  preferences: NotificationPreferences;
  setPreferences: (preferences: NotificationPreferences) => void;
}> = ({ preferences, setPreferences }) => (
  <div className="space-y-4">
    <div className="text-center mb-6">
      <h3 className="text-lg font-medium text-gray-900 mb-2">Notification Preferences</h3>
      <p className="text-gray-600">Choose how you want to stay updated</p>
    </div>

    <div className="space-y-3">
      {[
        { key: 'email_notifications', label: 'Email Notifications', description: 'Important updates via email' },
        { key: 'push_notifications', label: 'Push Notifications', description: 'Real-time notifications in your browser' },
        { key: 'weekly_digest', label: 'Weekly Digest', description: 'Summary of community activity' },
        { key: 'security_alerts', label: 'Security Alerts', description: 'Account security and login notifications' }
      ].map((item) => (
        <div key={item.key} className="flex items-center justify-between p-3 border rounded-lg">
          <div>
            <h4 className="font-medium text-gray-900">{item.label}</h4>
            <p className="text-sm text-gray-600">{item.description}</p>
          </div>
          <input
            type="checkbox"
            checked={preferences[item.key as keyof typeof preferences]}
            onChange={(e) => setPreferences({
              ...preferences,
              [item.key]: e.target.checked
            })}
            className="rounded"
          />
        </div>
      ))}
    </div>
  </div>
);

const TutorialStep: React.FC = () => (
  <div className="space-y-4">
    <div className="text-center mb-6">
      <h3 className="text-lg font-medium text-gray-900 mb-2">Quick Start Guide</h3>
      <p className="text-gray-600">Here are some tips to get you started</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
            <span className="text-blue-600 font-semibold text-sm">1</span>
          </div>
          <div>
            <h4 className="font-medium text-gray-900">Explore Content</h4>
            <p className="text-sm text-gray-600">Browse articles, stories, and cultural content</p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
            <span className="text-blue-600 font-semibold text-sm">2</span>
          </div>
          <div>
            <h4 className="font-medium text-gray-900">Join Discussions</h4>
            <p className="text-sm text-gray-600">Participate in community conversations</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
            <span className="text-blue-600 font-semibold text-sm">3</span>
          </div>
          <div>
            <h4 className="font-medium text-gray-900">Connect with Others</h4>
            <p className="text-sm text-gray-600">Join groups and build relationships</p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
            <span className="text-blue-600 font-semibold text-sm">4</span>
          </div>
          <div>
            <h4 className="font-medium text-gray-900">Share Your Story</h4>
            <p className="text-sm text-gray-600">Contribute content and experiences</p>
          </div>
        </div>
      </div>
    </div>

    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
      <div className="flex items-start space-x-3">
        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
        <div>
          <h4 className="font-medium text-green-800">Ready to explore!</h4>
          <p className="text-sm text-green-700 mt-1">
            You can always access help and settings from the main menu.
            Welcome to the Beni Rage community!
          </p>
        </div>
      </div>
    </div>
  </div>
);

export default UserOnboarding;
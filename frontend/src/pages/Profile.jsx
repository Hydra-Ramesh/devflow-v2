import { useState } from 'react';
import { useParams } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import { useProfile, useBookmarks } from '../services/queries';
import { ProfileSkeleton } from '../components/ui/Skeletons';

import ProfileHeader from '../components/profile/ProfileHeader';
import ProfileBadges from '../components/profile/ProfileBadges';
import ProfileTabs from '../components/profile/ProfileTabs';
import ProfileTabContent from '../components/profile/ProfileTabContent';

export default function Profile() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('all_questions');

  const { data: profileData, isLoading: profileLoading, error: profileError } = useProfile(id);
  const profile = profileData?.profile;
  const recentQuestions = profileData?.recentQuestions || [];
  const allQuestions = profileData?.allQuestions || [];

  const isCurrentUser = user?.id === id;
  const shouldFetchBookmarks = activeTab === 'bookmarks' && isCurrentUser;
  
  const { data: bookmarks = [] } = useBookmarks(shouldFetchBookmarks);

  if (profileLoading) {
    return <ProfileSkeleton />;
  }

  if (profileError || !profile) {
    return (
      <div className="max-w-4xl mx-auto py-8 text-center text-red-500">
        {profileError?.message || 'Profile not found'}
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4 space-y-10">
      <ProfileHeader profile={profile} isCurrentUser={isCurrentUser} currentUser={user} />
      
      <ProfileBadges badges={profile.badges} />
      
      <ProfileTabs 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isCurrentUser={isCurrentUser} 
      />
      
      <div className="space-y-4">
        <ProfileTabContent 
          activeTab={activeTab}
          allQuestions={allQuestions}
          recentQuestions={recentQuestions}
          bookmarks={bookmarks}
          profile={profile}
        />
      </div>
    </div>
  );
}

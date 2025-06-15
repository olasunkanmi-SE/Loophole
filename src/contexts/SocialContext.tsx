
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Friend {
  id: string;
  email: string;
  name: string;
  points: number;
  level: number;
  joinedAt: Date;
}

interface Referral {
  id: string;
  email: string;
  status: 'pending' | 'completed';
  sentAt: Date;
  completedAt?: Date;
  pointsEarned: number;
}

interface SocialContextType {
  friends: Friend[];
  referrals: Referral[];
  referralCode: string;
  addFriend: (friend: Omit<Friend, 'id' | 'joinedAt'>) => void;
  sendReferral: (email: string) => void;
  completeReferral: (referralId: string) => void;
  generateReferralCode: () => string;
  shareAchievement: (achievement: string) => void;
  getLeaderboard: () => Friend[];
}

const SocialContext = createContext<SocialContextType | undefined>(undefined);

export const useSocial = () => {
  const context = useContext(SocialContext);
  if (!context) {
    throw new Error('useSocial must be used within a SocialProvider');
  }
  return context;
};

interface SocialProviderProps {
  children: ReactNode;
}

export const SocialProvider: React.FC<SocialProviderProps> = ({ children }) => {
  const [friends, setFriends] = useState<Friend[]>(() => {
    const saved = localStorage.getItem('friends');
    return saved ? JSON.parse(saved) : [];
  });

  const [referrals, setReferrals] = useState<Referral[]>(() => {
    const saved = localStorage.getItem('referrals');
    return saved ? JSON.parse(saved) : [];
  });

  const [referralCode] = useState(() => {
    const saved = localStorage.getItem('referralCode');
    return saved || generateReferralCode();
  });

  function generateReferralCode(): string {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    localStorage.setItem('referralCode', code);
    return code;
  }

  const addFriend = (friendData: Omit<Friend, 'id' | 'joinedAt'>) => {
    const friend: Friend = {
      ...friendData,
      id: Date.now().toString(),
      joinedAt: new Date(),
    };

    setFriends(prev => {
      const updated = [...prev, friend];
      localStorage.setItem('friends', JSON.stringify(updated));
      return updated;
    });
  };

  const sendReferral = (email: string) => {
    const referral: Referral = {
      id: Date.now().toString(),
      email,
      status: 'pending',
      sentAt: new Date(),
      pointsEarned: 0,
    };

    setReferrals(prev => {
      const updated = [...prev, referral];
      localStorage.setItem('referrals', JSON.stringify(updated));
      return updated;
    });

    // In a real app, you'd send an email here
    console.log(`Referral sent to ${email} with code: ${referralCode}`);
  };

  const completeReferral = (referralId: string) => {
    setReferrals(prev => {
      const updated = prev.map(ref => 
        ref.id === referralId 
          ? { ...ref, status: 'completed' as const, completedAt: new Date(), pointsEarned: 10 }
          : ref
      );
      localStorage.setItem('referrals', JSON.stringify(updated));
      return updated;
    });
  };

  const shareAchievement = (achievement: string) => {
    if (navigator.share) {
      navigator.share({
        title: 'EarnEats Achievement',
        text: `I just unlocked "${achievement}" on EarnEats! Join me and start earning points for food!`,
        url: `${window.location.origin}?ref=${referralCode}`,
      });
    } else {
      // Fallback for browsers without Web Share API
      const shareText = `I just unlocked "${achievement}" on EarnEats! Join me and start earning points for food! ${window.location.origin}?ref=${referralCode}`;
      navigator.clipboard.writeText(shareText);
      // Note: This would need notification context to be used where shareAchievement is called
      console.log('Achievement shared! Link copied to clipboard.');
    }
  };

  const getLeaderboard = (): Friend[] => {
    return [...friends].sort((a, b) => b.points - a.points).slice(0, 10);
  };

  const value: SocialContextType = {
    friends,
    referrals,
    referralCode,
    addFriend,
    sendReferral,
    completeReferral,
    generateReferralCode,
    shareAchievement,
    getLeaderboard,
  };

  return (
    <SocialContext.Provider value={value}>
      {children}
    </SocialContext.Provider>
  );
};

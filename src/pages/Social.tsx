
import { useState } from "react";
import MobileHeader from "../components/MobileHeader";
import MobileContainer from "../components/MobileContainer";
import { useLocation } from "wouter";
import { useSocial } from "../contexts/SocialContext";
import { usePoints } from "../contexts/PointsContext";
import { Users, Gift, Crown, Share2, Copy, Mail, Trophy } from "lucide-react";

export default function Social() {
  const [, setLocation] = useLocation();
  const { friends, referrals, referralCode, sendReferral, getLeaderboard } = useSocial();
  const { getTotalPoints } = usePoints();
  const [activeTab, setActiveTab] = useState<'friends' | 'referrals' | 'leaderboard'>('friends');
  const [referralEmail, setReferralEmail] = useState('');

  const leaderboard = getLeaderboard();
  const userRank = leaderboard.findIndex(f => f.email === 'current-user') + 1; // Mock current user

  const handleSendReferral = () => {
    if (referralEmail) {
      sendReferral(referralEmail);
      setReferralEmail('');
      alert('Referral sent! Your friend will earn 5 points when they sign up, and you\'ll get 10 points!');
    }
  };

  const copyReferralCode = () => {
    const referralLink = `${window.location.origin}?ref=${referralCode}`;
    navigator.clipboard.writeText(referralLink);
    alert('Referral link copied to clipboard!');
  };

  const shareReferralCode = () => {
    const referralLink = `${window.location.origin}?ref=${referralCode}`;
    const text = `Join me on EarnEats and start earning points for food! Use my referral code: ${referralCode}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Join EarnEats',
        text: text,
        url: referralLink,
      });
    } else {
      navigator.clipboard.writeText(`${text} ${referralLink}`);
      alert('Referral message copied to clipboard!');
    }
  };

  return (
    <MobileContainer>
      <div className="bg-gray-50 min-h-screen">
        <MobileHeader 
          title="Social" 
          onBack={() => setLocation('/profile')}
        />

        <div className="p-4 space-y-4">
          {/* Referral Code Card */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-4 text-white">
            <div className="text-center">
              <Gift className="mx-auto mb-2" size={24} />
              <h3 className="font-semibold mb-1">Your Referral Code</h3>
              <div className="bg-white/20 rounded-lg p-3 mb-3">
                <span className="text-2xl font-bold tracking-wider">{referralCode}</span>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={copyReferralCode}
                  className="flex-1 bg-white/20 hover:bg-white/30 rounded-lg py-2 px-3 text-sm font-medium transition-colors flex items-center justify-center space-x-1"
                >
                  <Copy size={14} />
                  <span>Copy Link</span>
                </button>
                <button
                  onClick={shareReferralCode}
                  className="flex-1 bg-white/20 hover:bg-white/30 rounded-lg py-2 px-3 text-sm font-medium transition-colors flex items-center justify-center space-x-1"
                >
                  <Share2 size={14} />
                  <span>Share</span>
                </button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg p-1">
            <div className="grid grid-cols-3 gap-1">
              <button
                onClick={() => setActiveTab('friends')}
                className={`py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'friends'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Friends
              </button>
              <button
                onClick={() => setActiveTab('referrals')}
                className={`py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'referrals'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Referrals
              </button>
              <button
                onClick={() => setActiveTab('leaderboard')}
                className={`py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'leaderboard'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Leaders
              </button>
            </div>
          </div>

          {/* Content */}
          {activeTab === 'friends' && (
            <div className="space-y-4">
              {/* Add Friend */}
              <div className="bg-white rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Invite Friends</h4>
                <div className="flex space-x-2">
                  <input
                    type="email"
                    placeholder="Enter friend's email"
                    value={referralEmail}
                    onChange={(e) => setReferralEmail(e.target.value)}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  />
                  <button
                    onClick={handleSendReferral}
                    disabled={!referralEmail}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Send
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Your friend gets 5 points, you get 10 points when they sign up!
                </p>
              </div>

              {/* Friends List */}
              <div className="bg-white rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Friends ({friends.length})</h4>
                {friends.length === 0 ? (
                  <div className="text-center py-6">
                    <Users className="mx-auto text-gray-300 mb-2" size={32} />
                    <p className="text-gray-500 text-sm">No friends yet</p>
                    <p className="text-gray-400 text-xs">Invite friends to start earning together!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {friends.map((friend) => (
                      <div key={friend.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-medium">
                              {friend.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{friend.name}</p>
                            <p className="text-sm text-gray-500">Level {friend.level}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">{friend.points} pts</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'referrals' && (
            <div className="bg-white rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Referral History</h4>
              {referrals.length === 0 ? (
                <div className="text-center py-6">
                  <Mail className="mx-auto text-gray-300 mb-2" size={32} />
                  <p className="text-gray-500 text-sm">No referrals sent yet</p>
                  <p className="text-gray-400 text-xs">Start inviting friends to earn bonus points!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {referrals.map((referral) => (
                    <div key={referral.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{referral.email}</p>
                        <p className="text-sm text-gray-500">
                          Sent {new Date(referral.sentAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          referral.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {referral.status}
                        </span>
                        {referral.status === 'completed' && (
                          <p className="text-sm text-green-600 mt-1">+{referral.pointsEarned} pts</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'leaderboard' && (
            <div className="bg-white rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Top Earners</h4>
              {leaderboard.length === 0 ? (
                <div className="text-center py-6">
                  <Trophy className="mx-auto text-gray-300 mb-2" size={32} />
                  <p className="text-gray-500 text-sm">No rankings yet</p>
                  <p className="text-gray-400 text-xs">Complete surveys to climb the leaderboard!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {leaderboard.map((friend, index) => (
                    <div key={friend.id} className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        index === 0 ? 'bg-yellow-100' :
                        index === 1 ? 'bg-gray-100' :
                        index === 2 ? 'bg-orange-100' :
                        'bg-blue-100'
                      }`}>
                        {index < 3 ? (
                          <Crown className={`${
                            index === 0 ? 'text-yellow-600' :
                            index === 1 ? 'text-gray-600' :
                            'text-orange-600'
                          }`} size={16} />
                        ) : (
                          <span className="text-blue-600 font-medium text-sm">{index + 1}</span>
                        )}
                      </div>
                      <div className="flex-1 flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{friend.name}</p>
                          <p className="text-sm text-gray-500">Level {friend.level}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">{friend.points} pts</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </MobileContainer>
  );
}

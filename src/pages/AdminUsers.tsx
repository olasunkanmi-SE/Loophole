import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import MobileHeader from '../components/MobileHeader';
import MobileContainer from '../components/MobileContainer';
import { 
  Search, 
  Filter, 
  User, 
  Mail, 
  Calendar, 
  MapPin, 
  Coins,
  ShoppingCart,
  Ban,
  CheckCircle,
  MoreVertical
} from 'lucide-react';

interface UserData {
  _id: string;
  email: string;
  created_at: string;
  profile?: {
    first_name?: string;
    last_name?: string;
    phone?: string;
    location?: string;
  };
  stats?: {
    totalOrders: number;
    totalSpent: number;
    pointsEarned: number;
    lastActive: string;
  };
  status: 'active' | 'suspended';
}

export default function AdminUsers() {
  const [, setLocation] = useLocation();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = async (userId: string, action: 'suspend' | 'activate') => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/${action}`, {
        method: 'POST'
      });
      if (response.ok) {
        fetchUsers(); // Refresh user list
      }
    } catch (error) {
      console.error(`Error ${action}ing user:`, error);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.profile?.first_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.profile?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const UserCard = ({ user }: { user: UserData }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <User size={20} className="text-blue-600" />
          </div>
          <div>
            <div className="font-medium text-gray-900">
              {user.profile?.first_name && user.profile?.last_name 
                ? `${user.profile.first_name} ${user.profile.last_name}`
                : 'No Name Set'
              }
            </div>
            <div className="text-sm text-gray-600 flex items-center gap-1">
              <Mail size={14} />
              {user.email}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 text-xs rounded-full ${
            user.status === 'active' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {user.status}
          </span>
          <button
            onClick={() => {
              setSelectedUser(user);
              setShowUserModal(true);
            }}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <MoreVertical size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="flex items-center gap-2 text-gray-600">
          <Calendar size={14} />
          <span>Joined {new Date(user.created_at).toLocaleDateString()}</span>
        </div>
        {user.profile?.location && (
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin size={14} />
            <span>{user.profile.location}</span>
          </div>
        )}
      </div>

      {user.stats && (
        <div className="grid grid-cols-3 gap-4 pt-2 border-t border-gray-100">
          <div className="text-center">
            <div className="font-semibold text-green-600">{user.stats.totalOrders}</div>
            <div className="text-xs text-gray-500">Orders</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-blue-600">RM {user.stats.totalSpent}</div>
            <div className="text-xs text-gray-500">Spent</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-purple-600">{user.stats.pointsEarned}</div>
            <div className="text-xs text-gray-500">Points</div>
          </div>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <MobileContainer>
        <div className="bg-white min-h-screen">
          <MobileHeader 
            title="User Management" 
            onBack={() => setLocation('/admin/dashboard')}
          />
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </MobileContainer>
    );
  }

  return (
    <MobileContainer>
      <div className="bg-gray-50 min-h-screen">
        <MobileHeader 
          title="User Management" 
          onBack={() => setLocation('/admin/dashboard')}
        />

        <div className="p-4 space-y-4">
          {/* Search and Filters */}
          <div className="bg-white rounded-lg p-4 space-y-3">
            <div className="relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1 text-sm rounded-full ${
                  statusFilter === 'all' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                All Users
              </button>
              <button
                onClick={() => setStatusFilter('active')}
                className={`px-3 py-1 text-sm rounded-full ${
                  statusFilter === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setStatusFilter('suspended')}
                className={`px-3 py-1 text-sm rounded-full ${
                  statusFilter === 'suspended' 
                    ? 'bg-red-100 text-red-800' 
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                Suspended
              </button>
            </div>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white p-3 rounded-lg text-center">
              <div className="font-semibold text-lg">{users.length}</div>
              <div className="text-xs text-gray-500">Total Users</div>
            </div>
            <div className="bg-white p-3 rounded-lg text-center">
              <div className="font-semibold text-lg text-green-600">
                {users.filter(u => u.status === 'active').length}
              </div>
              <div className="text-xs text-gray-500">Active</div>
            </div>
            <div className="bg-white p-3 rounded-lg text-center">
              <div className="font-semibold text-lg text-red-600">
                {users.filter(u => u.status === 'suspended').length}
              </div>
              <div className="text-xs text-gray-500">Suspended</div>
            </div>
          </div>

          {/* User List */}
          <div className="space-y-3">
            {filteredUsers.map(user => (
              <UserCard key={user._id} user={user} />
            ))}
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8">
              <User size={48} className="mx-auto text-gray-400 mb-2" />
              <p className="text-gray-500">No users found matching your criteria</p>
            </div>
          )}
        </div>

        {/* User Details Modal */}
        {showUserModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-sm w-full max-h-[80vh] overflow-y-auto">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold">User Details</h3>
              </div>

              <div className="p-4 space-y-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <User size={24} className="text-blue-600" />
                  </div>
                  <h4 className="font-semibold">
                    {selectedUser.profile?.first_name && selectedUser.profile?.last_name 
                      ? `${selectedUser.profile.first_name} ${selectedUser.profile.last_name}`
                      : 'No Name Set'
                    }
                  </h4>
                  <p className="text-sm text-gray-600">{selectedUser.email}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => handleUserAction(selectedUser._id, 
                      selectedUser.status === 'active' ? 'suspend' : 'activate'
                    )}
                    className={`flex items-center justify-center gap-2 p-2 rounded-lg ${
                      selectedUser.status === 'active'
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {selectedUser.status === 'active' ? <Ban size={16} /> : <CheckCircle size={16} />}
                    <span className="text-sm">
                      {selectedUser.status === 'active' ? 'Suspend' : 'Activate'}
                    </span>
                  </button>
                  <button
                    onClick={() => setLocation(`/admin/users/${selectedUser._id}/orders`)}
                    className="flex items-center justify-center gap-2 p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                  >
                    <ShoppingCart size={16} />
                    <span className="text-sm">View Orders</span>
                  </button>
                </div>
              </div>

              <div className="p-4 border-t border-gray-200">
                <button
                  onClick={() => setShowUserModal(false)}
                  className="w-full py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MobileContainer>
  );
}
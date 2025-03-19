"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// This is a completely rewritten component that doesn't use any Firebase client SDKs
export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({});
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);
  const router = useRouter();

  // Fetch users only when component mounts
  useEffect(() => {
    fetchUsers();
  }, []);

  // Load user details when a user is selected
  useEffect(() => {
    if (selectedUserId) {
      fetchUserDetails(selectedUserId);
    } else {
      setSelectedUser(null);
    }
  }, [selectedUserId]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/get-users');
      if (!response.ok) throw new Error('Failed to fetch users');
      
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDetails = async (userId) => {
    try {
      const response = await fetch(`/api/admin/get-user?id=${userId}`);
      if (!response.ok) throw new Error('Failed to fetch user details');
      
      const userData = await response.json();
      setSelectedUser(userData);
      setFormData({
        fullName: userData.fullName || '',
        email: userData.email || '',
        phoneNumber: userData.phoneNumber || '',
        accountAgent: userData.accountAgent || '',
        dateOfBirth: userData.dateOfBirth || '',
        products: userData.products || '',
        nationality: userData.nationality || '',
        documents: userData.documents || '',
        securityLevel: userData.securityLevel || '',
        accountStatus: userData.accountStatus || ''
      });
    } catch (error) {
      console.error('Error fetching user details:', error);
      setFormError('Failed to load user details');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditUser = (userId) => {
    setSelectedUserId(userId);
    setFormError('');
    setFormSuccess(false);
  };

  const handleEditFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess(false);
    
    try {
      const response = await fetch('/api/admin/update-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uid: selectedUser.id,
          updates: formData
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setFormSuccess(true);
        fetchUsers(); // Refresh the list
      } else {
        setFormError(data.error || 'Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      setFormError('An error occurred while updating user');
    }
  };

  const cancelEdit = () => {
    setSelectedUserId(null);
    setFormData({});
    setFormError('');
    setFormSuccess(false);
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">User Management</h2>
      
      {loading ? (
        <p>Loading users...</p>
      ) : (
        <div>
          {!selectedUserId ? (
            <div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {user.fullName || 'No Name'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {user.email || 'No Email'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.accountStatus === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : user.accountStatus === 'suspended'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {user.accountStatus || 'Unknown'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleEditUser(user.id)}
                            className="text-indigo-600 hover:text-indigo-900 mr-4"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="mt-4 flex justify-end">
                <button
                  onClick={fetchUsers}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                  Refresh
                </button>
              </div>
            </div>
          ) : (
            <div>
              <h3 className="text-lg font-medium mb-4">Edit User</h3>
              
              {formError && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                  {formError}
                </div>
              )}
              
              {formSuccess && (
                <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
                  User updated successfully!
                </div>
              )}
              
              {selectedUser ? (
                <form onSubmit={handleEditFormSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Phone Number
                      </label>
                      <input
                        type="text"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Account Status
                      </label>
                      <select
                        name="accountStatus"
                        value={formData.accountStatus}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                      >
                        <option value="">Select Status</option>
                        <option value="active">Active</option>
                        <option value="pending">Pending</option>
                        <option value="suspended">Suspended</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm text-sm font-medium"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              ) : (
                <p>Loading user details...</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 
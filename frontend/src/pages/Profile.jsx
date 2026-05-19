import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../services/api';

const Profile = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [avatarError, setAvatarError] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await userAPI.getProfile();
      setProfile(response.data);
      setFormData(prev => ({
        ...prev,
        username: response.data.username || '',
        email: response.data.email || '',
      }));
    } catch (err) {
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);
    setAvatarError(false);

    const uploadData = new FormData();
    uploadData.append('file', file);

    try {
      const response = await userAPI.uploadAvatar(uploadData);
      setProfile(prev => ({
        ...prev,
        avatar_url: response.data.avatar_url
      }));
      setSuccess('Profile avatar updated successfully!');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to upload new avatar image');
    } finally {
      setSaving(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleUpdateProfile = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await userAPI.updateProfile({ 
        username: formData.username,
        email: formData.email 
      });
      setProfile(response.data);
      setSuccess('Account details updated successfully');
      setIsEditing(false);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      setSaving(false);
      return;
    }

    if (!formData.oldPassword) {
      setError('Current password is required');
      setSaving(false);
      return;
    }

    try {
      await userAPI.changePassword(formData.oldPassword, formData.newPassword);
      setSuccess('Password changed successfully');
      setFormData(prev => ({
        ...prev,
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure? This action cannot be undone.')) {
      return;
    }

    try {
      await userAPI.deleteAccount();
      localStorage.removeItem('token');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete account');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="material-symbols-outlined text-primary text-5xl animate-spin">
          progress_activity
        </span>
      </div>
    );
  }

  return (
    <main className="flex-grow max-w-container-max mx-auto w-full px-lg py-xl">
      <div className="max-w-4xl mx-auto space-y-xl">
        
        {/* User Header */}
        <section className="flex flex-col md:flex-row items-center gap-lg bg-surface border border-outline-variant p-xl rounded-xl">
          <div className="relative group">
            
            {/* Conditional User Icon/Avatar Rendering */}
            {profile?.avatar_url && !avatarError ? (
              <img
                alt="User Avatar"
                className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-surface shadow-sm"
                src={profile.avatar_url}
                onError={() => setAvatarError(true)}
              />
            ) : (
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-primary/10 border-4 border-surface shadow-sm flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[64px] md:text-[80px] select-none">
                  account_circle
                </span>
              </div>
            )}
            
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleAvatarChange}
            />

            <button 
              onClick={triggerFileInput}
              disabled={saving}
              className="absolute bottom-2 right-2 bg-primary text-white p-2 rounded-full shadow-lg hover:scale-95 transition-transform disabled:opacity-50"
              title="Change Profile Picture"
            >
              <span className="material-symbols-outlined text-body-md">edit</span>
            </button>
          </div>
          
          <div className="text-center md:text-left">
            <h1 className="text-headline-lg-mobile md:text-headline-lg font-headline-lg text-on-surface">
              {profile?.username || 'User'}
            </h1>
            <p className="text-on-surface-variant font-body-md text-body-md">
              {profile?.email || 'No email'}
            </p>
            <div className="mt-md flex flex-wrap justify-center md:justify-start gap-sm">
              <span className="bg-primary-container/10 text-on-primary-container px-md py-xs rounded-full text-label-md font-label-md flex items-center gap-xs">
                <span className="material-symbols-outlined text-[18px]">verified</span>
                Verified Account
              </span>
              <span className="bg-secondary-container/10 text-on-secondary-container px-md py-xs rounded-full text-label-md font-label-md flex items-center gap-xs">
                <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                Joined {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Recently'}
              </span>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
          {/* Account Details Form Section */}
          <div className="lg:col-span-1 space-y-lg">
            <div className="bg-surface border border-outline-variant rounded-xl p-lg space-y-md">
              <div className="flex items-center justify-between">
                <h2 className="text-title-md font-title-md text-on-surface">Account Details</h2>
                <button 
                  onClick={() => {
                    if(isEditing) {
                      setFormData(prev => ({ ...prev, username: profile?.username || '', email: profile?.email || '' }));
                    }
                    setIsEditing(!isEditing);
                  }}
                  className="text-primary font-bold text-label-md flex items-center gap-xs hover:underline"
                >
                  <span className="material-symbols-outlined text-[18px]">{isEditing ? 'close' : 'edit'}</span>
                  {isEditing ? 'Cancel' : 'Edit'}
                </button>
              </div>

              <div className="space-y-sm">
                {!isEditing ? (
                  <>
                    <div>
                      <label className="text-label-md font-label-md text-on-surface-variant">Username</label>
                      <p className="text-body-md font-body-md text-on-surface">{profile?.username}</p>
                    </div>
                    <div>
                      <label className="text-label-md font-label-md text-on-surface-variant">Email</label>
                      <p className="text-body-md font-body-md text-on-surface">{profile?.email}</p>
                    </div>
                  </>
                ) : (
                  <div className="space-y-md pt-xs">
                    <div>
                      <label className="text-label-md font-label-md text-on-surface-variant block mb-1">Username</label>
                      <input
                        name="username"
                        type="text"
                        value={formData.username}
                        onChange={handleChange}
                        className="w-full h-10 bg-surface-bright border border-outline-variant rounded px-sm text-body-md outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="text-label-md font-label-md text-on-surface-variant block mb-1">Email</label>
                      <input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full h-10 bg-surface-bright border border-outline-variant rounded px-sm text-body-md outline-none focus:border-primary"
                      />
                    </div>
                    <button
                      onClick={handleUpdateProfile}
                      disabled={saving}
                      className="w-full h-10 bg-primary text-white font-bold rounded-lg text-label-md hover:bg-surface-tint transition-all disabled:opacity-50"
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                )}
              </div>
              <div className="pt-md border-t border-outline-variant">
                <button
                  onClick={handleLogout}
                  className="w-full h-12 flex items-center justify-center gap-sm bg-outline text-on-surface border border-outline-variant font-bold rounded-lg hover:bg-primary/5 transition-all active:scale-95"
                >
                  <span className="material-symbols-outlined">logout</span>
                  Sign Out
                </button>
              </div>
            </div>
          </div>

          {/* Password Updates Area */}
          <div className="lg:col-span-2 space-y-lg">
            {error && (
              <div className="bg-error-container border border-error/20 p-md rounded-lg flex items-start gap-md">
                <span className="material-symbols-outlined text-error">error</span>
                <p className="text-on-error-container">{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-primary-container/20 border border-primary/40 p-md rounded-lg flex items-start gap-md">
                <span className="material-symbols-outlined text-primary">check_circle</span>
                <p className="text-on-surface">{success}</p>
              </div>
            )}

            <div className="bg-surface border border-outline-variant rounded-xl p-lg">
              <h3 className="text-title-md font-title-md text-on-surface mb-lg">Security & Access</h3>
              
              <form onSubmit={handleChangePassword} className="space-y-lg">
                <h4 className="text-label-md font-label-md text-on-surface">Change Password</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
                  <div className="space-y-sm md:col-span-1">
                    <label className="block text-label-md font-label-md text-on-surface-variant" htmlFor="oldPassword">
                      Current Password
                    </label>
                    <input
                      id="oldPassword"
                      name="oldPassword"
                      type="password"
                      value={formData.oldPassword}
                      onChange={handleChange}
                      className="w-full h-12 bg-surface-bright border-b border-outline-variant focus:border-primary focus:ring-0 px-xs text-body-md font-body-md outline-none transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="space-y-sm md:col-span-1">
                    <label className="block text-label-md font-label-md text-on-surface-variant" htmlFor="newPassword">
                      New Password
                    </label>
                    <input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      value={formData.newPassword}
                      onChange={handleChange}
                      className="w-full h-12 bg-surface-bright border-b border-outline-variant focus:border-primary focus:ring-0 px-xs text-body-md font-body-md outline-none transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="space-y-sm md:col-span-1">
                    <label className="block text-label-md font-label-md text-on-surface-variant" htmlFor="confirmPassword">
                      Confirm Password
                    </label>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full h-12 bg-surface-bright border-b border-outline-variant focus:border-primary focus:ring-0 px-xs text-body-md font-body-md outline-none transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
                <div className="pt-lg flex justify-end">
                  <button
                    type="submit"
                    disabled={saving || !formData.newPassword}
                    className="h-12 px-xl border border-outline-variant text-primary font-bold rounded-lg hover:bg-primary/5 transition-all disabled:opacity-50"
                  >
                    {saving ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </form>
            </div>

            {/* Danger Zone */}
            <div className="bg-error-container/20 border border-error/20 rounded-xl p-lg">
              <div className="flex items-start gap-md">
                <span className="material-symbols-outlined text-error">warning</span>
                <div className="space-y-md">
                  <div>
                    <h4 className="text-label-md font-bold text-on-error-container">Danger Zone</h4>
                    <p className="text-body-md font-body-md text-on-surface-variant mt-xs">
                      Once you delete your account, there is no going back. Please be certain.
                    </p>
                  </div>
                  <button
                    onClick={handleDeleteAccount}
                    className="h-12 px-xl bg-error text-on-error font-bold rounded-lg hover:brightness-90 transition-all active:scale-95"
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Profile;
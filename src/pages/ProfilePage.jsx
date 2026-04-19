import { useState } from 'react';
import { FiUser, FiMail, FiEdit2, FiSave, FiShield } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { formatDate } from '../utils/helpers';
import './ProfilePage.css';

const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Name is required');
      return;
    }
    setSaving(true);
    try {
      await updateProfile({ name, bio });
      toast.success('Profile updated!');
      setEditing(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    }
    setSaving(false);
  };

  return (
    <div className="profile-page page-enter">
      <div className="container">
        <div className="profile-card animate-fade-in">
          <div className="profile-banner">
            <div className="profile-banner-pattern" />
          </div>

          <div className="profile-main">
            <div className="profile-avatar-wrapper">
              <div className="profile-avatar-lg">
                {user?.name?.[0]?.toUpperCase()}
              </div>
            </div>

            <div className="profile-info-section">
              {editing ? (
                <div className="profile-edit-form">
                  <div className="form-group">
                    <label className="form-label">Name</label>
                    <input className="form-input" value={name} onChange={e => setName(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Bio</label>
                    <textarea className="form-textarea" value={bio} onChange={e => setBio(e.target.value)} placeholder="Tell us about yourself..." rows={3} />
                  </div>
                  <div className="profile-edit-actions">
                    <button className="btn btn-secondary btn-sm" onClick={() => { setEditing(false); setName(user?.name); setBio(user?.bio || ''); }}>Cancel</button>
                    <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>
                      <FiSave /> {saving ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="profile-name-row">
                    <h1 className="profile-name">{user?.name}</h1>
                    <button className="btn btn-secondary btn-sm" onClick={() => setEditing(true)}>
                      <FiEdit2 /> Edit
                    </button>
                  </div>
                  {user?.bio && <p className="profile-bio">{user.bio}</p>}
                </>
              )}

              <div className="profile-details">
                <div className="profile-detail-item">
                  <FiMail size={16} />
                  <span>{user?.email}</span>
                </div>
                <div className="profile-detail-item">
                  <FiShield size={16} />
                  <span className={`badge badge-${user?.role === 'admin' ? 'warning' : user?.role === 'instructor' ? 'info' : 'primary'}`}>
                    {user?.role}
                  </span>
                </div>
                <div className="profile-detail-item">
                  <FiUser size={16} />
                  <span>Joined {formatDate(user?.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

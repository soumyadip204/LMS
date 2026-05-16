import { useState } from 'react';
import {
  FiUser, FiMail, FiEdit2, FiSave, FiShield, FiLock, FiX,
  FiPlus, FiBriefcase, FiBookOpen, FiAward, FiMapPin, FiCalendar,
  FiCheck, FiAlertCircle, FiTrash2
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { formatDate } from '../utils/helpers';
import './ProfilePage.css';

/* ========== Tag Input ========== */
const TagInput = ({ tags, setTags, placeholder }) => {
  const [input, setInput] = useState('');
  const addTag = (e) => {
    if (e) e.preventDefault();
    const val = input.trim();
    if (val && !tags.includes(val)) {
      setTags([...tags, val]);
    }
    setInput('');
  };
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); addTag(); }
  };
  const removeTag = (idx) => setTags(tags.filter((_, i) => i !== idx));

  return (
    <div className="tag-input-wrapper">
      {tags.length > 0 && (
        <div className="tag-list">
          {tags.map((t, i) => (
            <span key={i} className="tag-chip">
              {t}
              <button type="button" className="tag-remove" onClick={() => removeTag(i)}><FiX size={12} /></button>
            </span>
          ))}
        </div>
      )}
      <div className="tag-input-row">
        <input
          className="form-input tag-field"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
        />
        <button type="button" className="btn btn-secondary btn-sm tag-add-btn" onClick={addTag}>
          <FiPlus size={14} /> Add
        </button>
      </div>
    </div>
  );
};

/* ========== Password Strength ========== */
const PASSWORD_RULES = [
  { label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { label: 'One uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { label: 'One lowercase letter', test: (p) => /[a-z]/.test(p) },
  { label: 'One number', test: (p) => /[0-9]/.test(p) },
  { label: 'One special character', test: (p) => /[!@#$%^&*(),.?":{}|<>_\-+=[\]\\\/~`]/.test(p) },
];

const PasswordStrength = ({ password }) => {
  if (!password) return null;
  const passed = PASSWORD_RULES.filter(r => r.test(password)).length;
  const strength = passed <= 2 ? 'weak' : passed <= 4 ? 'fair' : 'strong';

  return (
    <div className="password-strength">
      <div className="pw-bar">
        <div className={`pw-bar-fill pw-${strength}`} style={{ width: `${(passed / PASSWORD_RULES.length) * 100}%` }} />
      </div>
      <ul className="pw-rules">
        {PASSWORD_RULES.map((r, i) => (
          <li key={i} className={r.test(password) ? 'pw-pass' : 'pw-fail'}>
            {r.test(password) ? <FiCheck size={12} /> : <FiAlertCircle size={12} />}
            {r.label}
          </li>
        ))}
      </ul>
    </div>
  );
};

/* ========== Main Component ========== */
const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Common fields
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Role-specific fields
  const [experience, setExperience] = useState(user?.experience || '');
  const [domainInterests, setDomainInterests] = useState(user?.domainInterests || []);
  const [skills, setSkills] = useState(user?.skills || []);
  const [occupation, setOccupation] = useState(user?.occupation || '');

  // Multiple Educational Qualifications
  const initEdu = () => {
    const existing = user?.educationalQualifications;
    if (existing && existing.length > 0) return existing.map(e => ({ degree: e.degree || '', institute: e.institute || '', year: e.year || '' }));
    // Backwards compat with old single educationalQualification
    const old = user?.educationalQualification;
    if (old && (old.degree || old.institute || old.year)) return [{ degree: old.degree || '', institute: old.institute || '', year: old.year || '' }];
    return [];
  };
  const [educations, setEducations] = useState(initEdu);

  const role = user?.role;

  const addEducation = () => {
    setEducations([...educations, { degree: '', institute: '', year: '' }]);
  };

  const updateEducation = (idx, field, value) => {
    if (field === 'year') {
      // Max 4 digits, numbers only
      const cleaned = value.replace(/\D/g, '').slice(0, 4);
      setEducations(educations.map((e, i) => i === idx ? { ...e, [field]: cleaned } : e));
    } else {
      setEducations(educations.map((e, i) => i === idx ? { ...e, [field]: value } : e));
    }
  };

  const removeEducation = (idx) => {
    setEducations(educations.filter((_, i) => i !== idx));
  };

  const resetForm = () => {
    setName(user?.name || '');
    setBio(user?.bio || '');
    setPassword('');
    setConfirmPassword('');
    setExperience(user?.experience || '');
    setDomainInterests(user?.domainInterests || []);
    setSkills(user?.skills || []);
    setOccupation(user?.occupation || '');
    setEducations(initEdu());
  };

  const isPasswordValid = (pw) => PASSWORD_RULES.every(r => r.test(pw));

  const handleSave = async () => {
    if (!name.trim()) return toast.error('Name is required');

    if (password) {
      if (!isPasswordValid(password)) {
        return toast.error('Password does not meet all requirements');
      }
      if (password !== confirmPassword) {
        return toast.error('Passwords do not match');
      }
    }

    setSaving(true);
    try {
      const data = { name, bio };
      if (password) data.password = password;

      if (role === 'instructor') {
        data.experience = experience;
        data.educationalQualifications = educations.filter(e => e.degree || e.institute || e.year);
        data.skills = skills;
      }

      if (role === 'learner') {
        data.domainInterests = domainInterests;
        data.educationalQualifications = educations.filter(e => e.degree || e.institute || e.year);
        data.skills = skills;
        data.occupation = occupation;
      }

      await updateProfile(data);
      toast.success('Profile updated!');
      setEditing(false);
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    }
    setSaving(false);
  };

  return (
    <div className="profile-page page-enter">
      <div className="container">
        <div className="profile-card animate-fade-in">

          {/* ===== BANNER ===== */}
          <div className="profile-banner">
            <div className="banner-mesh"></div>
            <div className="banner-glow glow-1"></div>
            <div className="banner-glow glow-2"></div>
            <div className="banner-shape shape-ring"></div>
            <div className="banner-shape shape-dot"></div>
            <div className="banner-shape shape-cross"></div>
          </div>

          {/* ===== PROFILE MAIN ===== */}
          <div className="profile-main">
            <div className="profile-header-row">
              <div className="profile-avatar-wrapper">
                <div className="profile-avatar-lg">
                  {user?.name?.[0]?.toUpperCase()}
                </div>
              </div>

              {!editing && (
                <button className="btn btn-secondary btn-sm profile-edit-trigger" onClick={() => setEditing(true)}>
                  <FiEdit2 /> Edit Profile
                </button>
              )}
            </div>

            {/* ===== VIEW MODE ===== */}
            {!editing ? (
              <div className="profile-view">
                <div className="profile-identity">
                  <h1 className="profile-name">{user?.name}</h1>
                  <span className={`badge badge-${role === 'admin' ? 'warning' : role === 'instructor' ? 'info' : 'primary'}`}>
                    {role}
                  </span>
                </div>
                {user?.bio && <p className="profile-bio">{user.bio}</p>}

                {/* Info Grid */}
                <div className="profile-info-grid">
                  <div className="info-card">
                    <FiMail className="info-card-icon" />
                    <span className="info-card-label">Email</span>
                    <span className="info-card-value">{user?.email}</span>
                  </div>
                  <div className="info-card">
                    <FiCalendar className="info-card-icon" />
                    <span className="info-card-label">Joined</span>
                    <span className="info-card-value">{formatDate(user?.createdAt)}</span>
                  </div>

                  {role === 'learner' && occupation && (
                    <div className="info-card">
                      <FiBriefcase className="info-card-icon" />
                      <span className="info-card-label">Occupation</span>
                      <span className="info-card-value">{occupation === 'working_professional' ? 'Working Professional' : 'Student'}</span>
                    </div>
                  )}
                  {role === 'instructor' && experience && (
                    <div className="info-card">
                      <FiBriefcase className="info-card-icon" />
                      <span className="info-card-label">Experience</span>
                      <span className="info-card-value">{experience}</span>
                    </div>
                  )}
                </div>

                {/* Education (multiple) */}
                {(role === 'learner' || role === 'instructor') && educations.length > 0 && (
                  <div className="profile-section-card">
                    <h3 className="section-card-title"><FiBookOpen /> Education</h3>
                    {educations.map((edu, i) => (
                      <div key={i} className="edu-details" style={i > 0 ? { marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' } : {}}>
                        {edu.degree && <p className="edu-degree">{edu.degree}</p>}
                        {edu.institute && <p className="edu-institute"><FiMapPin size={14} /> {edu.institute}</p>}
                        {edu.year && <p className="edu-year"><FiCalendar size={14} /> {edu.year}</p>}
                      </div>
                    ))}
                  </div>
                )}

                {/* Skills */}
                {(role === 'learner' || role === 'instructor') && skills.length > 0 && (
                  <div className="profile-section-card">
                    <h3 className="section-card-title"><FiAward /> Skills</h3>
                    <div className="view-tag-list">
                      {skills.map((s, i) => <span key={i} className="view-tag">{s}</span>)}
                    </div>
                  </div>
                )}

                {/* Domain Interests (learner) */}
                {role === 'learner' && domainInterests.length > 0 && (
                  <div className="profile-section-card">
                    <h3 className="section-card-title"><FiBookOpen /> Domain Interests</h3>
                    <div className="view-tag-list">
                      {domainInterests.map((d, i) => <span key={i} className="view-tag interest">{d}</span>)}
                    </div>
                  </div>
                )}
              </div>
            ) : (

              /* ===== EDIT MODE ===== */
              <div className="profile-edit-form">
                {/* --- Common Fields --- */}
                <div className="edit-section">
                  <h3 className="edit-section-title"><FiUser size={16} /> Personal Information</h3>
                  <div className="form-group">
                    <label className="form-label">Name</label>
                    <input className="form-input" value={name} onChange={e => setName(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Bio</label>
                    <textarea className="form-textarea" value={bio} onChange={e => setBio(e.target.value)} placeholder="Tell us about yourself..." rows={3} />
                  </div>
                </div>

                {/* --- Password with validation --- */}
                <div className="edit-section">
                  <h3 className="edit-section-title"><FiLock size={16} /> Change Password</h3>
                  <p className="edit-section-hint">Leave blank to keep your current password.</p>
                  <div className="form-row-2">
                    <div className="form-group">
                      <label className="form-label">New Password</label>
                      <input className="form-input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Confirm Password</label>
                      <input
                        className={`form-input ${confirmPassword ? (confirmPassword === password ? 'input-success' : 'input-error') : ''}`}
                        type="password"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                      />
                      {confirmPassword && confirmPassword !== password && (
                        <span className="field-error"><FiAlertCircle size={12} /> Passwords do not match</span>
                      )}
                      {confirmPassword && confirmPassword === password && (
                        <span className="field-success"><FiCheck size={12} /> Passwords match</span>
                      )}
                    </div>
                  </div>
                  <PasswordStrength password={password} />
                </div>

                {/* --- Instructor: Experience --- */}
                {role === 'instructor' && (
                  <div className="edit-section">
                    <h3 className="edit-section-title"><FiBriefcase size={16} /> Professional</h3>
                    <div className="form-group">
                      <label className="form-label">Experience</label>
                      <input className="form-input" value={experience} onChange={e => setExperience(e.target.value)} placeholder="e.g. 5 years in Machine Learning" />
                    </div>
                  </div>
                )}

                {/* --- Learner: Occupation + Domain Interests --- */}
                {role === 'learner' && (
                  <div className="edit-section">
                    <h3 className="edit-section-title"><FiBriefcase size={16} /> Professional</h3>
                    <div className="form-group">
                      <label className="form-label">Occupation</label>
                      <select className="form-select" value={occupation} onChange={e => setOccupation(e.target.value)}>
                        <option value="">— Select —</option>
                        <option value="student">Student</option>
                        <option value="working_professional">Working Professional</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Domain Interests</label>
                      <TagInput tags={domainInterests} setTags={setDomainInterests} placeholder="e.g. Web Dev, AI, Design..." />
                    </div>
                  </div>
                )}

                {/* --- Education (multiple, learner + instructor) --- */}
                {role !== 'admin' && (
                  <div className="edit-section">
                    <div className="edit-section-header">
                      <h3 className="edit-section-title"><FiBookOpen size={16} /> Education</h3>
                      <button type="button" className="btn btn-secondary btn-sm" onClick={addEducation}>
                        <FiPlus size={14} /> Add Education
                      </button>
                    </div>

                    {educations.length === 0 && (
                      <p className="edit-section-hint">No education entries yet. Click "Add Education" to add one.</p>
                    )}

                    {educations.map((edu, idx) => (
                      <div key={idx} className="edu-edit-card">
                        <div className="edu-edit-header">
                          <span className="edu-edit-num">#{idx + 1}</span>
                          <button type="button" className="btn btn-sm edu-remove-btn" onClick={() => removeEducation(idx)}>
                            <FiTrash2 size={14} />
                          </button>
                        </div>
                        <div className="form-group">
                          <label className="form-label">Degree / Program</label>
                          <input className="form-input" value={edu.degree} onChange={e => updateEducation(idx, 'degree', e.target.value)} placeholder="e.g. B.Tech Computer Science" />
                        </div>
                        <div className="form-row-2">
                          <div className="form-group">
                            <label className="form-label">Institute</label>
                            <input className="form-input" value={edu.institute} onChange={e => updateEducation(idx, 'institute', e.target.value)} placeholder="e.g. MIT, Stanford" />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Year</label>
                            <input className="form-input" value={edu.year} onChange={e => updateEducation(idx, 'year', e.target.value)} placeholder="e.g. 2024" maxLength={4} inputMode="numeric" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* --- Skills (learner + instructor) --- */}
                {role !== 'admin' && (
                  <div className="edit-section">
                    <h3 className="edit-section-title"><FiAward size={16} /> Skills</h3>
                    <div className="form-group">
                      <TagInput tags={skills} setTags={setSkills} placeholder="e.g. React, Python, Figma..." />
                    </div>
                  </div>
                )}

                {/* --- Actions --- */}
                <div className="profile-edit-actions">
                  <button className="btn btn-secondary" onClick={() => { setEditing(false); resetForm(); }}>Cancel</button>
                  <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                    <FiSave /> {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

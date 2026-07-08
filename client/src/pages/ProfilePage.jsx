/**
 * pages/ProfilePage.jsx — Profile Management
 * 
 * Supports displaying user profile metadata, entering edit mode, 
 * validating inputs, and calling the auth context to update user data.
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';
import ThemeToggle from '../components/ThemeToggle';

const ProfilePage = () => {
  const { user, updateProfile, logout } = useAuth();
  
  // Local state for edit/view mode
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form states initialized with user details
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.profile?.bio || '');
  const [college, setCollege] = useState(user?.profile?.college || '');
  const [branch, setBranch] = useState(user?.profile?.branch || '');
  const [graduationYear, setGraduationYear] = useState(user?.profile?.graduationYear || '');
  const [skills, setSkills] = useState(user?.profile?.skills?.join(', ') || '');
  const [linkedIn, setLinkedIn] = useState(user?.profile?.linkedIn || '');
  const [github, setGithub] = useState(user?.profile?.github || '');

  // Reset form to current user values
  const resetForm = () => {
    setName(user?.name || '');
    setBio(user?.profile?.bio || '');
    setCollege(user?.profile?.college || '');
    setBranch(user?.profile?.branch || '');
    setGraduationYear(user?.profile?.graduationYear || '');
    setSkills(user?.profile?.skills?.join(', ') || '');
    setLinkedIn(user?.profile?.linkedIn || '');
    setGithub(user?.profile?.github || '');
    setError('');
  };

  const handleCancel = () => {
    resetForm();
    setIsEditing(false);
  };

  const validateForm = () => {
    if (!name.trim()) {
      setError('Name is required');
      return false;
    }
    if (name.length < 2) {
      setError('Name must be at least 2 characters');
      return false;
    }
    if (graduationYear) {
      const year = parseInt(graduationYear);
      if (isNaN(year) || year < 2000 || year > 2100) {
        setError('Graduation year must be a valid year between 2000 and 2100');
        return false;
      }
    }
    if (linkedIn && !linkedIn.startsWith('http://') && !linkedIn.startsWith('https://')) {
      setError('LinkedIn URL must start with http:// or https://');
      return false;
    }
    if (github && !github.startsWith('http://') && !github.startsWith('https://')) {
      setError('GitHub URL must start with http:// or https://');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) return;

    setLoading(true);
    try {
      await updateProfile({
        name,
        bio,
        college,
        branch,
        graduationYear: graduationYear ? parseInt(graduationYear) : null,
        skills, // Passed as comma-separated string, server controller will format it to array
        linkedIn,
        github
      });
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      
      // Auto-clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header / Navbar */}
      <header className="glass-panel sticky top-0 z-50 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Link to="/dashboard">
            <Logo />
          </Link>
          <span className="text-xs bg-indigo-950 text-indigo-300 font-semibold px-2 py-0.5 rounded border border-indigo-800">
            Beta
          </span>
        </div>
        <nav className="hidden sm:flex items-center gap-6">
          <Link to="/dashboard" className="text-sm font-semibold text-slate-400 hover:text-white transition-colors">
            Dashboard
          </Link>
          <Link to="/profile" className="text-sm font-semibold text-indigo-400 border-b-2 border-indigo-500 pb-1">
            Profile
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button onClick={logout} className="btn-secondary px-4 py-2 text-xs">
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-4xl mx-auto w-full p-6 md:p-8 space-y-6 animate-fade-in">
        {/* Navigation back and title */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Your Profile</h1>
            <p className="text-slate-400 text-sm mt-1">Manage your educational information and social handles</p>
          </div>
          <Link to="/dashboard" className="btn-secondary px-4 py-2 text-xs flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </Link>
        </div>

        {/* Success Alert */}
        {success && (
          <div className="p-4 rounded-lg bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-sm flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{success}</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-lg bg-red-950/80 border border-red-800 text-red-300 text-sm flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <div className="card bg-slate-900 border-slate-800 shadow-2xl rounded-2xl relative overflow-hidden p-8">
          {/* Glassmorphic glows */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500 rounded-full blur-[100px] opacity-10 pointer-events-none"></div>
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-emerald-500 rounded-full blur-[100px] opacity-10 pointer-events-none"></div>

          <div className="relative">
            {/* Header info card */}
            <div className="flex flex-col md:flex-row items-center gap-6 pb-6 border-b border-slate-800 mb-6">
              <div className="w-20 h-20 bg-gradient-to-tr from-indigo-500 to-emerald-500 rounded-full flex items-center justify-center font-black text-2xl text-white tracking-widest shadow-lg shadow-indigo-500/10">
                {name ? name.substring(0, 2).toUpperCase() : 'US'}
              </div>
              <div className="text-center md:text-left flex-1 space-y-1">
                <h2 className="text-2xl font-bold text-white">{user?.name}</h2>
                <p className="text-slate-400 text-sm flex items-center justify-center md:justify-start gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                  {user?.email}
                </p>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-2">
                  <span className="text-xs font-semibold px-2 py-0.5 bg-slate-800 text-slate-300 rounded-full border border-slate-700">
                    Role: Student
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 bg-amber-950 text-amber-300 rounded-full border border-amber-800 flex items-center gap-1">
                    🔥 Streak: {user?.streak?.currentStreak || 0} days
                  </span>
                </div>
              </div>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="btn-primary px-5 py-2.5 text-sm flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Profile
                </button>
              )}
            </div>

            {isEditing ? (
              /* --- Edit Form State --- */
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name field */}
                  <div className="space-y-2">
                    <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider">
                      Full Name
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Enter full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>

                  {/* College field */}
                  <div className="space-y-2">
                    <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider">
                      College / University
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="e.g. National Institute of Technology"
                      value={college}
                      onChange={(e) => setCollege(e.target.value)}
                      disabled={loading}
                    />
                  </div>

                  {/* Branch field */}
                  <div className="space-y-2">
                    <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider">
                      Branch / Specialization
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="e.g. Computer Science & Engineering"
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      disabled={loading}
                    />
                  </div>

                  {/* Graduation Year field */}
                  <div className="space-y-2">
                    <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider">
                      Graduation Year
                    </label>
                    <input
                      type="number"
                      className="input-field"
                      placeholder="e.g. 2026"
                      value={graduationYear}
                      onChange={(e) => setGraduationYear(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Bio field */}
                <div className="space-y-2">
                  <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider">
                    Bio / Headline
                  </label>
                  <textarea
                    className="input-field min-h-[100px] py-3 resize-y"
                    placeholder="Tell us about yourself, your placements goals, or code interests..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    disabled={loading}
                  />
                </div>

                {/* Skills field */}
                <div className="space-y-2">
                  <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider">
                    Technical Skills (Comma separated)
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. React, Node.js, C++, DSA, Java, SQL"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    disabled={loading}
                  />
                  <p className="text-slate-500 text-xs">Separate skills with commas. They will be formatted as search tags.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* LinkedIn URL field */}
                  <div className="space-y-2">
                    <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider">
                      LinkedIn Profile URL
                    </label>
                    <input
                      type="url"
                      className="input-field"
                      placeholder="https://linkedin.com/in/username"
                      value={linkedIn}
                      onChange={(e) => setLinkedIn(e.target.value)}
                      disabled={loading}
                    />
                  </div>

                  {/* GitHub URL field */}
                  <div className="space-y-2">
                    <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider">
                      GitHub Profile URL
                    </label>
                    <input
                      type="url"
                      className="input-field"
                      placeholder="https://github.com/username"
                      value={github}
                      onChange={(e) => setGithub(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4 pt-4 border-t border-slate-800">
                  <button
                    type="submit"
                    className="btn-primary px-6 py-3 flex items-center justify-center gap-2"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      'Save Profile'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="btn-secondary px-6 py-3"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              /* --- View Form State --- */
              <div className="space-y-8">
                {/* Bio Section */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-400">Bio & About</h3>
                  <p className="text-slate-300 text-sm bg-slate-950/40 border border-slate-800 rounded-xl p-4 min-h-[70px] whitespace-pre-wrap">
                    {user?.profile?.bio || <span className="text-slate-500 italic">No bio provided yet. Add one in edit mode!</span>}
                  </p>
                </div>

                {/* Academic Profile */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-400">Academic Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                      <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold">College</p>
                      <p className="text-white text-sm font-bold mt-1">
                        {user?.profile?.college || <span className="text-slate-500 italic">Not set</span>}
                      </p>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                      <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Branch</p>
                      <p className="text-white text-sm font-bold mt-1">
                        {user?.profile?.branch || <span className="text-slate-500 italic">Not set</span>}
                      </p>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                      <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Graduation Year</p>
                      <p className="text-white text-sm font-bold mt-1">
                        {user?.profile?.graduationYear || <span className="text-slate-500 italic">Not set</span>}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Skills Tag Section */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-400">Core Skills</h3>
                  <div className="flex flex-wrap gap-2 bg-slate-950/40 border border-slate-800 rounded-xl p-4">
                    {user?.profile?.skills && user.profile.skills.length > 0 ? (
                      user.profile.skills.map((skill, idx) => (
                        <span key={idx} className="bg-indigo-950 text-indigo-300 text-xs font-bold px-3 py-1.5 rounded-lg border border-indigo-900/60">
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-500 text-sm italic">No skills listed. Update your profile to add skills!</span>
                    )}
                  </div>
                </div>

                {/* Social Handles */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-400">Social Connections</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* LinkedIn Link */}
                    {user?.profile?.linkedIn ? (
                      <a
                        href={user.profile.linkedIn}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-4 bg-slate-900 border border-slate-800 rounded-xl hover:border-indigo-500/40 transition-colors group"
                      >
                        <div className="w-10 h-10 bg-indigo-950 text-indigo-400 rounded-lg flex items-center justify-center font-bold">
                          in
                        </div>
                        <div className="flex-1">
                          <p className="text-white text-sm font-semibold group-hover:text-indigo-400 transition-colors">LinkedIn Profile</p>
                          <p className="text-slate-500 text-xs truncate max-w-xs">{user.profile.linkedIn}</p>
                        </div>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-500 group-hover:text-indigo-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    ) : (
                      <div className="flex items-center gap-3 p-4 bg-slate-900 border border-slate-800 rounded-xl opacity-60">
                        <div className="w-10 h-10 bg-slate-800 text-slate-400 rounded-lg flex items-center justify-center font-bold">
                          in
                        </div>
                        <div>
                          <p className="text-slate-400 text-sm font-semibold">LinkedIn Profile</p>
                          <p className="text-slate-500 text-xs italic">Not linked</p>
                        </div>
                      </div>
                    )}

                    {/* GitHub Link */}
                    {user?.profile?.github ? (
                      <a
                        href={user.profile.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-4 bg-slate-900 border border-slate-800 rounded-xl hover:border-emerald-500/40 transition-colors group"
                      >
                        <div className="w-10 h-10 bg-emerald-950/60 text-emerald-400 rounded-lg flex items-center justify-center font-bold">
                          git
                        </div>
                        <div className="flex-1">
                          <p className="text-white text-sm font-semibold group-hover:text-emerald-400 transition-colors">GitHub Profile</p>
                          <p className="text-slate-500 text-xs truncate max-w-xs">{user.profile.github}</p>
                        </div>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-500 group-hover:text-emerald-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    ) : (
                      <div className="flex items-center gap-3 p-4 bg-slate-900 border border-slate-800 rounded-xl opacity-60">
                        <div className="w-10 h-10 bg-slate-800 text-slate-400 rounded-lg flex items-center justify-center font-bold">
                          git
                        </div>
                        <div>
                          <p className="text-slate-400 text-sm font-semibold">GitHub Profile</p>
                          <p className="text-slate-500 text-xs italic">Not linked</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;

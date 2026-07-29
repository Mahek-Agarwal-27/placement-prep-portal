import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import ActivityTimeline from '../components/ActivityTimeline';
import { useAuth } from '../context/AuthContext';
import activityService from '../services/activityService';
import userService from '../services/userService';
import { 
  User, 
  Edit3, 
  X, 
  Mail, 
  Phone,
  GraduationCap, 
  Target, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink,
  Flame,
  Award,
  Sparkles
} from 'lucide-react';

const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [activities, setActivities] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(true);

  // Realtime Analytics State (fetched from DB)
  const [analytics, setAnalytics] = useState({
    daysActive: 1,
    problemsSolved: 0,
    resumeScore: null,
    aiSessions: 0,
    placementReadinessScore: 0,
  });

  // Form states
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.profile?.phone || '');
  const [bio, setBio] = useState(user?.profile?.bio || '');
  const [college, setCollege] = useState(user?.profile?.college || '');
  const [branch, setBranch] = useState(user?.profile?.branch || '');
  const [graduationYear, setGraduationYear] = useState(user?.profile?.graduationYear || '');
  const [skills, setSkills] = useState(user?.profile?.skills?.join(', ') || '');
  const [linkedIn, setLinkedIn] = useState(user?.profile?.linkedIn || '');
  const [github, setGithub] = useState(user?.profile?.github || '');
  const [targetRole, setTargetRole] = useState(user?.placementGoal?.targetRole || 'Software Developer');
  const [targetCompanies, setTargetCompanies] = useState(user?.placementGoal?.targetCompanies?.join(', ') || 'Google, Amazon, Microsoft');
  const [prepLevel, setPrepLevel] = useState(user?.placementGoal?.prepLevel || 'Intermediate');

  const fetchRealtimeAnalytics = async () => {
    try {
      const res = await userService.getRealtimeAnalytics();
      if (res.success) {
        setAnalytics(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    }
  };

  const fetchActivities = async () => {
    setLoadingActivities(true);
    try {
      const res = await activityService.getActivities();
      if (res.success) {
        setActivities(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingActivities(false);
    }
  };

  useEffect(() => {
    fetchRealtimeAnalytics();
    fetchActivities();
  }, []);

  const resetForm = () => {
    setName(user?.name || '');
    setPhone(user?.profile?.phone || '');
    setBio(user?.profile?.bio || '');
    setCollege(user?.profile?.college || '');
    setBranch(user?.profile?.branch || '');
    setGraduationYear(user?.profile?.graduationYear || '');
    setSkills(user?.profile?.skills?.join(', ') || '');
    setLinkedIn(user?.profile?.linkedIn || '');
    setGithub(user?.profile?.github || '');
    setTargetRole(user?.placementGoal?.targetRole || 'Software Developer');
    setTargetCompanies(user?.placementGoal?.targetCompanies?.join(', ') || 'Google, Amazon, Microsoft');
    setPrepLevel(user?.placementGoal?.prepLevel || 'Intermediate');
    setError('');
  };

  const handleCancel = () => {
    resetForm();
    setIsEditing(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    setLoading(true);
    try {
      await updateProfile({
        name,
        phone,
        bio,
        college,
        branch,
        graduationYear: graduationYear ? parseInt(graduationYear) : null,
        skills,
        linkedIn,
        github,
        placementGoal: {
          targetRole,
          targetCompanies: targetCompanies.split(',').map(c => c.trim()).filter(Boolean),
          prepLevel,
        }
      });
      setSuccess('Profile & placement goals updated successfully!');
      setIsEditing(false);
      fetchRealtimeAnalytics();
      fetchActivities();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto w-full p-6 md:p-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <User className="w-6 h-6 text-blue-600" /> Student Profile & Placement Goals
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage your academic background, target skills, placement goals, and view activity history.
            </p>
          </div>

          <button onClick={() => setIsEditing(true)} className="btn-primary text-xs">
            <Edit3 className="w-4 h-4" /> Edit Profile & Goals
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Live Personal Analytics Bar (NO HARDCODED VALUES) */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold shrink-0">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Days Active</span>
              <p className="text-lg font-bold text-slate-900">{analytics.daysActive} Days</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Problems Solved</span>
              <p className="text-lg font-bold text-slate-900">{analytics.problemsSolved}</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Resume Score</span>
              <p className="text-lg font-bold text-purple-700">
                {analytics.resumeScore !== null ? `${analytics.resumeScore} / 100` : '--'}
              </p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">AI Sessions</span>
              <p className="text-lg font-bold text-blue-700">{analytics.aiSessions}</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center gap-3 col-span-2 sm:col-span-1">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold shrink-0">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Readiness Score</span>
              <p className="text-lg font-bold text-indigo-600">{analytics.placementReadinessScore}%</p>
            </div>
          </div>
        </div>

        {/* Profile Card & Details */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
          
          {/* Avatar & Top Info */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 border-b border-slate-100 pb-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-full bg-blue-50 border border-blue-200 text-blue-600 font-bold text-xl flex items-center justify-center shadow-sm">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">{user?.name}</h2>
                <div className="flex flex-wrap items-center gap-3 mt-0.5 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400" /> {user?.email}
                  </span>
                  {user?.profile?.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-slate-400" /> {user.profile.phone}
                    </span>
                  )}
                </div>

                {user?.profile?.college && (
                  <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                    <GraduationCap className="w-3.5 h-3.5 text-slate-400" /> {user?.profile?.college} {user?.profile?.branch ? `(${user.profile.branch})` : ''}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {user?.profile?.linkedIn && (
                <a href={user.profile.linkedIn} target="_blank" rel="noreferrer" className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1">
                  LinkedIn <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              )}
              {user?.profile?.github && (
                <a href={user.profile.github} target="_blank" rel="noreferrer" className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1">
                  GitHub <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              )}
            </div>
          </div>

          {/* Skills Badges */}
          <div className="space-y-2 border-b border-slate-100 pb-6">
            <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Technical Skills</h3>
            <div className="flex flex-wrap gap-2">
              {user?.profile?.skills && user.profile.skills.length > 0 ? (
                user.profile.skills.map((skill, idx) => (
                  <span key={idx} className="bg-slate-100 text-slate-700 font-semibold text-xs px-3 py-1 rounded-md border border-slate-200">
                    {skill}
                  </span>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic">No skills listed yet. Click edit to add your skills.</p>
              )}
            </div>
          </div>

          {/* Placement Goals */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Target className="w-4 h-4 text-blue-600" /> Placement Goals & Target Companies
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                <span className="text-slate-400 font-medium">Target Role:</span>
                <p className="font-bold text-slate-900 text-sm mt-0.5">{user?.placementGoal?.targetRole || 'Software Developer'}</p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                <span className="text-slate-400 font-medium">Target Companies:</span>
                <p className="font-bold text-slate-900 text-sm mt-0.5">
                  {user?.placementGoal?.targetCompanies?.join(', ') || 'Google, Amazon, Microsoft'}
                </p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                <span className="text-slate-400 font-medium">Preparation Level:</span>
                <p className="font-bold text-blue-600 text-sm mt-0.5">
                  {user?.placementGoal?.prepLevel || 'Intermediate'}
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Activity History Timeline */}
        <ActivityTimeline activities={activities} loading={loadingActivities} />

        {/* Edit Modal */}
        {isEditing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
            <div className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-900 text-base">Edit Student Profile & Goals</h3>
                <button onClick={handleCancel} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Full Name *</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input-field text-xs" />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Mobile Number</label>
                    <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 9876543210" className="input-field text-xs" />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">College / University</label>
                    <input type="text" value={college} onChange={(e) => setCollege(e.target.value)} className="input-field text-xs" />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Branch / Major</label>
                    <input type="text" value={branch} onChange={(e) => setBranch(e.target.value)} className="input-field text-xs" />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Graduation Year</label>
                    <input type="number" value={graduationYear} onChange={(e) => setGraduationYear(e.target.value)} className="input-field text-xs" />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Target Role</label>
                    <input type="text" value={targetRole} onChange={(e) => setTargetRole(e.target.value)} className="input-field text-xs" />
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-semibold text-slate-700">Skills (Comma Separated)</label>
                    <input type="text" value={skills} onChange={(e) => setSkills(e.target.value)} className="input-field text-xs" placeholder="React, Node.js, C++, DSA" />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">LinkedIn URL</label>
                    <input type="url" value={linkedIn} onChange={(e) => setLinkedIn(e.target.value)} className="input-field text-xs" />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">GitHub URL</label>
                    <input type="url" value={github} onChange={(e) => setGithub(e.target.value)} className="input-field text-xs" />
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-semibold text-slate-700">Target Companies</label>
                    <input type="text" value={targetCompanies} onChange={(e) => setTargetCompanies(e.target.value)} className="input-field text-xs" />
                  </div>
                </div>

                <div className="flex gap-3 pt-3 border-t border-slate-100">
                  <button type="submit" disabled={loading} className="btn-primary flex-1 text-xs">
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button type="button" onClick={handleCancel} className="btn-secondary text-xs">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default ProfilePage;

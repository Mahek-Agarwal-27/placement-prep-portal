import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import ActivityTimeline from '../components/ActivityTimeline';
import { useAuth } from '../context/AuthContext';
import activityService from '../services/activityService';
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
  Camera,
  Image as ImageIcon,
  Trash2,
  ChevronDown,
  Plus
} from 'lucide-react';

const BRANCH_OPTIONS = [
  'Computer Science and Engineering (CSE)',
  'Information Technology (IT)',
  'Electronics and Communication Engineering (ECE)',
  'Electrical Engineering (EE)',
  'Electrical and Electronics Engineering (EEE)',
  'Mechanical Engineering (ME)',
  'Civil Engineering',
  'Chemical Engineering',
  'Artificial Intelligence & Machine Learning (AI & ML)',
  'Data Science',
  'Cyber Security',
  'Biotechnology',
  'Other'
];

const POPULAR_COMPANIES = [
  'Google',
  'Microsoft',
  'Amazon',
  'Adobe',
  'Apple',
  'Meta',
  'Netflix',
  'NVIDIA',
  'Salesforce',
  'Oracle',
  'IBM',
  'Deloitte',
  'Accenture',
  'TCS',
  'Infosys',
  'Wipro',
  'Cognizant',
  'Capgemini',
  'JPMorgan Chase',
  'Goldman Sachs',
  'Morgan Stanley',
  'PayPal',
  'Flipkart',
  'Uber',
  'Samsung',
  'Other'
];

const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [activities, setActivities] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(true);

  // Helper to parse user target companies into an array
  const parseTargetCompanies = (rawCompanies) => {
    if (Array.isArray(rawCompanies)) return rawCompanies;
    if (typeof rawCompanies === 'string') {
      return rawCompanies.split(',').map(c => c.trim()).filter(Boolean);
    }
    return ['Google', 'Amazon', 'Microsoft'];
  };

  // Form states
  const [name, setName] = useState(user?.name || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [phone, setPhone] = useState(user?.profile?.phone || '');
  const [bio, setBio] = useState(user?.profile?.bio || '');
  const [college, setCollege] = useState(user?.profile?.college || '');
  const [branch, setBranch] = useState(user?.profile?.branch || '');
  const [customBranch, setCustomBranch] = useState('');
  const [graduationYear, setGraduationYear] = useState(user?.profile?.graduationYear || '');
  const [skills, setSkills] = useState(user?.profile?.skills?.join(', ') || '');
  const [linkedIn, setLinkedIn] = useState(user?.profile?.linkedIn || '');
  const [github, setGithub] = useState(user?.profile?.github || '');
  const [targetRole, setTargetRole] = useState(user?.placementGoal?.targetRole || 'Software Developer');
  const [targetCompanies, setTargetCompanies] = useState(parseTargetCompanies(user?.placementGoal?.targetCompanies));
  const [customCompanyInput, setCustomCompanyInput] = useState('');
  const [prepLevel, setPrepLevel] = useState(user?.placementGoal?.prepLevel || 'Intermediate');

  // Dropdown UI states
  const [branchDropdownOpen, setBranchDropdownOpen] = useState(false);
  const [branchSearch, setBranchSearch] = useState('');
  const [companyDropdownOpen, setCompanyDropdownOpen] = useState(false);
  const [companySearch, setCompanySearch] = useState('');

  const branchRef = useRef(null);
  const companyRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (branchRef.current && !branchRef.current.contains(e.target)) {
        setBranchDropdownOpen(false);
      }
      if (companyRef.current && !companyRef.current.contains(e.target)) {
        setCompanyDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    fetchActivities();
  }, []);

  const resetForm = () => {
    setName(user?.name || '');
    setAvatar(user?.avatar || '');
    setPhone(user?.profile?.phone || '');
    setBio(user?.profile?.bio || '');
    setCollege(user?.profile?.college || '');
    const savedBranch = user?.profile?.branch || '';
    if (savedBranch && !BRANCH_OPTIONS.includes(savedBranch)) {
      setBranch('Other');
      setCustomBranch(savedBranch);
    } else {
      setBranch(savedBranch);
      setCustomBranch('');
    }
    setGraduationYear(user?.profile?.graduationYear || '');
    setSkills(user?.profile?.skills?.join(', ') || '');
    setLinkedIn(user?.profile?.linkedIn || '');
    setGithub(user?.profile?.github || '');
    setTargetRole(user?.placementGoal?.targetRole || 'Software Developer');
    setTargetCompanies(parseTargetCompanies(user?.placementGoal?.targetCompanies));
    setCustomCompanyInput('');
    setPrepLevel(user?.placementGoal?.prepLevel || 'Intermediate');
    setError('');
    setSuccess('');
  };

  const handleCancel = () => {
    resetForm();
    setIsEditing(false);
  };

  // Convert uploaded image file to base64 data URL
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('Image size should be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleCompanySelection = (comp) => {
    if (comp === 'Other') return;
    if (targetCompanies.includes(comp)) {
      setTargetCompanies(targetCompanies.filter(c => c !== comp));
    } else {
      setTargetCompanies([...targetCompanies, comp]);
    }
  };

  const addCustomCompany = () => {
    const trimmed = customCompanyInput.trim();
    if (trimmed && !targetCompanies.includes(trimmed)) {
      setTargetCompanies([...targetCompanies, trimmed]);
      setCustomCompanyInput('');
    }
  };

  const removeCompany = (comp) => {
    setTargetCompanies(targetCompanies.filter(c => c !== comp));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    const finalBranch = branch === 'Other' ? customBranch.trim() : branch;

    setLoading(true);
    try {
      await updateProfile({
        name,
        avatar,
        phone,
        bio,
        college,
        branch: finalBranch,
        graduationYear: graduationYear ? parseInt(graduationYear) : null,
        skills,
        linkedIn,
        github,
        placementGoal: {
          targetRole,
          targetCompanies: targetCompanies.map(c => c.trim()).filter(Boolean),
          prepLevel,
        }
      });
      setSuccess('Profile photo & details updated successfully!');
      setIsEditing(false);
      fetchActivities();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const filteredBranches = BRANCH_OPTIONS.filter(b => 
    b.toLowerCase().includes(branchSearch.toLowerCase())
  );

  const filteredCompanies = POPULAR_COMPANIES.filter(c =>
    c.toLowerCase().includes(companySearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#EFE9FE] flex text-[#1A1A2E] font-sans antialiased">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Navbar />

        <main className="flex-1 max-w-[1500px] mx-auto w-full p-4 sm:p-6 lg:p-8 pb-24 sm:pb-12 lg:pb-8 space-y-6 sm:space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-purple-200/60 pb-5 sm:pb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[#1A1A2E] tracking-tight flex items-center gap-2">
              <User className="w-6 h-6 text-[#6C47FF]" /> Student Profile & Photo 👤
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 font-medium mt-1">
              Upload your profile picture, manage academic details, and view placement readiness.
            </p>
          </div>

          <button 
            onClick={() => setIsEditing(true)} 
            className="px-4 sm:px-5 py-2.5 rounded-2xl bg-[#6C47FF] text-white font-bold text-xs hover:bg-[#5A36EC] transition-all shadow-md flex items-center gap-2 cursor-pointer"
          >
            <Edit3 className="w-4 h-4" /> Edit Profile & Photo
          </button>
        </div>

        {/* Clean Header Notification */}
        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Profile Card & Details */}
        <div className="bg-white border border-purple-100 rounded-3xl p-6 shadow-sm space-y-6">
          
          {/* Avatar & Top Info */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 border-b border-purple-100 pb-6">
            <div className="flex items-center gap-5 min-w-0">
              <div className="relative group shrink-0">
                {user?.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt={user.name} 
                    className="w-20 h-20 rounded-full object-cover border-2 border-[#6C47FF] shadow-md shrink-0 aspect-square"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-[#8B5CF6] text-white font-black text-2xl flex items-center justify-center shadow-md shrink-0 aspect-square">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
                
                <div className="absolute bottom-0 right-0 flex items-center gap-1">
                  {user?.avatar && (
                    <button
                      onClick={async () => {
                        if (window.confirm('Delete your profile picture?')) {
                          await updateProfile({ avatar: '' });
                          setSuccess('Profile picture removed.');
                          setTimeout(() => setSuccess(''), 3000);
                        }
                      }}
                      className="p-1.5 bg-rose-600 text-white rounded-full shadow-md hover:bg-rose-700 transition-all"
                      title="Remove Photo"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-1.5 bg-[#6C47FF] text-white rounded-full shadow-md hover:bg-[#5A36EC] transition-all"
                    title="Update Photo"
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-black text-[#1A1A2E]">{user?.name}</h2>
                <div className="flex flex-wrap items-center gap-3 mt-1 text-xs font-medium text-gray-500">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-[#6C47FF]" /> {user?.email}
                  </span>
                  {user?.profile?.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-[#6C47FF]" /> {user.profile.phone}
                    </span>
                  )}
                </div>

                {user?.profile?.college && (
                  <p className="text-xs font-semibold text-gray-600 flex items-center gap-1.5 mt-1">
                    <GraduationCap className="w-4 h-4 text-[#6C47FF]" /> {user?.profile?.college} {user?.profile?.branch ? `(${user.profile.branch})` : ''}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {user?.profile?.linkedIn && (
                <a href={user.profile.linkedIn} target="_blank" rel="noreferrer" className="px-3.5 py-1.5 rounded-xl border border-purple-200 text-xs font-bold text-[#6C47FF] hover:bg-purple-50 transition-all flex items-center gap-1">
                  LinkedIn <ExternalLink className="w-3 h-3 text-[#6C47FF]" />
                </a>
              )}
              {user?.profile?.github && (
                <a href={user.profile.github} target="_blank" rel="noreferrer" className="px-3.5 py-1.5 rounded-xl border border-purple-200 text-xs font-bold text-[#1A1A2E] hover:bg-purple-50 transition-all flex items-center gap-1">
                  GitHub <ExternalLink className="w-3 h-3 text-gray-500" />
                </a>
              )}
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-100 space-y-1">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">Target Role</span>
              <p className="font-extrabold text-[#1A1A2E] text-sm">{user?.placementGoal?.targetRole || 'Software Developer'}</p>
            </div>

            <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-100 space-y-1">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">Target Companies</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {(user?.placementGoal?.targetCompanies && user.placementGoal.targetCompanies.length > 0) ? (
                  user.placementGoal.targetCompanies.map((c, i) => (
                    <span key={i} className="px-2.5 py-0.5 rounded-lg bg-purple-100/80 text-[#6C47FF] font-bold text-xs border border-purple-200">
                      {c}
                    </span>
                  ))
                ) : (
                  <span className="font-bold text-[#6C47FF] text-xs">Google, Amazon, Microsoft</span>
                )}
              </div>
            </div>

            <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-100 space-y-1">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">Preparation Level</span>
              <p className="font-extrabold text-emerald-600 text-sm">
                {user?.placementGoal?.prepLevel || 'Intermediate'}
              </p>
            </div>
          </div>

        </div>

        {/* Activity History Timeline */}
        <ActivityTimeline activities={activities} loading={loadingActivities} />

        {/* Edit Modal */}
        {isEditing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
            <div className="bg-white border border-purple-100 rounded-3xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-5">
              <div className="flex justify-between items-center border-b border-purple-100 pb-3">
                <h3 className="font-black text-[#1A1A2E] text-base flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-[#6C47FF]" /> Edit Student Profile & Photo
                </h3>
                <button onClick={handleCancel} className="text-gray-400 hover:text-gray-600 font-bold">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Photo Upload Section */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-purple-50/60 rounded-2xl border border-purple-100">
                  <div className="shrink-0 flex items-center">
                    {avatar ? (
                      <img src={avatar} alt="Preview" className="w-16 h-16 rounded-full object-cover border-2 border-[#6C47FF] shrink-0 aspect-square" />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-[#8B5CF6] text-white font-bold flex items-center justify-center text-xl shrink-0 aspect-square">
                        {name ? name.charAt(0).toUpperCase() : 'U'}
                      </div>
                    )}
                  </div>
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <label className="block text-xs font-bold text-[#1A1A2E]">Profile Picture</label>
                    <div className="flex flex-wrap items-center gap-2">
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageUpload}
                        className="text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#6C47FF] file:text-white hover:file:bg-[#5A36EC] cursor-pointer max-w-full"
                      />
                      {avatar && (
                        <button
                          type="button"
                          onClick={() => setAvatar('')}
                          className="px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold hover:bg-rose-100 transition-all flex items-center gap-1 shrink-0"
                          title="Remove Photo"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Remove
                        </button>
                      )}
                    </div>
                    <p className="text-[10px] text-gray-400 font-medium">PNG, JPG or WebP under 2MB</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Full Name *</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2.5 rounded-2xl border border-purple-200 text-xs font-semibold outline-none focus:border-[#6C47FF]" />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Mobile Number</label>
                    <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 9876543210" className="w-full px-4 py-2.5 rounded-2xl border border-purple-200 text-xs font-semibold outline-none focus:border-[#6C47FF]" />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">College / University</label>
                    <input type="text" value={college} onChange={(e) => setCollege(e.target.value)} className="w-full px-4 py-2.5 rounded-2xl border border-purple-200 text-xs font-semibold outline-none focus:border-[#6C47FF]" />
                  </div>

                  {/* 1. Searchable Branch Dropdown */}
                  <div className="space-y-1" ref={branchRef}>
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Branch / Major</label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setBranchDropdownOpen(!branchDropdownOpen)}
                        className="w-full px-4 py-2.5 rounded-2xl border border-purple-200 text-xs font-semibold bg-white text-left flex justify-between items-center outline-none focus:border-[#6C47FF]"
                      >
                        <span className={branch ? 'text-[#1A1A2E]' : 'text-gray-400'}>
                          {branch || 'Select Branch / Major...'}
                        </span>
                        <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                      </button>

                      {branchDropdownOpen && (
                        <div className="absolute z-50 mt-1 w-full bg-white border border-purple-100 rounded-2xl shadow-xl max-h-56 overflow-hidden flex flex-col">
                          <div className="p-2 border-b border-purple-50 bg-purple-50/50">
                            <input
                              type="text"
                              value={branchSearch}
                              onChange={(e) => setBranchSearch(e.target.value)}
                              placeholder="Search branch..."
                              className="w-full px-3 py-1.5 text-xs border border-purple-200 rounded-xl outline-none focus:border-[#6C47FF]"
                              autoFocus
                            />
                          </div>
                          <div className="overflow-y-auto max-h-44 divide-y divide-purple-50">
                            {filteredBranches.length > 0 ? (
                              filteredBranches.map((b) => (
                                <button
                                  key={b}
                                  type="button"
                                  onClick={() => {
                                    setBranch(b);
                                    setBranchDropdownOpen(false);
                                    setBranchSearch('');
                                  }}
                                  className={`w-full text-left px-3 py-2 text-xs hover:bg-purple-50 transition-colors flex items-center justify-between ${
                                    branch === b ? 'bg-purple-50 text-[#6C47FF] font-bold' : 'text-gray-700'
                                  }`}
                                >
                                  <span>{b}</span>
                                  {branch === b && <CheckCircle2 className="w-3.5 h-3.5 text-[#6C47FF] shrink-0" />}
                                </button>
                              ))
                            ) : (
                              <div className="px-3 py-2 text-xs text-gray-400 text-center">No branches found</div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {branch === 'Other' && (
                      <div className="pt-2">
                        <input
                          type="text"
                          value={customBranch}
                          onChange={(e) => setCustomBranch(e.target.value)}
                          placeholder="Enter custom branch name..."
                          className="w-full px-4 py-2 rounded-2xl border border-purple-200 text-xs font-semibold outline-none focus:border-[#6C47FF]"
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Graduation Year</label>
                    <input type="number" value={graduationYear} onChange={(e) => setGraduationYear(e.target.value)} className="w-full px-4 py-2.5 rounded-2xl border border-purple-200 text-xs font-semibold outline-none focus:border-[#6C47FF]" />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Target Role</label>
                    <input type="text" value={targetRole} onChange={(e) => setTargetRole(e.target.value)} className="w-full px-4 py-2.5 rounded-2xl border border-purple-200 text-xs font-semibold outline-none focus:border-[#6C47FF]" />
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Skills (Comma Separated)</label>
                    <input type="text" value={skills} onChange={(e) => setSkills(e.target.value)} className="w-full px-4 py-2.5 rounded-2xl border border-purple-200 text-xs font-semibold outline-none focus:border-[#6C47FF]" placeholder="React, Node.js, C++, DSA" />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">LinkedIn URL</label>
                    <input type="url" value={linkedIn} onChange={(e) => setLinkedIn(e.target.value)} className="w-full px-4 py-2.5 rounded-2xl border border-purple-200 text-xs font-semibold outline-none focus:border-[#6C47FF]" />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">GitHub URL</label>
                    <input type="url" value={github} onChange={(e) => setGithub(e.target.value)} className="w-full px-4 py-2.5 rounded-2xl border border-purple-200 text-xs font-semibold outline-none focus:border-[#6C47FF]" />
                  </div>

                  {/* 2. Multi-select Target Companies Dropdown with Chips */}
                  <div className="space-y-2 md:col-span-2" ref={companyRef}>
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Target Companies</label>
                    
                    {/* Selected Chips */}
                    <div className="flex flex-wrap gap-1.5 p-2 rounded-2xl border border-purple-200 min-h-[42px] bg-white items-center">
                      {targetCompanies.map((comp) => (
                        <span key={comp} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-100 text-[#6C47FF] font-bold text-xs border border-purple-200">
                          {comp}
                          <button
                            type="button"
                            onClick={() => removeCompany(comp)}
                            className="hover:text-rose-600 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </span>
                      ))}

                      <div className="relative flex-1 min-w-[140px]">
                        <button
                          type="button"
                          onClick={() => setCompanyDropdownOpen(!companyDropdownOpen)}
                          className="w-full text-left text-xs font-medium text-gray-500 px-2 py-1 flex justify-between items-center"
                        >
                          <span>Select companies...</span>
                          <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                        </button>

                        {companyDropdownOpen && (
                          <div className="absolute left-0 z-50 mt-1 w-full bg-white border border-purple-100 rounded-2xl shadow-xl max-h-60 overflow-hidden flex flex-col">
                            <div className="p-2 border-b border-purple-50 bg-purple-50/50">
                              <input
                                type="text"
                                value={companySearch}
                                onChange={(e) => setCompanySearch(e.target.value)}
                                placeholder="Search companies..."
                                className="w-full px-3 py-1.5 text-xs border border-purple-200 rounded-xl outline-none focus:border-[#6C47FF]"
                                autoFocus
                              />
                            </div>

                            <div className="overflow-y-auto max-h-48 divide-y divide-purple-50">
                              {filteredCompanies.length > 0 ? (
                                filteredCompanies.map((c) => {
                                  const isSelected = targetCompanies.includes(c);
                                  return (
                                    <button
                                      key={c}
                                      type="button"
                                      onClick={() => toggleCompanySelection(c)}
                                      className={`w-full text-left px-3 py-2 text-xs hover:bg-purple-50 transition-colors flex items-center justify-between ${
                                        isSelected ? 'bg-purple-50 text-[#6C47FF] font-bold' : 'text-gray-700'
                                      }`}
                                    >
                                      <span>{c}</span>
                                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#6C47FF] shrink-0" />}
                                    </button>
                                  );
                                })
                              ) : (
                                <div className="px-3 py-2 text-xs text-gray-400 text-center">No companies found</div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Custom Company Add Input */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={customCompanyInput}
                        onChange={(e) => setCustomCompanyInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addCustomCompany();
                          }
                        }}
                        placeholder="Add other target company..."
                        className="flex-1 px-4 py-2 rounded-2xl border border-purple-200 text-xs font-semibold outline-none focus:border-[#6C47FF]"
                      />
                      <button
                        type="button"
                        onClick={addCustomCompany}
                        className="px-4 py-2 rounded-2xl bg-purple-100 text-[#6C47FF] font-bold text-xs hover:bg-purple-200 transition-all flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-3 border-t border-purple-100">
                  <button type="submit" disabled={loading} className="flex-1 py-3 rounded-2xl bg-[#6C47FF] text-white font-bold text-xs hover:bg-[#5A36EC] transition-all shadow-md">
                    {loading ? 'Saving Changes...' : 'Save Profile & Photo'}
                  </button>
                  <button type="button" onClick={handleCancel} className="px-5 py-3 rounded-2xl border border-purple-200 text-xs font-bold text-gray-700 hover:bg-purple-50 transition-all">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </main>
      </div>
    </div>
  );
};

export default ProfilePage;


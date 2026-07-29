import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import userService from '../services/userService';
import { AlertTriangle, Trash2, X, Loader2 } from 'lucide-react';

const DangerZone = () => {
  const { logout } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [confirmInput, setConfirmInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDeleteAccount = async () => {
    if (confirmInput.trim() !== 'DELETE') {
      setError('Please type "DELETE" exactly to confirm account removal.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await userService.deleteAccount();
      if (res.success) {
        logout();
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to delete account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-rose-50/50 border border-rose-200 rounded-xl p-6 shadow-sm space-y-4">
      <div className="flex items-center gap-2 border-b border-rose-100 pb-3">
        <AlertTriangle className="w-5 h-5 text-rose-600" />
        <h3 className="font-bold text-rose-900 text-base">Danger Zone ⚠️</h3>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="font-semibold text-slate-900 text-sm">Delete Account</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-xl leading-relaxed">
            Deleting your account will permanently remove your profile data, DSA progress, resume history, AI roadmaps, notes, and activity records. This action cannot be undone.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs px-4 py-2.5 rounded-lg shadow-sm shrink-0 transition-colors"
        >
          Delete Account
        </button>
      </div>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-rose-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" /> Are you sure?
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              This will permanently delete your account and wipe all history records. To confirm, type <strong className="text-slate-900 font-bold">DELETE</strong> in the box below:
            </p>

            {error && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {error}
              </div>
            )}

            <input
              type="text"
              value={confirmInput}
              onChange={(e) => setConfirmInput(e.target.value)}
              placeholder="Type DELETE to confirm"
              className="input-field text-xs uppercase"
            />

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleDeleteAccount}
                disabled={loading || confirmInput.trim() !== 'DELETE'}
                className="bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2.5 rounded-lg flex-1 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Permanently Delete Account
              </button>

              <button
                onClick={() => setShowModal(false)}
                className="btn-secondary text-xs"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DangerZone;

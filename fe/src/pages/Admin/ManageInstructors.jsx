import { useState, useEffect } from 'react';
import { instructorAPI } from '../../services/api';
import toast from 'react-hot-toast';

const STATUS_MAP = {
  pending: { label: 'Chờ duyệt', color: 'bg-amber-500/15 border-amber-500/30 text-amber-300' },
  approved: { label: 'Đã duyệt', color: 'bg-green-500/15 border-green-500/30 text-green-300' },
  rejected: { label: 'Từ chối', color: 'bg-red-500/15 border-red-500/30 text-red-300' },
};

export default function ManageInstructors() {
  const [applications, setApplications] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [selected, setSelected] = useState(null);
  const [rejNote, setRejNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchApplications = () => {
    setLoading(true);
    const params = {};
    if (statusFilter) params.status = statusFilter;
    instructorAPI.getAllApplications(params).then(res => {
      setApplications(res.data.data || res.data.applications || []);
      setTotal(res.data.total || 0);
    }).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchApplications(); }, [statusFilter]);

  const handleApprove = async (id) => {
    setActionLoading(true);
    try {
      await instructorAPI.approve(id);
      toast.success('✅ Đã phê duyệt giảng viên thành công!');
      fetchApplications();
      setSelected(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi phê duyệt');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (id) => {
    setActionLoading(true);
    try {
      await instructorAPI.reject(id, rejNote);
      toast.success('Đã từ chối hồ sơ giảng viên');
      fetchApplications();
      setSelected(null);
      setRejNote('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi từ chối');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="animate-fade-in max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Phê duyệt Giảng viên</h1>
          <p className="text-slate-400 mt-1">{total} hồ sơ · Xét duyệt các ứng viên giảng viên</p>
        </div>
      </div>

      {/* STATUS FILTER TABS */}
      <div className="flex gap-2 mb-6 bg-slate-900 border border-slate-800 p-1.5 rounded-2xl w-fit">
        {[
          { val: 'pending', label: 'Chờ duyệt', icon: '⏳' },
          { val: 'approved', label: 'Đã duyệt', icon: '✅' },
          { val: 'rejected', label: 'Từ chối', icon: '❌' },
          { val: '', label: 'Tất cả', icon: '📋' },
        ].map(tab => (
          <button
            key={tab.val}
            onClick={() => setStatusFilter(tab.val)}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl transition-all ${statusFilter === tab.val ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 animate-pulse">
              <div className="flex gap-3 mb-4"><div className="w-12 h-12 bg-slate-800 rounded-full" /><div className="flex-1"><div className="h-4 bg-slate-800 rounded w-1/2 mb-2" /><div className="h-3 bg-slate-800 rounded w-1/3" /></div></div>
              <div className="space-y-2"><div className="h-3 bg-slate-800 rounded" /><div className="h-3 bg-slate-800 rounded w-3/4" /></div>
            </div>
          ))}
        </div>
      ) : applications.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/50 border border-slate-800 border-dashed rounded-2xl">
          <div className="text-4xl mb-3">📭</div>
          <p className="text-slate-400">Không có hồ sơ nào trong mục này</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {applications.map(app => {
            const user = app.user;
            const statusInfo = STATUS_MAP[app.status] || STATUS_MAP.pending;
            return (
              <div
                key={app._id}
                className={`bg-slate-900 border rounded-2xl p-5 cursor-pointer transition-all hover:-translate-y-0.5 ${selected?._id === app._id ? 'border-blue-500' : 'border-slate-800 hover:border-slate-700'}`}
                onClick={() => setSelected(app)}
              >
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
                    {user?.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-bold text-white text-sm">{user?.name}</h3>
                      <span className={`flex-shrink-0 text-xs font-semibold px-2 py-0.5 rounded-lg border ${statusInfo.color}`}>{statusInfo.label}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{user?.email}</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-xs font-semibold text-slate-500 uppercase">Chuyên môn:</span>
                    <p className="text-slate-300 text-xs mt-0.5">{app.expertise || '—'}</p>
                  </div>
                  {app.biography && (
                    <div>
                      <span className="text-xs font-semibold text-slate-500 uppercase">Giới thiệu:</span>
                      <p className="text-slate-300 text-xs mt-0.5 line-clamp-2">{app.biography}</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-800">
                  <span className="text-xs text-slate-500">{new Date(app.createdAt).toLocaleDateString('vi-VN')}</span>
                  {app.cvUrl && (
                    <a href={app.cvUrl} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      Xem CV
                    </a>
                  )}
                </div>

                {app.status === 'pending' && (
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={e => { e.stopPropagation(); handleApprove(app._id); }}
                      disabled={actionLoading}
                      className="flex-1 py-2 bg-green-600 hover:bg-green-500 text-white text-xs font-bold rounded-xl transition-all"
                    >
                      ✅ Phê duyệt
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); setSelected(app); }}
                      disabled={actionLoading}
                      className="flex-1 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-bold rounded-xl transition-all"
                    >
                      ❌ Từ chối
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* REJECT MODAL */}
      {selected && selected.status === 'pending' && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-white mb-1">Từ chối hồ sơ</h3>
            <p className="text-slate-400 text-sm mb-5">Giảng viên: <span className="font-semibold text-white">{selected.user?.name}</span></p>

            <label className="block text-sm font-medium text-slate-300 mb-2">Lý do từ chối <span className="text-slate-500">(tùy chọn)</span></label>
            <textarea
              rows={3}
              value={rejNote}
              onChange={e => setRejNote(e.target.value)}
              placeholder="Nhập lý do từ chối để giảng viên biết cải thiện..."
              className="w-full bg-slate-800 border border-slate-700 focus:border-red-500 text-slate-100 placeholder-slate-500 rounded-xl px-4 py-3 text-sm outline-none transition-all resize-none mb-5"
            />

            <div className="flex gap-3">
              <button onClick={() => setSelected(null)} className="flex-1 py-2.5 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl font-semibold text-sm transition-all">Huỷ</button>
              <button onClick={() => handleReject(selected._id)} disabled={actionLoading} className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold text-sm transition-all disabled:opacity-60">
                {actionLoading ? 'Đang xử lý...' : 'Xác nhận từ chối'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

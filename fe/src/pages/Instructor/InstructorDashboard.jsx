import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { courseAPI } from '../../services/api';
import toast from 'react-hot-toast';

// ── Status helpers ──────────────────────────────────────────────────────────────
const REVIEW_STATUS_CONFIG = {
  approved: { label: 'Đã duyệt',    dot: 'bg-blue-500',    badge: 'bg-blue-500/10   text-blue-400   border-blue-500/20'   },
  pending:  { label: 'Chờ duyệt',   dot: 'bg-amber-500',   badge: 'bg-amber-500/10  text-amber-400  border-amber-500/20'  },
  rejected: { label: 'Bị từ chối',  dot: 'bg-red-500',     badge: 'bg-red-500/10    text-red-400    border-red-500/20'    },
};

const PUBLISH_STATUS_CONFIG = {
  published: { label: 'Đã xuất bản', dot: 'bg-emerald-500', badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  draft:     { label: 'Bản nháp',    dot: 'bg-slate-500',   badge: 'bg-slate-700     text-slate-400  border-slate-600'     },
};

function StatusBadge({ course }) {
  // Ưu tiên hiển thị reviewStatus nếu đã published
  if (course.status === 'published' && course.reviewStatus) {
    const cfg = REVIEW_STATUS_CONFIG[course.reviewStatus] || REVIEW_STATUS_CONFIG.pending;
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border whitespace-nowrap ${cfg.badge}`}>
        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
        {cfg.label}
      </span>
    );
  }
  const cfg = PUBLISH_STATUS_CONFIG[course.status] || PUBLISH_STATUS_CONFIG.draft;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border whitespace-nowrap ${cfg.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

export default function InstructorDashboard() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchCourses = () => {
    setLoading(true);
    courseAPI.getMyCourses()
      .then(res => setCourses(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCourses(); }, []);

  // Gửi duyệt (draft → published+pending)
  const handleSubmit = async (id) => {
    if (!window.confirm('Gửi khoá học này để Admin duyệt?')) return;
    try {
      await courseAPI.publish(id);
      toast.success('Đã gửi duyệt thành công!');
      fetchCourses();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Lỗi khi gửi duyệt');
    }
  };

  // Gửi duyệt lại (rejected → pending)
  const handleResubmit = async (id) => {
    if (!window.confirm('Gửi lại khoá học này để Admin duyệt?')) return;
    try {
      await courseAPI.publish(id);
      toast.success('Đã gửi duyệt lại thành công!');
      fetchCourses();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Lỗi khi gửi duyệt lại');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xoá bản nháp này?')) return;
    try {
      await courseAPI.delete(id);
      toast.success('Xoá thành công');
      fetchCourses();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Lỗi khi xoá');
    }
  };

  // ── Stats ────────────────────────────────────────────────────────────────────
  const total     = courses.length;
  const published = courses.filter(c => c.status === 'published' && c.reviewStatus === 'approved').length;
  const pending   = courses.filter(c => c.status === 'published' && c.reviewStatus === 'pending').length;
  const drafts    = courses.filter(c => c.status === 'draft').length;

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="animate-fade-in max-w-6xl mx-auto space-y-6">

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white">Quản lý Khoá học</h1>
          <p className="text-slate-400 text-sm mt-1">Tạo, chỉnh sửa và theo dõi trạng thái khoá học của bạn</p>
        </div>
        <Link
          to="/instructor/create-course"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 font-bold rounded-xl text-white text-sm transition-all shadow-lg shadow-blue-500/25"
        >
          <span className="text-lg leading-none">+</span> Tạo khoá học mới
        </Link>
      </div>

      {/* ── Stats bar ─────────────────────────────────────────────────────── */}
      {!loading && courses.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Tổng khoá học', value: total,     icon: '📚', accent: 'border-blue-500    text-blue-400'    },
            { label: 'Đã được duyệt', value: published, icon: '✅', accent: 'border-emerald-500 text-emerald-400' },
            { label: 'Chờ duyệt',     value: pending,   icon: '⏳', accent: 'border-amber-500   text-amber-400'   },
            { label: 'Bản nháp',      value: drafts,    icon: '📝', accent: 'border-slate-500   text-slate-400'   },
          ].map(s => (
            <div key={s.label} className={`bg-slate-900 border border-slate-800 border-l-2 ${s.accent.split(' ')[0]} rounded-2xl px-5 py-4 flex items-center gap-4`}>
              <span className="text-2xl leading-none select-none">{s.icon}</span>
              <div>
                <p className="text-2xl font-bold leading-none text-white">{s.value}</p>
                <p className="text-slate-400 text-xs font-medium mt-1.5">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Body ──────────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="flex justify-center my-20">
          <div className="w-8 h-8 rounded-full border-2 border-slate-700 border-t-blue-500 animate-spin" />
        </div>

      ) : courses.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/50 border border-slate-800 border-dashed rounded-2xl flex flex-col items-center">
          <div className="text-4xl mb-4 text-slate-600">📝</div>
          <h2 className="text-lg font-bold text-white mb-2">Chưa có khoá học nào</h2>
          <p className="text-slate-400 max-w-md mx-auto mb-6">
            Bạn chưa tạo khoá học nào trên hệ thống. Bắt đầu chia sẻ kiến thức của bạn tới hàng ngàn học viên!
          </p>
          <Link to="/instructor/create-course" className="text-blue-400 font-medium hover:underline">
            Tạo khoá học đầu tiên →
          </Link>
        </div>

      ) : (
        /* ── Table ──────────────────────────────────────────────────────── */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <colgroup>
                <col style={{width:'auto'}} />
                <col style={{width:'110px'}} />
                <col style={{width:'110px'}} />
                <col style={{width:'90px'}} />
                <col style={{width:'80px'}} />
                <col style={{width:'130px'}} />
                <col style={{width:'210px'}} />
              </colgroup>

              {/* Header */}
              <thead className="border-b border-slate-800 text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-800/30">
                <tr>
                  <th className="px-5 py-3 font-medium">Khoá học</th>
                  <th className="px-4 py-3 font-medium text-center">Danh mục</th>
                  <th className="px-4 py-3 font-medium text-right">Giá</th>
                  <th className="px-4 py-3 font-medium text-right">Học viên</th>
                  <th className="px-4 py-3 font-medium text-right">Rating</th>
                  <th className="px-4 py-3 font-medium text-center">Trạng thái</th>
                  <th className="px-5 py-3 font-medium text-right">Thao tác</th>
                </tr>
              </thead>

              {/* Body */}
              <tbody className="divide-y divide-slate-800">
                {courses.map(c => (
                  <tr key={c._id} className="hover:bg-slate-800/40 transition-colors">

                    {/* Khoá học */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-800 flex-shrink-0">
                          {c.thumbnail
                            ? <img src={c.thumbnail} alt="" className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center text-slate-600">📚</div>
                          }
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-white line-clamp-2 leading-snug text-sm">{c.title}</p>
                          {/* Lý do từ chối */}
                          {c.reviewStatus === 'rejected' && c.rejectionReason && (
                            <p className="text-xs text-red-400 mt-0.5 line-clamp-1">⚠ {c.rejectionReason}</p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Danh mục */}
                    <td className="px-4 py-3.5 text-center">
                      <span className="text-xs text-blue-400 font-medium bg-blue-500/10 px-2.5 py-1 rounded-full whitespace-nowrap">
                        {c.category?.name || '—'}
                      </span>
                    </td>

                    {/* Giá */}
                    <td className="px-4 py-3.5 text-right">
                      <span className="font-mono text-emerald-400 font-medium">
                        {c.isFree || c.price === 0 ? 'Miễn phí' : `${Number(c.price).toLocaleString('vi')}đ`}
                      </span>
                    </td>

                    {/* Học viên */}
                    <td className="px-4 py-3.5 text-right">
                      <span className="text-slate-300 font-medium">{c.totalStudents ?? 0}</span>
                    </td>

                    {/* Rating */}
                    <td className="px-4 py-3.5 text-right">
                      <span className="text-amber-400 font-medium">
                        {c.averageRating ? `★ ${c.averageRating}` : <span className="text-slate-600">—</span>}
                      </span>
                    </td>

                    {/* Trạng thái */}
                    <td className="px-4 py-3.5 text-center">
                      <StatusBadge course={c} />
                    </td>

                    {/* Thao tác */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1.5 flex-wrap">
                        {/* Quản lý bài học */}
                        <button
                          onClick={() => navigate(`/instructor/edit-course/${c._id}?tab=curriculum`)}
                          title="Quản lý bài học"
                          className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 border border-slate-700 hover:border-blue-500/30 rounded-lg transition-colors"
                        >📚</button>

                        {/* Chỉnh sửa thông tin */}
                        <button
                          onClick={() => navigate(`/instructor/edit-course/${c._id}?tab=basic`)}
                          title="Chỉnh sửa"
                          className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 border border-slate-700 hover:border-amber-500/30 rounded-lg transition-colors"
                        >✏️</button>

                        {/* DRAFT: xoá + gửi duyệt */}
                        {c.status === 'draft' && (
                          <>
                            <button
                              onClick={() => handleDelete(c._id)}
                              title="Xoá bản nháp"
                              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-slate-700 hover:border-red-500/30 rounded-lg transition-colors"
                            >🗑️</button>
                            <button
                              onClick={() => handleSubmit(c._id)}
                              className="px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 rounded-lg shadow shadow-indigo-500/20 transition-all whitespace-nowrap"
                            >Gửi duyệt</button>
                          </>
                        )}

                        {/* PUBLISHED + REJECTED: gửi duyệt lại */}
                        {c.status === 'published' && c.reviewStatus === 'rejected' && (
                          <button
                            onClick={() => handleResubmit(c._id)}
                            className="px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 rounded-lg shadow shadow-orange-500/20 transition-all whitespace-nowrap"
                          >Gửi lại</button>
                        )}

                        {/* PUBLISHED + PENDING: đang chờ duyệt */}
                        {c.status === 'published' && c.reviewStatus === 'pending' && (
                          <span className="px-3 py-1.5 text-xs font-medium text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg whitespace-nowrap cursor-not-allowed">
                            ⏳ Đang chờ
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

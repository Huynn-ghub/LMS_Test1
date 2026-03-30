import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminCourseReviewAPI } from '../../services/api';

export default function AdminCourseReview() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [filterTab, setFilterTab] = useState('pending');
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('26tech_user') || '{}');
  const token = user.token;

  useEffect(() => {
    if (!token) {
      navigate('/auth');
      return;
    }
    fetchCourses();
  }, [page, filterTab, token, navigate]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const params = { page, limit: pageSize };
      const response =
        filterTab === 'approved'
          ? await adminCourseReviewAPI.getApproved(params)
          : filterTab === 'rejected'
          ? await adminCourseReviewAPI.getRejected(params)
          : await adminCourseReviewAPI.getPending(params);

      setCourses(response.data.courses || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error('Lỗi khi tải danh sách khoá học:', error);
      alert('Lỗi khi tải danh sách khoá học');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = async (course) => {
    try {
      setLoading(true);
      const response = await adminCourseReviewAPI.getByIdForReview(course._id);
      setSelectedCourse(response.data.data);
      setShowModal(true);
    } catch (error) {
      console.error('Lỗi khi tải chi tiết khoá học:', error);
      alert('Lỗi khi tải chi tiết khoá học');
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedCourse(null);
    setRejectionReason('');
  };

  const handleApproveCourse = async (courseId) => {
    if (!window.confirm('Bạn có chắc muốn duyệt khoá học này?')) return;

    try {
      setActionLoading(true);
      await adminCourseReviewAPI.approve(courseId);
      alert('Khoá học đã được duyệt thành công');
      closeModal();
      fetchCourses();
    } catch (error) {
      console.error('Lỗi khi duyệt khoá học:', error);
      alert(error.response?.data?.message || 'Lỗi khi duyệt khoá học');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectCourse = async (courseId) => {
    if (!rejectionReason.trim()) {
      alert('Vui lòng nhập lý do từ chối');
      return;
    }

    if (!window.confirm('Bạn có chắc muốn từ chối khoá học này?')) return;

    try {
      setActionLoading(true);
      await adminCourseReviewAPI.reject(courseId, rejectionReason);
      alert('Khoá học đã bị từ chối');
      closeModal();
      fetchCourses();
    } catch (error) {
      console.error('Lỗi khi từ chối khoá học:', error);
      alert(error.response?.data?.message || 'Lỗi khi từ chối khoá học');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="animate-fade-in max-w-7xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Duyệt Khoá Học</h1>
        <p className="text-slate-400 text-sm">Kiểm tra và duyệt khoá học từ giảng viên</p>
      </div>

      <div className="flex gap-4 mb-6 border-b border-slate-700">
        {['pending', 'approved', 'rejected'].map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setFilterTab(tab);
              setPage(1);
            }}
            className={`px-4 py-3 font-medium transition ${
              filterTab === tab
                ? 'text-white border-b-2 border-blue-500'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            {tab === 'pending' && '⏳ Chờ Duyệt'}
            {tab === 'approved' && '✅ Đã Duyệt'}
            {tab === 'rejected' && '❌ Bị Từ Chối'}
          </button>
        ))}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400">Đang tải...</div>
        ) : courses.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            {filterTab === 'pending' && 'Không có khoá học chờ duyệt'}
            {filterTab === 'approved' && 'Không có khoá học đã duyệt'}
            {filterTab === 'rejected' && 'Không có khoá học bị từ chối'}
          </div>
        ) : (
          <div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-800 border-b border-slate-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300">Tên Khoá Học</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300">Giảng Viên</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300">Trạng Thái</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300">Hành Động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {courses.map((course) => (
                    <tr key={course._id} className="hover:bg-slate-800/50 transition">
                      <td className="px-6 py-4 text-sm font-medium text-white max-w-xs truncate">{course.title}</td>
                      <td className="px-6 py-4 text-sm text-slate-300">{course.instructor?.name || 'N/A'}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                            course.reviewStatus === 'pending'
                              ? 'bg-amber-500/20 text-amber-300'
                              : course.reviewStatus === 'approved'
                              ? 'bg-green-500/20 text-green-300'
                              : 'bg-red-500/20 text-red-300'
                          }`}
                        >
                          {course.reviewStatus === 'pending' && '⏳ Chờ'}
                          {course.reviewStatus === 'approved' && '✅ Duyệt'}
                          {course.reviewStatus === 'rejected' && '❌ Từ chối'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => handleViewDetail(course)}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                        >
                          Xem Chi Tiết
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center gap-2 p-4 border-t border-slate-700">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setPage(i + 1)}
                    className={`px-3 py-1 rounded transition ${
                      page === i + 1 ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {showModal && selectedCourse && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-h-screen overflow-y-auto max-w-3xl w-full">
            <div className="sticky top-0 bg-slate-800 border-b border-slate-700 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">📘 Chi Tiết Khoá Học</h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-white text-2xl">
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white mb-4">📚 Thông Tin Khoá Học</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-slate-400 text-sm">Tên Khoá Học</p>
                    <p className="text-white font-medium">{selectedCourse.title}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Giảng Viên</p>
                    <p className="text-white font-medium">{selectedCourse.instructor?.name}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Danh Mục</p>
                    <p className="text-white font-medium">{selectedCourse.category?.name}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Mức Độ</p>
                    <p className="text-white font-medium capitalize">{selectedCourse.level}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-slate-400 text-sm">Mô Tả</p>
                  <p className="text-white mt-2">{selectedCourse.description}</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white mb-4">📖 Chương Học và Bài Học</h3>
                <div className="space-y-4">
                  {selectedCourse.chapters?.map((chapter, idx) => (
                    <div key={chapter._id} className="bg-slate-800 rounded-lg p-4">
                      <div className="font-medium text-white mb-3">
                        Chương {idx + 1}: {chapter.title}
                      </div>
                      <div className="space-y-2">
                        {chapter.lessons?.map((lesson, lessonIdx) => (
                          <div key={lesson._id} className="text-sm text-slate-300 ml-4 flex items-start gap-2">
                            <span className="text-slate-500">•</span>
                            <span>
                              Bài {lessonIdx + 1}: {lesson.title}
                              <br />
                              <span className="text-xs text-slate-500">Loại: {lesson.type}</span>
                            </span>
                          </div>
                        ))}
                        {(!chapter.lessons || chapter.lessons.length === 0) && (
                          <div className="text-sm text-slate-500 ml-4">Chưa có bài học</div>
                        )}
                      </div>
                    </div>
                  ))}
                  {(!selectedCourse.chapters || selectedCourse.chapters.length === 0) && (
                    <div className="text-slate-400 text-sm">Chưa có chương học nào</div>
                  )}
                </div>
              </div>

              {selectedCourse.reviewStatus === 'rejected' && selectedCourse.rejectionReason && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                  <p className="text-slate-400 text-sm mb-2">Lý Do Từ Chối</p>
                  <p className="text-red-300">{selectedCourse.rejectionReason}</p>
                </div>
              )}

              {selectedCourse.reviewStatus === 'pending' && (
                <div>
                  <p className="text-slate-400 text-sm mb-2">Lý Do Từ Chối</p>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Nhập lý do từ chối khoá học..."
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
                    rows="3"
                  />
                </div>
              )}
            </div>

            {selectedCourse.reviewStatus === 'pending' ? (
              <div className="border-t border-slate-700 bg-slate-800 px-6 py-4 flex justify-end gap-3">
                <button
                  onClick={closeModal}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition disabled:opacity-50"
                >
                  Huỷ
                </button>
                <button
                  onClick={() => handleRejectCourse(selectedCourse._id)}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition disabled:opacity-50"
                >
                  {actionLoading ? 'Đang xử lý...' : 'Từ Chối'}
                </button>
                <button
                  onClick={() => handleApproveCourse(selectedCourse._id)}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition disabled:opacity-50"
                >
                  {actionLoading ? 'Đang xử lý...' : 'Duyệt'}
                </button>
              </div>
            ) : (
              <div className="border-t border-slate-700 bg-slate-800 px-6 py-4 flex justify-end">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
                >
                  Đóng
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

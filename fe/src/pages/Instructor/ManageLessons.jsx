import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

// ── Helpers ───────────────────────────────────────────────────────────
const TYPE_CONFIG = {
  video: { label: 'Video', icon: '🎬', color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' },
  text: { label: 'Bài đọc', icon: '📝', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
  quiz: { label: 'Quiz', icon: '🧩', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
};

const EMPTY_FORM = {
  title: '',
  type: 'video',
  order: 1,
  // video
  video_url: '',
  duration: '',
  // text
  text_content: '',
  // quiz
  questions: [
    {
      question: '',
      options: ['', '', '', ''],
      correctIndex: 0,
    },
  ],
};

export default function ManageLessons() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [courseTitle, setCourseTitle] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [dragging, setDragging] = useState(null);

  // ── Mock load (sẽ thay bằng API thật) ─────────────────────────────
  useEffect(() => {
    setTimeout(() => {
      setCourseTitle('Khoá học mẫu');
      setLessons([
        {
          _id: '1',
          title: 'Giới thiệu khoá học',
          type: 'video',
          order: 1,
          content: { video_url: 'https://youtube.com/watch?v=abc', duration: 300 },
        },
        {
          _id: '2',
          title: 'Kiến thức nền tảng',
          type: 'text',
          order: 2,
          content: { text: '<h2>Nội dung bài học</h2><p>...</p>' },
        },
        {
          _id: '3',
          title: 'Kiểm tra hiểu biết',
          type: 'quiz',
          order: 3,
          content: {
            questions: [
              { question: 'React là gì?', options: ['Thư viện JS', 'Framework', 'Database', 'OS'], correctIndex: 0 },
            ],
          },
        },
      ]);
      setLoading(false);
    }, 500);
  }, [courseId]);

  // ── Form helpers ──────────────────────────────────────────────────
  const resetForm = () => {
    setForm({ ...EMPTY_FORM, order: lessons.length + 1 });
    setEditingId(null);
  };

  const openCreate = () => {
    resetForm();
    setShowForm(true);
  };

  const openEdit = (lesson) => {
    const f = {
      title: lesson.title,
      type: lesson.type,
      order: lesson.order,
      video_url: lesson.content?.video_url || '',
      duration: lesson.content?.duration ? String(Math.floor(lesson.content.duration / 60)) : '',
      text_content: lesson.content?.text || '',
      questions: lesson.content?.questions || EMPTY_FORM.questions,
    };
    setForm(f);
    setEditingId(lesson._id);
    setShowForm(true);
  };

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  // Quiz helpers
  const setQuestion = (qi, val) => {
    const qs = [...form.questions];
    qs[qi] = { ...qs[qi], question: val };
    set('questions', qs);
  };
  const setOption = (qi, oi, val) => {
    const qs = [...form.questions];
    qs[qi].options[oi] = val;
    set('questions', qs);
  };
  const setCorrect = (qi, oi) => {
    const qs = [...form.questions];
    qs[qi].correctIndex = oi;
    set('questions', qs);
  };
  const addQuestion = () =>
    set('questions', [
      ...form.questions,
      { question: '', options: ['', '', '', ''], correctIndex: 0 },
    ]);
  const removeQuestion = (qi) =>
    set('questions', form.questions.filter((_, i) => i !== qi));

  // ── Save (mock) ───────────────────────────────────────────────────
  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Vui lòng nhập tiêu đề bài học');
    setSaving(true);

    await new Promise(r => setTimeout(r, 700));

    let content = {};
    if (form.type === 'video') {
      content = { video_url: form.video_url, duration: Number(form.duration) * 60 };
    } else if (form.type === 'text') {
      content = { text: form.text_content };
    } else {
      content = { questions: form.questions };
    }

    if (editingId) {
      setLessons(prev =>
        prev.map(l => l._id === editingId ? { ...l, title: form.title, type: form.type, order: form.order, content } : l)
          .sort((a, b) => a.order - b.order)
      );
      toast.success('✅ Cập nhật bài học thành công!');
    } else {
      const newLesson = {
        _id: Date.now().toString(),
        title: form.title,
        type: form.type,
        order: form.order,
        content,
      };
      setLessons(prev => [...prev, newLesson].sort((a, b) => a.order - b.order));
      toast.success('✅ Tạo bài học thành công!');
    }

    setSaving(false);
    setShowForm(false);
    resetForm();
  };

  // ── Delete (mock) ─────────────────────────────────────────────────
  const handleDelete = (id) => {
    if (!window.confirm('Xoá bài học này?')) return;
    setLessons(prev => prev.filter(l => l._id !== id));
    toast.success('🗑️ Đã xoá bài học');
  };

  // ── Drag-to-reorder (mock) ────────────────────────────────────────
  const handleDragStart = (e, id) => setDragging(id);
  const handleDrop = (e, targetId) => {
    if (!dragging || dragging === targetId) return;
    const sorted = [...lessons].sort((a, b) => a.order - b.order);
    const fromIdx = sorted.findIndex(l => l._id === dragging);
    const toIdx = sorted.findIndex(l => l._id === targetId);
    if (fromIdx < 0 || toIdx < 0) return;
    const reordered = [...sorted];
    const [moved] = reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, moved);
    setLessons(reordered.map((l, i) => ({ ...l, order: i + 1 })));
    setDragging(null);
    toast.success('🔀 Đã sắp xếp lại thứ tự');
  };

  const sorted = [...lessons].sort((a, b) => a.order - b.order);

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      {/* ── Header ── */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/instructor/dashboard')}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1">
          <p className="text-xs text-slate-500 mb-0.5">Khoá học</p>
          <h1 className="text-2xl font-bold text-white">{courseTitle || '...'} — Quản lý Bài học</h1>
        </div>
        <button
          onClick={openCreate}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 font-bold rounded-xl text-white text-sm transition-all shadow-lg shadow-blue-500/30"
        >
          + Thêm bài học
        </button>
      </div>

      {/* ── Drag-hint banner ── */}
      {lessons.length > 1 && (
        <div className="mb-4 flex items-center gap-2 px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-500">
          <span>⠿</span>
          <span>Kéo thả các bài học để sắp xếp lại thứ tự</span>
        </div>
      )}

      {/* ── Lesson list ── */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-slate-900 border border-slate-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/50 border border-slate-800 border-dashed rounded-2xl flex flex-col items-center">
          <div className="text-4xl mb-4">📚</div>
          <h2 className="text-lg font-bold text-white mb-2">Chưa có bài học nào</h2>
          <p className="text-slate-400 max-w-sm mx-auto mb-6 text-sm">
            Bắt đầu thêm nội dung bài học vào khoá học của bạn
          </p>
          <button
            onClick={openCreate}
            className="text-blue-400 font-medium hover:underline text-sm"
          >
            + Tạo bài học đầu tiên
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((lesson) => {
            const tc = TYPE_CONFIG[lesson.type] || TYPE_CONFIG.video;
            const isDraggingOver = dragging && dragging !== lesson._id;
            return (
              <div
                key={lesson._id}
                draggable
                onDragStart={e => handleDragStart(e, lesson._id)}
                onDragOver={e => e.preventDefault()}
                onDrop={e => handleDrop(e, lesson._id)}
                className={`flex items-center gap-4 p-4 bg-slate-900 border rounded-2xl transition-all cursor-grab active:cursor-grabbing hover:border-slate-700 ${
                  isDraggingOver ? 'border-blue-500/40 bg-slate-800' : 'border-slate-800'
                }`}
              >
                {/* Drag handle */}
                <div className="text-slate-600 hover:text-slate-400 transition-colors text-lg leading-none select-none">
                  ⠿
                </div>

                {/* Order badge */}
                <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-mono font-bold text-slate-400">
                  {lesson.order}
                </div>

                {/* Type badge */}
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${tc.color}`}>
                  <span>{tc.icon}</span>
                  {tc.label}
                </div>

                {/* Title */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white truncate">{lesson.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {lesson.type === 'video' && lesson.content?.duration
                      ? `${Math.floor(lesson.content.duration / 60)} phút`
                      : lesson.type === 'quiz' && lesson.content?.questions
                      ? `${lesson.content.questions.length} câu hỏi`
                      : 'Bài đọc'}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => openEdit(lesson)}
                    className="px-3 py-1.5 text-xs font-medium border border-slate-700 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg transition-colors"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => handleDelete(lesson._id)}
                    className="px-3 py-1.5 text-xs font-medium border border-slate-700 hover:bg-red-500/10 hover:border-red-500/30 text-red-400 rounded-lg transition-colors"
                  >
                    Xoá
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Create / Edit Modal ── */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl">
            {/* Modal header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white">
                {editingId ? '✏️ Chỉnh sửa bài học' : '➕ Thêm bài học mới'}
              </h2>
              <button
                onClick={() => { setShowForm(false); resetForm(); }}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal body */}
            <form onSubmit={handleSave} className="p-6 space-y-5">
              {/* Title & order */}
              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-3">
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Tiêu đề bài học *</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={e => set('title', e.target.value)}
                    placeholder="Ví dụ: Giới thiệu về React Hooks"
                    className="w-full bg-slate-800 border border-slate-700 focus:border-blue-500 text-slate-100 placeholder-slate-500 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Thứ tự</label>
                  <input
                    type="number"
                    min="1"
                    value={form.order}
                    onChange={e => set('order', Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 focus:border-blue-500 text-slate-100 rounded-xl px-4 py-3 text-sm outline-none transition-all"
                  />
                </div>
              </div>

              {/* Type selector */}
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-3">Loại bài học</label>
                <div className="grid grid-cols-3 gap-3">
                  {Object.entries(TYPE_CONFIG).map(([key, cfg]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => set('type', key)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                        form.type === key
                          ? 'border-blue-500 bg-blue-500/10'
                          : 'border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      <span className="text-2xl">{cfg.icon}</span>
                      <span className={`text-xs font-bold ${form.type === key ? 'text-blue-400' : 'text-slate-400'}`}>
                        {cfg.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Nội dung theo loại ── */}

              {/* VIDEO */}
              {form.type === 'video' && (
                <div className="space-y-4 bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
                  <h3 className="text-sm font-bold text-blue-400">🎬 Nội dung Video</h3>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-2">URL Video (YouTube / Vimeo / CDN)</label>
                    <input
                      type="url"
                      value={form.video_url}
                      onChange={e => set('video_url', e.target.value)}
                      placeholder="https://youtube.com/watch?v=..."
                      className="w-full bg-slate-800 border border-slate-700 focus:border-blue-500 text-slate-100 placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-2">Thời lượng (phút)</label>
                    <input
                      type="number"
                      min="1"
                      value={form.duration}
                      onChange={e => set('duration', e.target.value)}
                      placeholder="10"
                      className="w-full bg-slate-800 border border-slate-700 focus:border-blue-500 text-slate-100 placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
                    />
                  </div>
                </div>
              )}

              {/* TEXT */}
              {form.type === 'text' && (
                <div className="space-y-4 bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
                  <h3 className="text-sm font-bold text-emerald-400">📝 Nội dung bài đọc</h3>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-2">
                      Nội dung (hỗ trợ HTML / Markdown)
                    </label>
                    <textarea
                      rows={8}
                      value={form.text_content}
                      onChange={e => set('text_content', e.target.value)}
                      placeholder="<h2>Tiêu đề</h2><p>Nội dung bài học...</p>"
                      className="w-full bg-slate-800 border border-slate-700 focus:border-blue-500 text-slate-100 placeholder-slate-500 rounded-xl px-4 py-3 text-sm outline-none transition-all resize-none font-mono"
                    />
                  </div>
                </div>
              )}

              {/* QUIZ */}
              {form.type === 'quiz' && (
                <div className="space-y-4 bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-amber-400">🧩 Câu hỏi Quiz</h3>
                    <button
                      type="button"
                      onClick={addQuestion}
                      className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors"
                    >
                      + Thêm câu hỏi
                    </button>
                  </div>

                  {form.questions.map((q, qi) => (
                    <div key={qi} className="bg-slate-900 border border-slate-700 rounded-xl p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded">
                          Q{qi + 1}
                        </span>
                        <input
                          type="text"
                          value={q.question}
                          onChange={e => setQuestion(qi, e.target.value)}
                          placeholder="Nhập câu hỏi..."
                          className="flex-1 bg-slate-800 border border-slate-700 focus:border-blue-500 text-slate-100 placeholder-slate-500 rounded-lg px-3 py-2 text-sm outline-none transition-all"
                        />
                        {form.questions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeQuestion(qi)}
                            className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        {q.options.map((opt, oi) => (
                          <div key={oi} className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setCorrect(qi, oi)}
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                                q.correctIndex === oi
                                  ? 'border-emerald-500 bg-emerald-500'
                                  : 'border-slate-600 hover:border-emerald-500/60'
                              }`}
                            >
                              {q.correctIndex === oi && (
                                <div className="w-2 h-2 rounded-full bg-white" />
                              )}
                            </button>
                            <input
                              type="text"
                              value={opt}
                              onChange={e => setOption(qi, oi, e.target.value)}
                              placeholder={`Đáp án ${String.fromCharCode(65 + oi)}`}
                              className="flex-1 bg-slate-800 border border-slate-700 focus:border-blue-500 text-slate-100 placeholder-slate-500 rounded-lg px-3 py-1.5 text-sm outline-none transition-all"
                            />
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-slate-500">
                        ● Nhấn vào vòng tròn để chọn đáp án đúng
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* ── Footer actions ── */}
              <div className="flex gap-3 justify-end pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => { setShowForm(false); resetForm(); }}
                  className="px-5 py-2.5 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl font-semibold text-sm transition-all"
                >
                  Huỷ
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-500/25 disabled:opacity-60"
                >
                  {saving ? 'Đang lưu...' : editingId ? '💾 Cập nhật' : '✅ Tạo bài học'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

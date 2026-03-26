import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const TYPE_CONFIG = {
  video: { label: 'Video', icon: '🎬', color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' },
  text: { label: 'Bài đọc', icon: '📝', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
  quiz: { label: 'Quiz', icon: '🧩', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
};

// ── Mock data ──────────────────────────────────────────────────────────
const MOCK_LESSONS = [
  {
    _id: 'l1',
    title: 'Giới thiệu khoá học',
    type: 'video',
    order: 1,
    content: { video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duration: 300 },
  },
  {
    _id: 'l2',
    title: 'Kiến thức nền tảng',
    type: 'text',
    order: 2,
    content: {
      text: `<h2 style="color:#e2e8f0;font-size:1.3rem;font-weight:700;margin-bottom:12px">📌 Kiến thức nền tảng</h2>
<p style="color:#94a3b8;line-height:1.8;margin-bottom:16px">React là một thư viện JavaScript mã nguồn mở được phát triển bởi Meta, dùng để xây dựng giao diện người dùng (UI). React hoạt động theo mô hình component-based.</p>
<h3 style="color:#e2e8f0;font-size:1.1rem;font-weight:600;margin-bottom:8px">🔑 Các khái niệm cốt lõi:</h3>
<ul style="color:#94a3b8;line-height:2;padding-left:20px">
  <li><strong style="color:#e2e8f0">Component</strong> — Khối xây dựng cơ bản của mọi ứng dụng React</li>
  <li><strong style="color:#e2e8f0">Props</strong> — Dữ liệu truyền từ component cha xuống con</li>
  <li><strong style="color:#e2e8f0">State</strong> — Trạng thái nội bộ của một component</li>
  <li><strong style="color:#e2e8f0">JSX</strong> — Cú pháp mở rộng cho phép viết HTML trong JavaScript</li>
</ul>`,
    },
  },
  {
    _id: 'l3',
    title: 'Kiểm tra hiểu biết',
    type: 'quiz',
    order: 3,
    content: {
      questions: [
        {
          question: 'React là gì?',
          options: ['Thư viện JavaScript', 'Framework Python', 'Database', 'Hệ điều hành'],
          correctIndex: 0,
        },
        {
          question: 'Props trong React dùng để làm gì?',
          options: ['Lưu trạng thái nội bộ', 'Truyền dữ liệu giữa components', 'Kết nối database', 'Định tuyến URL'],
          correctIndex: 1,
        },
      ],
    },
  },
];

export default function LessonView() {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();

  const [lessons, setLessons] = useState([]);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Quiz state
  const [answers, setAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(null);

  useEffect(() => {
    setTimeout(() => {
      setLessons(MOCK_LESSONS);
      const target = lessonId
        ? MOCK_LESSONS.find(l => l._id === lessonId)
        : MOCK_LESSONS[0];
      setCurrentLesson(target || MOCK_LESSONS[0]);
      setLoading(false);
    }, 400);
  }, [courseId, lessonId]);

  const selectLesson = (lesson) => {
    setCurrentLesson(lesson);
    setAnswers({});
    setQuizSubmitted(false);
    setQuizScore(null);
    navigate(`/courses/${courseId}/lessons/${lesson._id}`, { replace: true });
  };

  const goNext = () => {
    const idx = lessons.findIndex(l => l._id === currentLesson._id);
    if (idx < lessons.length - 1) selectLesson(lessons[idx + 1]);
  };
  const goPrev = () => {
    const idx = lessons.findIndex(l => l._id === currentLesson._id);
    if (idx > 0) selectLesson(lessons[idx - 1]);
  };

  const handleQuizSubmit = () => {
    const qs = currentLesson.content.questions;
    let correct = 0;
    qs.forEach((q, i) => {
      if (answers[i] === q.correctIndex) correct++;
    });
    setQuizScore({ correct, total: qs.length });
    setQuizSubmitted(true);
    if (correct === qs.length) {
      toast.success('🎉 Hoàn hảo! Bạn trả lời đúng tất cả!');
    } else {
      toast(`Bạn trả lời đúng ${correct}/${qs.length} câu`, { icon: '📊' });
    }
  };

  const sorted = [...lessons].sort((a, b) => a.order - b.order);
  const currentIdx = sorted.findIndex(l => l._id === currentLesson?._id);

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-slate-700 border-t-blue-500 animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* ── Sidebar ── */}
      <aside className={`${sidebarOpen ? 'w-72' : 'w-0 overflow-hidden'} transition-all duration-300 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0`}>
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800 shrink-0">
          <div>
            <p className="text-xs text-slate-500">Nội dung khoá học</p>
            <p className="text-sm font-bold text-white truncate max-w-[180px]">Khoá học mẫu</p>
          </div>
          <span className="text-xs text-slate-500 font-mono">{currentIdx + 1}/{sorted.length}</span>
        </div>

        {/* Progress bar */}
        <div className="px-4 py-3 border-b border-slate-800">
          <div className="flex justify-between text-xs text-slate-400 mb-1.5">
            <span>Tiến độ</span>
            <span>{Math.round(((currentIdx + 1) / sorted.length) * 100)}%</span>
          </div>
          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${((currentIdx + 1) / sorted.length) * 100}%` }}
            />
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {sorted.map((lesson, idx) => {
            const tc = TYPE_CONFIG[lesson.type] || TYPE_CONFIG.video;
            const isActive = lesson._id === currentLesson?._id;
            const isDone = idx < currentIdx;
            return (
              <button
                key={lesson._id}
                onClick={() => selectLesson(lesson)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all ${
                  isActive
                    ? 'bg-blue-600/20 border border-blue-500/30'
                    : 'hover:bg-slate-800 border border-transparent'
                }`}
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs border shrink-0 ${
                  isDone ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' :
                  isActive ? 'bg-blue-500/20 border-blue-500/30 text-blue-400' :
                  'bg-slate-800 border-slate-700 text-slate-500'
                }`}>
                  {isDone ? '✓' : tc.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-semibold truncate ${isActive ? 'text-blue-300' : isDone ? 'text-slate-400' : 'text-slate-300'}`}>
                    {lesson.title}
                  </p>
                  <p className="text-xs text-slate-600 mt-0.5">{tc.label}</p>
                </div>
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-800">
          <Link
            to={`/courses/${courseId}`}
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Về trang khoá học
          </Link>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Top bar */}
        <header className="h-16 bg-slate-900/60 backdrop-blur-md border-b border-slate-800 flex items-center px-6 gap-4 shrink-0 sticky top-0 z-20">
          <button
            onClick={() => setSidebarOpen(o => !o)}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex-1 min-w-0">
            {currentLesson && (
              <div className="flex items-center gap-2">
                {(() => { const tc = TYPE_CONFIG[currentLesson.type]; return (
                  <span className={`text-xs font-bold px-2 py-0.5 rounded border ${tc.color}`}>
                    {tc.icon} {tc.label}
                  </span>
                ); })()}
                <h1 className="text-sm font-bold text-white truncate">{currentLesson?.title}</h1>
              </div>
            )}
          </div>

          {/* Nav buttons */}
          <div className="flex gap-2 shrink-0">
            <button
              onClick={goPrev}
              disabled={currentIdx <= 0}
              className="px-3 py-1.5 text-xs font-medium border border-slate-700 hover:bg-slate-800 text-slate-300 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              ← Trước
            </button>
            <button
              onClick={goNext}
              disabled={currentIdx >= sorted.length - 1}
              className="px-3 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Tiếp →
            </button>
          </div>
        </header>

        {/* Lesson content */}
        <main className="flex-1 overflow-y-auto">
          {currentLesson && (
            <div className="max-w-3xl mx-auto px-6 py-10">

              {/* ── VIDEO ── */}
              {currentLesson.type === 'video' && (
                <div className="space-y-6">
                  <div className="aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl shadow-black/50 border border-slate-800">
                    {currentLesson.content.video_url ? (
                      <iframe
                        src={currentLesson.content.video_url}
                        className="w-full h-full"
                        allowFullScreen
                        title={currentLesson.title}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-500">
                        <div className="text-center">
                          <div className="text-4xl mb-2">🎬</div>
                          <p className="text-sm">Video chưa được cấu hình</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white mb-2">{currentLesson.title}</h2>
                    {currentLesson.content.duration > 0 && (
                      <p className="text-sm text-slate-400">
                        ⏱ Thời lượng: {Math.floor(currentLesson.content.duration / 60)} phút
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* ── TEXT ── */}
              {currentLesson.type === 'text' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 pb-4 border-b border-slate-800">
                    <span className="text-2xl">📝</span>
                    <h2 className="text-2xl font-bold text-white">{currentLesson.title}</h2>
                  </div>
                  <div
                    className="prose prose-invert max-w-none leading-relaxed text-slate-300"
                    dangerouslySetInnerHTML={{ __html: currentLesson.content.text || '<p>Không có nội dung</p>' }}
                  />
                </div>
              )}

              {/* ── QUIZ ── */}
              {currentLesson.type === 'quiz' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
                    <span className="text-2xl">🧩</span>
                    <div>
                      <h2 className="text-2xl font-bold text-white">{currentLesson.title}</h2>
                      <p className="text-sm text-slate-400 mt-0.5">
                        {currentLesson.content.questions.length} câu hỏi
                      </p>
                    </div>
                  </div>

                  {/* Score display */}
                  {quizSubmitted && quizScore && (
                    <div className={`p-5 rounded-2xl border ${
                      quizScore.correct === quizScore.total
                        ? 'bg-emerald-500/10 border-emerald-500/30'
                        : 'bg-amber-500/10 border-amber-500/30'
                    }`}>
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">
                          {quizScore.correct === quizScore.total ? '🎉' : '📊'}
                        </span>
                        <div>
                          <p className={`font-bold text-lg ${quizScore.correct === quizScore.total ? 'text-emerald-400' : 'text-amber-400'}`}>
                            {quizScore.correct === quizScore.total ? 'Xuất sắc!' : 'Kết quả'}
                          </p>
                          <p className="text-slate-300 text-sm">
                            Bạn trả lời đúng <strong>{quizScore.correct}/{quizScore.total}</strong> câu
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Questions */}
                  <div className="space-y-5">
                    {currentLesson.content.questions.map((q, qi) => (
                      <div key={qi} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                        <p className="font-semibold text-white">
                          <span className="text-amber-400 font-mono mr-2">Q{qi + 1}.</span>
                          {q.question}
                        </p>
                        <div className="space-y-2">
                          {q.options.map((opt, oi) => {
                            const isSelected = answers[qi] === oi;
                            const isCorrect = oi === q.correctIndex;
                            let cls = 'border-slate-700 text-slate-300 hover:border-slate-600';
                            if (quizSubmitted) {
                              if (isCorrect) cls = 'border-emerald-500/60 bg-emerald-500/10 text-emerald-300';
                              else if (isSelected && !isCorrect) cls = 'border-red-500/60 bg-red-500/10 text-red-300';
                            } else if (isSelected) {
                              cls = 'border-blue-500 bg-blue-500/10 text-blue-300';
                            }
                            return (
                              <button
                                key={oi}
                                onClick={() => !quizSubmitted && setAnswers(a => ({ ...a, [qi]: oi }))}
                                disabled={quizSubmitted}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm text-left transition-all ${cls} disabled:cursor-not-allowed`}
                              >
                                <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold shrink-0 ${
                                  quizSubmitted && isCorrect ? 'border-emerald-500 bg-emerald-500 text-white' :
                                  isSelected && !quizSubmitted ? 'border-blue-500 bg-blue-500 text-white' :
                                  'border-current'
                                }`}>
                                  {String.fromCharCode(65 + oi)}
                                </span>
                                {opt}
                                {quizSubmitted && isCorrect && <span className="ml-auto text-emerald-400">✓</span>}
                                {quizSubmitted && isSelected && !isCorrect && <span className="ml-auto text-red-400">✗</span>}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Submit / Retry */}
                  {!quizSubmitted ? (
                    <button
                      onClick={handleQuizSubmit}
                      disabled={Object.keys(answers).length < currentLesson.content.questions.length}
                      className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-white font-bold rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-amber-500/20"
                    >
                      Nộp bài
                    </button>
                  ) : (
                    <button
                      onClick={() => { setAnswers({}); setQuizSubmitted(false); setQuizScore(null); }}
                      className="w-full py-3 border border-slate-700 hover:bg-slate-800 text-slate-300 hover:text-white font-medium rounded-xl transition-all"
                    >
                      🔄 Làm lại
                    </button>
                  )}
                </div>
              )}

              {/* Bottom navigation */}
              <div className="flex justify-between mt-12 pt-6 border-t border-slate-800">
                <button
                  onClick={goPrev}
                  disabled={currentIdx <= 0}
                  className="flex items-center gap-2 px-5 py-2.5 border border-slate-700 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl font-medium text-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Bài trước
                </button>
                <button
                  onClick={goNext}
                  disabled={currentIdx >= sorted.length - 1}
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-500/25 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Bài tiếp theo
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

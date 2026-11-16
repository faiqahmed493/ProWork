import React, { useState } from 'react';
import { Bell, Check, Send } from 'lucide-react';
import { OpenQuestion } from '../data/teamDashboardData';

interface OpenQuestionsCardProps {
  questions: OpenQuestion[];
  onReplyQuestion: (id: string, replyText: string) => void;
  onNudgeQuestion: (id: string) => void;
  onOpenMessageTeam: () => void;
}

export const OpenQuestionsCard: React.FC<OpenQuestionsCardProps> = ({
  questions,
  onReplyQuestion,
  onNudgeQuestion,
  onOpenMessageTeam,
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'reply' | 'waiting'>(
    'all'
  );
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');

  const needsReplyCount = questions.filter((q) => q.mode === 'reply').length;
  const waitingCount = questions.filter((q) => q.mode === 'waiting').length;
  const answeredCount = questions.filter((q) => q.mode === 'answered').length;
  const avgReplyMinutes = Math.max(24, 51 - answeredCount * 4);

  const visibleQuestions = questions.filter((q) => {
    if (filterMode === 'reply') return q.mode === 'reply';
    if (filterMode === 'waiting') return q.mode === 'waiting';
    return true;
  });

  const handleSubmitReply = (e: React.FormEvent, id: string) => {
    e.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed) return;
    onReplyQuestion(id, trimmed);
    setDraft('');
    setReplyingId(null);
  };

  return (
    <section
      id="team-questions"
      aria-labelledby="open-questions-heading"
      className="bg-white dark:bg-[#121216] border border-slate-200/90 dark:border-zinc-800 rounded-xl p-6 flex flex-col justify-between transition-colors"
    >
      <div>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2
              id="open-questions-heading"
              className="font-display text-base font-semibold text-slate-900 dark:text-zinc-100"
            >
              Open questions
            </h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-zinc-400 tabular-nums">
              {needsReplyCount > 0
                ? `${needsReplyCount} waiting for your reply · Usual reply ${avgReplyMinutes}m`
                : `All direct questions answered · Usual reply ${avgReplyMinutes}m`}
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenMessageTeam}
            className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:underline"
          >
            New message →
          </button>
        </div>

        {/* Filter Tabs */}
        <div
          role="group"
          aria-label="Filter open questions"
          className="mt-4 inline-flex items-center p-0.5 bg-slate-100 dark:bg-zinc-900 rounded-lg border border-slate-200/60 dark:border-zinc-800"
        >
          <button
            type="button"
            onClick={() => setFilterMode('all')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              filterMode === 'all'
                ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 shadow-xs'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100'
            }`}
          >
            All ({questions.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('reply')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              filterMode === 'reply'
                ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 shadow-xs'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100'
            }`}
          >
            Needs reply ({needsReplyCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('waiting')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              filterMode === 'waiting'
                ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 shadow-xs'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100'
            }`}
          >
            Waiting ({waitingCount})
          </button>
        </div>

        {/* Questions List */}
        <ul className="mt-3 divide-y divide-slate-100 dark:divide-zinc-800">
          {visibleQuestions.length === 0 ? (
            <li className="py-8 text-center text-xs text-slate-500 dark:text-zinc-400">
              No questions in this view.
            </li>
          ) : (
            visibleQuestions.map((item) => {
              const isReplying = replyingId === item.id;

              return (
                <li key={item.id} className="py-3.5">
                  <div className="flex items-start gap-3">
                    <span
                      className={`w-8 h-8 rounded-full text-xs font-semibold flex items-center justify-center shrink-0 ${item.avatarBg}`}
                    >
                      {item.initials}
                    </span>

                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-900 dark:text-zinc-100 leading-snug">
                        {item.question}
                      </p>
                      <p className="mt-1 text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
                        {item.context} · {item.askedAt}
                      </p>

                      {item.mode === 'answered' && item.replyText && (
                        <p className="mt-1.5 text-xs text-emerald-700 dark:text-emerald-400">
                          You replied: &ldquo;{item.replyText}&rdquo;
                        </p>
                      )}
                    </div>

                    <div className="shrink-0">
                      {item.mode === 'reply' && (
                        <button
                          type="button"
                          onClick={() => {
                            setReplyingId(isReplying ? null : item.id);
                            setDraft('');
                          }}
                          className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap cursor-pointer ${
                            isReplying
                              ? 'text-slate-700 dark:text-zinc-200 bg-slate-100 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 hover:bg-slate-200 dark:hover:bg-zinc-700'
                              : 'text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-900/60 hover:bg-red-100 dark:hover:bg-red-950/80'
                          }`}
                        >
                          {isReplying ? 'Cancel' : 'Reply'}
                        </button>
                      )}

                      {item.mode === 'waiting' && (
                        <button
                          type="button"
                          onClick={() => onNudgeQuestion(item.id)}
                          disabled={item.nudged}
                          className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap ${
                            item.nudged
                              ? 'bg-slate-50 dark:bg-zinc-900 text-slate-400 dark:text-zinc-500 border-slate-200 dark:border-zinc-800 cursor-default'
                              : 'bg-slate-50 dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer'
                          }`}
                        >
                          {item.nudged ? (
                            <>
                              <Check
                                className="w-3 h-3 text-emerald-600 dark:text-emerald-400"
                                aria-hidden="true"
                              />
                              <span>Nudged</span>
                            </>
                          ) : (
                            <>
                              <Bell className="w-3 h-3" aria-hidden="true" />
                              <span>Nudge</span>
                            </>
                          )}
                        </button>
                      )}

                      {item.mode === 'answered' && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                          <Check className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Sent</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {isReplying && (
                    <div className="mt-2.5 pl-11 space-y-2">
                      {item.quickReplies && item.quickReplies.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[11px] text-slate-400 dark:text-zinc-500">
                            Quick send:
                          </span>
                          {item.quickReplies.map((preset) => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => {
                                onReplyQuestion(item.id, preset);
                                setDraft('');
                                setReplyingId(null);
                              }}
                              className="px-2.5 py-1 text-[11px] font-medium text-slate-700 dark:text-zinc-200 bg-slate-100 dark:bg-zinc-800 hover:bg-blue-50 dark:hover:bg-blue-950/60 hover:text-blue-700 dark:hover:text-blue-300 rounded-md transition-colors cursor-pointer"
                            >
                              {preset}
                            </button>
                          ))}
                        </div>
                      )}

                      <form
                        onSubmit={(e) => handleSubmitReply(e, item.id)}
                        className="flex items-center gap-2"
                      >
                        <input
                          type="text"
                          value={draft}
                          onChange={(e) => setDraft(e.target.value)}
                          placeholder={`Reply to ${item.sender}...`}
                          autoFocus
                          className="flex-1 text-xs px-3 py-1.5 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                        />
                        <button
                          type="submit"
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap cursor-pointer"
                        >
                          <Send className="w-3 h-3" aria-hidden="true" />
                          <span>Send</span>
                        </button>
                      </form>
                    </div>
                  )}
                </li>
              );
            })
          )}
        </ul>
      </div>
    </section>
  );
};

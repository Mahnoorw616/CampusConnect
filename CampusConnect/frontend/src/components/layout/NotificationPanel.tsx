import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, MessageCircle, Heart, ShoppingBag, Info, X, RefreshCw } from 'lucide-react';
import { AppNotification } from '../../types';
import { formatTimeAgo, notificationsService } from '../../services/api';
import { useToast } from '../../context/ToastContext';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  unreadCount: number;
  isLoading: boolean;
  error: boolean;
  onRefresh: () => Promise<void>;
  onUpdate: (notifications: AppNotification[], unreadCount: number) => void;
}

const icons = { COMMENT: MessageCircle, LIKE: Heart, MARKETPLACE: ShoppingBag, SYSTEM: Info };
const colors = {
  COMMENT: 'bg-sky-50 text-sky-600 dark:bg-sky-950 dark:text-sky-300',
  LIKE: 'bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-300',
  MARKETPLACE: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  SYSTEM: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
};

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
  isOpen, onClose, notifications, unreadCount, isLoading, error, onRefresh, onUpdate,
}) => {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [markingAll, setMarkingAll] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    if (!isOpen) return;
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const markRead = async (notification: AppNotification) => {
    if (notification.isRead || pendingId) return !pendingId;
    setPendingId(notification.id);
    try {
      await notificationsService.markAsRead(notification.id);
      onUpdate(notifications.map((item) => item.id === notification.id ? { ...item, isRead: true } : item), Math.max(0, unreadCount - 1));
      return true;
    } catch {
      showToast('Could not mark notification as read', 'error');
      return false;
    } finally {
      setPendingId(null);
    }
  };

  const openNotification = async (notification: AppNotification) => {
    if (!(await markRead(notification))) return;
    if (notification.postId) navigate(`/?post=${encodeURIComponent(notification.postId)}`);
    else if (notification.marketplaceId) navigate(`/marketplace?listing=${encodeURIComponent(notification.marketplaceId)}`);
    else return;
    onClose();
  };

  const markAll = async () => {
    if (markingAll || !unreadCount) return;
    setMarkingAll(true);
    try {
      await notificationsService.markAllAsRead();
      onUpdate(notifications.map((item) => ({ ...item, isRead: true })), 0);
    } catch {
      showToast('Could not mark all notifications as read', 'error');
    } finally {
      setMarkingAll(false);
    }
  };

  const visible = filter === 'unread' ? notifications.filter((item) => !item.isRead) : notifications;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-slate-950/25 backdrop-blur-[2px]" onClick={onClose} aria-hidden="true" />
      <section role="dialog" aria-modal="true" aria-labelledby="notification-heading" className="fixed flex z-50 top-16 bottom-16 left-2 right-2 sm:left-auto sm:right-5 sm:top-5 sm:bottom-auto sm:h-[min(640px,calc(100vh-40px))] sm:w-[400px] flex-col overflow-hidden rounded-2xl border-slate-200 dark:border-slate-700 bg-white dark:bg-[#131D31] shadow-2xl shadow-slate-900/20">
        <div className="px-5 pt-5 pb-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 id="notification-heading" className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">Notifications</h2>
                {unreadCount > 0 && <span className="rounded-full bg-[#17243A] dark:bg-slate-200 px-2 py-0.5 text-[11px] font-bold text-white dark:text-slate-900">{unreadCount}</span>}
              </div>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Stay in the loop with your campus.</p>
            </div>
            <button ref={closeRef} onClick={onClose} aria-label="Close notifications" className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500"><X className="w-4 h-4" /></button>
          </div>
          <div className="flex items-center justify-between mt-5 gap-2">
            <div className="flex gap-1 rounded-lg bg-slate-100 dark:bg-slate-800 p-1" role="group" aria-label="Filter notifications">
              {(['all', 'unread'] as const).map((tab) => (
                <button key={tab} onClick={() => setFilter(tab)} aria-pressed={filter === tab} className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${filter === tab ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>
                  {tab === 'all' ? 'All' : 'Unread'}
                </button>
              ))}
            </div>
            <button onClick={markAll} disabled={!unreadCount || markingAll || isLoading} className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#17243A] dark:text-slate-200 hover:underline disabled:opacity-40 disabled:no-underline">
              <Check className="w-3.5 h-3.5" /> Mark all read
            </button>
          </div>
        </div>
        <div className="overflow-y-auto min-h-0 flex-1" aria-live="polite">
          {isLoading ? (
            <div className="p-5 space-y-4" aria-label="Loading notifications">
              {[1, 2, 3].map((item) => <div key={item} className="flex gap-3 animate-pulse"><div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0" /><div className="flex-1 space-y-2 pt-1"><div className="h-3 w-3/4 rounded bg-slate-100 dark:bg-slate-800" /><div className="h-3 w-1/2 rounded bg-slate-100 dark:bg-slate-800" /></div></div>)}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center text-center px-6 py-14"><Info className="w-8 h-8 text-slate-400 mb-3" /><p className="text-sm font-semibold dark:text-white">Couldn't load notifications</p><p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">Check your connection and try again.</p><button onClick={() => void onRefresh()} className="inline-flex items-center gap-2 text-xs font-semibold text-[#17243A] dark:text-slate-200"><RefreshCw className="w-4 h-4" /> Try again</button></div>
          ) : visible.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center px-6 py-14"><span className="flex items-center justify-center w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-2xl mb-4"><Bell className="w-6 h-6 text-slate-500 dark:text-slate-400" /></span><p className="text-sm font-semibold text-slate-900 dark:text-white">{filter === 'unread' ? 'All caught up' : 'No notifications yet'}</p><p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-56">{filter === 'unread' ? 'You have no unread updates right now.' : 'When someone interacts with your discussions, you’ll see it here.'}</p></div>
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {visible.map((notification) => {
                const Icon = icons[notification.type];
                const hasDestination = !!(notification.postId || notification.marketplaceId);
                return (
                  <li key={notification.id} className={`relative flex gap-3 px-5 py-4 ${notification.isRead ? '' : 'bg-slate-50/80 dark:bg-slate-800/40'}`}>
                    <span className={`flex shrink-0 items-center justify-center w-10 h-10 rounded-xl ${colors[notification.type]}`}><Icon className="w-5 h-5" /></span>
                    <div className="min-w-0 flex-1">
                      <button onClick={() => void openNotification(notification)} disabled={pendingId === notification.id} className={`block w-full text-left text-[13px] leading-relaxed text-slate-800 dark:text-slate-200 ${hasDestination ? 'hover:underline' : 'cursor-default'} disabled:opacity-60`}>{notification.message}</button>
                      <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-500 dark:text-slate-400"><span>{formatTimeAgo(notification.createdAt)}</span>{hasDestination && <span aria-hidden="true">·</span>}{hasDestination && <span>{notification.postId ? 'View discussion' : 'View listing'}</span>}</div>
                    </div>
                    {!notification.isRead && <button onClick={() => void markRead(notification)} disabled={pendingId === notification.id} title="Mark as read" aria-label="Mark notification as read" className="self-start shrink-0 p-1 rounded-full text-sky-600 hover:bg-sky-100 dark:text-sky-400 dark:hover:bg-slate-700 disabled:opacity-50"><Check className="w-4 h-4" /></button>}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 dark:text-slate-500 shrink-0">Showing your latest 30 notifications</div>
      </section>
    </>
  );
};

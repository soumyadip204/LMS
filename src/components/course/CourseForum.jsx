import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../../context/AuthContext';
import API from '../../utils/api';
import { FiMessageSquare, FiSend, FiUser, FiClock } from 'react-icons/fi';
import { toast } from 'react-toastify';

const CourseForum = ({ courseId }) => {
  const { user } = useAuth();
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newThreadTitle, setNewThreadTitle] = useState('');
  const [newThreadContent, setNewThreadContent] = useState('');
  const [showNewThreadForm, setShowNewThreadForm] = useState(false);
  const [activeThread, setActiveThread] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const socketRef = useRef(null);

  useEffect(() => {
    fetchThreads();

    // Initialize socket
    socketRef.current = io('http://localhost:5000', {
      withCredentials: true
    });

    socketRef.current.on('connect', () => {
      console.log('Connected to socket server');
      socketRef.current.emit('joinCourseForum', courseId);
    });

    socketRef.current.on('receiveReply', (data) => {
      const { threadId, reply } = data;
      setThreads(prevThreads => 
        prevThreads.map(thread => {
          if (thread._id === threadId) {
            return { ...thread, replies: [...thread.replies, reply] };
          }
          return thread;
        })
      );
      
      // Update active thread if it's currently open
      setActiveThread(prevActive => {
        if (prevActive && prevActive._id === threadId) {
          return { ...prevActive, replies: [...prevActive.replies, reply] };
        }
        return prevActive;
      });
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [courseId]);

  const fetchThreads = async () => {
    try {
      setLoading(true);
      const { data } = await API.get(`/forums/${courseId}`);
      setThreads(data);
    } catch (error) {
      console.error('Error fetching threads:', error);
      toast.error('Failed to load forum threads');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateThread = async (e) => {
    e.preventDefault();
    if (!newThreadTitle.trim() || !newThreadContent.trim()) {
      return toast.warning('Please fill in both title and content');
    }

    try {
      const { data } = await API.post(`/forums/${courseId}`, {
        title: newThreadTitle,
        content: newThreadContent
      });
      setThreads([data, ...threads]);
      setNewThreadTitle('');
      setNewThreadContent('');
      setShowNewThreadForm(false);
      toast.success('Question posted successfully');
    } catch (error) {
      console.error('Error creating thread:', error);
      toast.error('Failed to post question');
    }
  };

  const handleSendReply = (e) => {
    e.preventDefault();
    if (!replyContent.trim() || !activeThread) return;

    // Emit via socket
    socketRef.current.emit('newReply', {
      threadId: activeThread._id,
      courseId,
      user,
      content: replyContent
    });

    setReplyContent('');
  };

  const formatDate = (dateString) => {
    const options = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return <div className="text-center p-5 text-muted">Loading forum...</div>;
  }

  return (
    <div className="course-forum" style={{ background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-lg)', padding: '24px', border: '1px solid var(--border-color-hover)' }}>
      
      {!activeThread ? (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiMessageSquare /> Q&A Forum
            </h3>
            <button 
              className="btn btn-primary btn-sm" 
              onClick={() => setShowNewThreadForm(!showNewThreadForm)}
            >
              {showNewThreadForm ? 'Cancel' : 'Ask a Question'}
            </button>
          </div>

          {showNewThreadForm && (
            <form onSubmit={handleCreateThread} style={{ marginBottom: '32px', padding: '20px', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <div style={{ marginBottom: '16px' }}>
                <input 
                  type="text" 
                  placeholder="Question Title" 
                  value={newThreadTitle}
                  onChange={(e) => setNewThreadTitle(e.target.value)}
                  style={{ width: '100%', padding: '12px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'white' }}
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <textarea 
                  placeholder="Describe your question in detail..." 
                  value={newThreadContent}
                  onChange={(e) => setNewThreadContent(e.target.value)}
                  rows="4"
                  style={{ width: '100%', padding: '12px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'white' }}
                />
              </div>
              <button type="submit" className="btn btn-primary">Post Question</button>
            </form>
          )}

          <div className="threads-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {threads.length === 0 ? (
              <p className="text-muted text-center p-4">No questions asked yet. Be the first to start a discussion!</p>
            ) : (
              threads.map(thread => (
                <div 
                  key={thread._id} 
                  onClick={() => setActiveThread(thread)}
                  style={{ padding: '20px', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', cursor: 'pointer', transition: 'all 0.2s ease' }}
                  onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--accent-primary)'}
                  onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
                >
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '1.1rem' }}>{thread.title}</h4>
                  <div style={{ display: 'flex', gap: '20px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><FiUser /> {thread.user?.name || 'Unknown'}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><FiClock /> {formatDate(thread.createdAt)}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-secondary)' }}><FiMessageSquare /> {thread.replies?.length || 0} replies</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      ) : (
        <div className="thread-view">
          <button 
            className="btn btn-secondary btn-sm mb-4" 
            onClick={() => setActiveThread(null)}
          >
            ← Back to Forum
          </button>
          
          <div style={{ padding: '24px', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginBottom: '24px' }}>
            <h3 style={{ margin: '0 0 16px 0' }}>{activeThread.title}</h3>
            <div style={{ display: 'flex', gap: '16px', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid var(--border-color)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '24px', height: '24px', background: 'var(--accent-gradient)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
                  {activeThread.user?.name?.[0] || 'U'}
                </div>
                <strong style={{ color: 'var(--text-primary)' }}>{activeThread.user?.name || 'Unknown'}</strong>
                {activeThread.user?.role === 'instructor' && <span className="badge badge-primary ml-2">Instructor</span>}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><FiClock /> {formatDate(activeThread.createdAt)}</span>
            </div>
            <p style={{ lineHeight: 1.6, color: 'var(--text-secondary)' }}>{activeThread.content}</p>
          </div>

          <h4 style={{ marginBottom: '16px' }}>Replies ({activeThread.replies?.length || 0})</h4>
          
          <div className="replies-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px', maxHeight: '400px', overflowY: 'auto', paddingRight: '8px' }}>
            {activeThread.replies?.map((reply, idx) => (
              <div key={idx} style={{ padding: '16px', background: reply.user?.role === 'instructor' ? 'rgba(108, 43, 217, 0.1)' : 'var(--bg-primary)', borderRadius: 'var(--radius-md)', border: reply.user?.role === 'instructor' ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '24px', height: '24px', background: reply.user?.role === 'instructor' ? 'var(--accent-primary)' : 'var(--bg-tertiary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '0.8rem' }}>
                      {reply.user?.name?.[0] || 'U'}
                    </div>
                    <strong style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>{reply.user?.name || 'Unknown'}</strong>
                    {reply.user?.role === 'instructor' && <span className="badge badge-primary" style={{ fontSize: '0.65rem', padding: '2px 8px' }}>Instructor</span>}
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{formatDate(reply.createdAt)}</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{reply.content}</p>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendReply} style={{ display: 'flex', gap: '12px' }}>
            <input 
              type="text" 
              placeholder="Type your reply..." 
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              style={{ flex: 1, padding: '12px 16px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-full)', color: 'white' }}
            />
            <button type="submit" className="btn btn-primary" style={{ borderRadius: 'var(--radius-full)', width: '48px', height: '48px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FiSend size={20} style={{ marginLeft: '-2px' }} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default CourseForum;

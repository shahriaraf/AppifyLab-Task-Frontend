import React, { useState, useCallback, memo, useMemo } from 'react';
import axios from 'axios';
import { formatTimeAgo } from '../utils/dateUtils';
// import ReactionPicker from './ReactionPicker';  <-- REMOVE THIS
// import { getReactionLabel } from './ReactionConstants'; <-- REMOVE THIS
import LikersModal from './LikersModal';
import CommentReactions from './CommentReactions';
import ReplyInput from './ReplyInput';
import CommentReactionAction from './CommentReactionAction'; // <-- IMPORT NEW COMPONENT

const CommentItem = ({ comment, postId, onReplySubmit, onChildReplyAdd }) => {
  
  // --- STATE ---
  const [reaction, setReaction] = useState(comment.userReaction || null);
  const [likesCount, setLikesCount] = useState(comment.likesCount || 0);
  const [topReactions, setTopReactions] = useState(comment.topReactions || []);

  const [replies, setReplies] = useState([]);
  const [replyCount, setReplyCount] = useState(comment.replyCount || 0);
  const [showReplies, setShowReplies] = useState(false);
  const [areRepliesLoaded, setAreRepliesLoaded] = useState(false);
  const [isLoadingReplies, setIsLoadingReplies] = useState(false);

  const [showReplyInput, setShowReplyInput] = useState(false);
  // const [showPicker, setShowPicker] = useState(false); <-- REMOVED (Handled in child)
  const [likersModalData, setLikersModalData] = useState(null);

  // const hoverTimerRef = useRef(null); <-- REMOVED (Handled in child)
  
  const { token, user } = useMemo(() => ({
      token: localStorage.getItem('token'),
      user: JSON.parse(localStorage.getItem('user'))
  }), []);

  const API_URL = 'http://localhost:5000';
  const isReply = !!comment.parentComment;

  // --- HANDLERS ---

  const toggleReplies = useCallback(async () => {
    if (showReplies) {
        setShowReplies(false);
        return;
    }
    setShowReplies(true);
    
    if (!areRepliesLoaded && replyCount > 0) {
      setIsLoadingReplies(true);
      try {
        const res = await axios.get(`${API_URL}/comments/${comment._id}/replies`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setReplies(res.data);
        setAreRepliesLoaded(true);
      } catch (err) {
        console.error("Error fetching replies", err);
      } finally {
        setIsLoadingReplies(false);
      }
    }
  }, [showReplies, areRepliesLoaded, replyCount, comment._id, token]);

  const handleLocalReplySubmit = useCallback(async (text) => {
    try {
      const newReply = await onReplySubmit(text, comment._id);
      setShowReplyInput(false);

      if (!isReply) {
        setReplies(prev => [...prev, newReply]);
        setReplyCount(prev => prev + 1);
        setShowReplies(true);
        setAreRepliesLoaded(true);
      } else {
        if (onChildReplyAdd) onChildReplyAdd(newReply);
      }
    } catch (err) {
      console.error("Reply failed", err);
    }
  }, [onReplySubmit, comment._id, isReply, onChildReplyAdd]);

  const handleChildNewReply = useCallback((newReplyObj) => {
    setReplies(prev => [...prev, newReplyObj]);
    setReplyCount(prev => prev + 1);
  }, []);

  // --- REACTION LOGIC (Only Data Handling now) ---
  // This function is passed to the child component
  const handleReactionChange = useCallback(async (type) => {
    // Optimistic Update
    const isRemoving = reaction === type;
    const newReaction = isRemoving ? null : type;
    
    setReaction(newReaction);
    setLikesCount(prev => isRemoving ? Math.max(0, prev - 1) : (reaction ? prev : prev + 1));
    
    setTopReactions(prev => {
        let list = prev.filter(t => t !== (isRemoving ? type : reaction)); 
        if (!isRemoving) list = [type, ...list]; 
        return list.slice(0, 2);
    });

    try {
      await axios.put(
        `${API_URL}/api/react/Comment/${comment._id}`,
        { reactionType: type },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
       console.error(err);
    }
  }, [reaction, comment._id, token]);

  // Removed local handleMouseEnter/Leave

  const fetchLikers = useCallback(async (e) => {
    e.stopPropagation();
    if (likesCount === 0) return;
    try {
      const res = await axios.get(`${API_URL}/api/react/Comment/${comment._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLikersModalData(res.data);
    } catch (err) {
      console.error(err);
    }
  }, [likesCount, comment._id, token]);

  return (
    <div style={{ position: 'relative', marginBottom: '8px' }}>
      <div className="_comment_main" style={{ display: 'flex', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
        
        <img
          src={comment.userId.profilePic || '/assets/images/profile.png'}
          alt="Avatar"
          style={{
            width: isReply ? '24px' : '32px',
            height: isReply ? '24px' : '32px',
            borderRadius: '50%',
            marginRight: '8px',
            objectFit: 'cover',
            flexShrink: 0
          }}
        />

        <div className="_comment_bubble_wrapper" style={{ maxWidth: 'calc(100% - 50px)' }}>
          <div
            style={{
              background: '#f0f2f5',
              padding: '8px 12px',
              borderRadius: '18px',
              display: 'inline-block',
              position: 'relative',
            }}
          >
            <h4 style={{ fontSize: '13px', margin: 0, fontWeight: '600', color: '#050505' }}>
              {comment.userId.firstName} {comment.userId.lastName}
            </h4>
            <p style={{ margin: 0, fontSize: '14px', color: '#050505', lineHeight: '1.3', wordBreak: 'break-word' }}>
              {comment.content}
            </p>

            <CommentReactions 
                count={likesCount} 
                topReactions={topReactions} 
                myReaction={reaction} 
                onClick={fetchLikers} 
            />
          </div>

          {/* Action Links Row */}
          <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#65676b', fontWeight: 'bold', margin: '4px 0 0 12px' }}>
            
            {/* --- NEW OPTIMIZED BUTTON --- */}
            <CommentReactionAction 
                myReaction={reaction} 
                onReact={handleReactionChange} 
            />

            <span onClick={() => setShowReplyInput(true)} style={{ cursor: 'pointer' }}>Reply</span>
            <span style={{ fontWeight: 'normal' }}>{formatTimeAgo(comment.createdAt)}</span>
          </div>
        </div>
      </div>

      {showReplyInput && (
        <div style={{ paddingLeft: isReply ? '32px' : '40px' }}>
            <ReplyInput 
                userProfilePic={user?.profilePic}
                targetName={comment.userId.firstName}
                onSubmit={handleLocalReplySubmit}
                onCancel={() => setShowReplyInput(false)}
            />
        </div>
      )}

      {!isReply && replyCount > 0 && (
        <div style={{ paddingLeft: '40px', marginTop: '5px' }}>
          <div
            onClick={toggleReplies}
            style={{ fontSize: '13px', fontWeight: '600', color: '#65676b', cursor: 'pointer', display: 'flex', alignItems: 'center', userSelect: 'none' }}
          >
            {showReplies ? (
               <>
                <i style={{ border: 'solid #65676b', borderWidth: '0 2px 2px 0', display: 'inline-block', padding: '3px', transform: 'rotate(-135deg)', marginRight: '5px' }}></i>
                Hide replies
               </>
            ) : (
               <>
                <i style={{ border: 'solid #65676b', borderWidth: '0 2px 2px 0', display: 'inline-block', padding: '3px', transform: 'rotate(45deg)', marginRight: '5px', marginBottom: '2px' }}></i>
                View {replyCount} replies
               </>
            )}
            {isLoadingReplies && <span style={{ marginLeft: '5px', fontSize: '10px', fontWeight: 'normal' }}>Loading...</span>}
          </div>

          {showReplies && (
            <div style={{ marginTop: '8px' }}>
              {replies.map((r) => (
                <CommentItem 
                    key={r._id} 
                    comment={r} 
                    postId={postId} 
                    onReplySubmit={onReplySubmit} 
                    onChildReplyAdd={handleChildNewReply} 
                />
              ))}
            </div>
          )}
        </div>
      )}

      {likersModalData && (
          <LikersModal 
            likes={likersModalData} 
            onClose={() => setLikersModalData(null)} 
          />
      )}
    </div>
  );
};

export default memo(CommentItem);
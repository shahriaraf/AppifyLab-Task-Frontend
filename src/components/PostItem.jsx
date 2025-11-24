import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
import axios from "axios";
import CommentItem from "./CommentItem";
import LikersModal from "./LikersModal";
import PostReactionAction from "./PostReactionAction";
import PostCommentInput from "./PostCommentInput";
import { formatTimeAgo } from "../utils/dateUtils";

const PostItem = ({ post }) => {
  // --- Global / Auth ---
  const API_URL = "http://localhost:5000";
  const { token, user } = useMemo(() => ({
      token: localStorage.getItem("token"),
      user: JSON.parse(localStorage.getItem("user"))
  }), []);

  // --- State ---
  // Safety Check: Ensure counts default to 0 if undefined
  const [myReaction, setMyReaction] = useState(post.userReaction || null);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [recentReactors, setRecentReactors] = useState(post.recentReactors || []);
  
  const [comments, setComments] = useState([]);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount || 0);
  const [showComments, setShowComments] = useState(false);
  const [areCommentsLoaded, setAreCommentsLoaded] = useState(false);
  
  const [showLikersModal, setShowLikersModal] = useState(false);
  const [likersData, setLikersData] = useState([]);

  // --- Sync State ---
  useEffect(() => {
    setMyReaction(post.userReaction || null);
    setLikesCount(post.likesCount || 0);
    setRecentReactors(post.recentReactors || []);
    console.log(recentReactors)
    setCommentsCount(post.commentsCount || 0);
  }, [post]);

  // --- Handlers ---

  const handleReaction = useCallback(async (type) => {
    const isRemoving = myReaction === type;
    const newReaction = isRemoving ? null : type;
    
    setMyReaction(newReaction);
    
    // Optimistic Count Update
    setLikesCount(prev => {
        if (isRemoving) return Math.max(0, prev - 1);
        // If switching reaction (e.g. Like -> Love), count stays same. 
        // If adding new reaction (Null -> Like), count + 1.
        return myReaction ? prev : prev + 1;
    });

    // Optimistic Stack Update
    if (!isRemoving && !myReaction) {
        const me = { _id: user._id, profilePic: user.profilePic };
        setRecentReactors(prev => [me, ...prev].slice(0, 3));
    } else if (isRemoving) {
        setRecentReactors(prev => prev.filter(u => u._id !== user._id));
    }

    try {
      await axios.put(
        `${API_URL}/api/react/Post/${post._id}`,
        { reactionType: type },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error("Reaction failed", err);
    }
  }, [myReaction, post._id, token, user]);



  const toggleComments = useCallback(async () => {
    const newState = !showComments;
    setShowComments(newState);

    if (newState && !areCommentsLoaded) {
      try {
        const res = await axios.get(`${API_URL}/posts/${post._id}/comments`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setComments(res.data);
        setAreCommentsLoaded(true);
      } catch (err) {
        console.error(err);
      }
    }
  }, [showComments, areCommentsLoaded, post._id, token]);

  const handleCommentSubmit = useCallback(async (text) => {
    try {
      const res = await axios.post(
        `${API_URL}/posts/${post._id}/comments`,
        { content: text, parentId: null },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComments(prev => [res.data, ...prev]);
      setCommentsCount(prev => prev + 1);
    } catch (err) {
      console.error("Comment failed", err);
    }
  }, [post._id, token]);

  const fetchLikers = useCallback(async () => {
    if (likesCount === 0) return;
    try {
      const res = await axios.get(`${API_URL}/api/react/Post/${post._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLikersData(res.data);
      setShowLikersModal(true);
    } catch (err) {
      console.error(err);
    }
  }, [likesCount, post._id, token]);

  // --- Render Helpers ---
  const renderAvatarStack = () => (
    <div
      style={{ display: "flex", flexDirection: "row-reverse", alignItems: "center", cursor: "pointer" }}
      onClick={fetchLikers}
    >
      {recentReactors.map((u, i) => (
        <img
          key={u._id || i}
          src={u.profilePic || "/assets/images/profile.png"}
          alt=""
          style={{
            width: "18px", height: "18px", borderRadius: "50%",
            border: "2px solid white", marginRight: i === 0 ? 0 : "-6px",
            objectFit: "cover",
            position: 'relative', zIndex: 10 - i // Ensure visual stacking order
          }}
        />
      ))}
    </div>
  );

  return (
    <div className="_feed_inner_timeline_post_area _b_radious6 _padd_b24 _padd_t24 _mar_b16" 
         style={{ overflow: "visible", position: "relative", marginBottom: "20px", background: '#fff', fontFamily: 'poppins, sans-serif' }}>
      
      {/* --- Header --- */}
      <div className="_feed_inner_timeline_content _padd_r24 _padd_l24">
        <div className="_feed_inner_timeline_post_top">
          <div className="_feed_inner_timeline_post_box">
            <div className="_feed_inner_timeline_post_box_image">
              <img src={post.userId.profilePic || "/assets/images/profile.png"} alt="" className="_post_img" />
            </div>
            <div className="_feed_inner_timeline_post_box_txt">
              <h4 className="_feed_inner_timeline_post_box_title">
                {post.userId.firstName} {post.userId.lastName}
              </h4>
              <p className="_feed_inner_timeline_post_box_para">
                {formatTimeAgo(post.createdAt)} • <span style={{ textTransform: "capitalize" }}>{post.privacy || 'Public'}</span>
              </p>
            </div>
          </div>
          <div className="_feed_inner_timeline_post_box_dropdown">
            <button className="_feed_timeline_post_dropdown_link">...</button>
          </div>
        </div>

        {/* --- Content --- */}
        <h4 className="_feed_inner_timeline_post_title" style={{ fontWeight: "400", fontSize: "16px", margin: "15px 0" }}>
          {post.content}
        </h4>
        {post.image && (
          <div className="_feed_inner_timeline_image">
            <img src={post.image} alt="" className="_time_img" loading="lazy" />
          </div>
        )}
      </div>

      {/* --- FIX: Unified Stats Bar --- */}
      {(likesCount > 0 || commentsCount > 0) && (
        <div 
            className="_feed_inner_timeline_total_reacts _padd_r24 _padd_l24 _mar_b26"
            style={{ 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "space-between", // Pushes Likes left, Comments right
                minHeight: "30px",
                marginTop: "15px" 
            }}
        >
            {/* LEFT SIDE: Likes */}
            <div style={{ display: "flex", alignItems: "center" }}>
                {likesCount > 0 && (
                    <>
                        {renderAvatarStack()}
                        <div 
                            onClick={fetchLikers}
                            style={{ 
                                marginLeft: recentReactors.length > 0 ? "8px" : "0", 
                                background: '#1890ff', 
                                color: '#fff',
                                borderRadius: '50%',
                                width: '20px', height: '20px',
                                fontSize: '11px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer'
                            }}
                        >
                            {likesCount}
                        </div>
                    </>
                )}
            </div>

            {/* RIGHT SIDE: Comments */}
            {commentsCount > 0 && (
                <div 
                    onClick={toggleComments} 
                    style={{ 
                        fontSize: "14px", 
                        color: "#65676b", 
                        cursor: "pointer",
                        fontWeight: '400'
                    }}
                >
                    {commentsCount} Comments
                </div>
            )}
        </div>
      )}

      {/* --- Action Buttons --- */}
      <div className="_feed_inner_timeline_reaction"
           style={{
            position: "relative", borderTop: "1px solid #e5e5e5",
            borderBottom: "1px solid #e5e5e5", padding: "5px 0", display: "flex",
           }}>
        
        <PostReactionAction myReaction={myReaction} onReact={handleReaction} />

        <button 
            className="_feed_inner_timeline_reaction_comment _feed_reaction" 
            onClick={toggleComments} 
            style={{ flex: 1, border:'none', background:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'5px' }}
        >
             <svg className="_reaction_svg" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 21 21">
               <path stroke="#65676b" d="M1 10.5c0-.464 0-.696.009-.893A9 9 0 019.607 1.01C9.804 1 10.036 1 10.5 1v0c.464 0 .696 0 .893.009a9 9 0 018.598 8.598c.009.197.009.429.009.893v6.046c0 1.36 0 2.041-.317 2.535a2 2 0 01-.602.602c-.494.317-1.174.317-2.535.317H10.5c-.464 0-.696 0-.893-.009a9 9 0 01-8.598-8.598C1 11.196 1 10.964 1 10.5v0z"/>
               <path stroke="#65676b" strokeLinecap="round" strokeLinejoin="round" d="M6.938 9.313h7.125M10.5 14.063h3.563"/>
             </svg> 
             <span style={{color:'#65676b', fontWeight:'600', fontSize:'14px'}}>Comment</span>
        </button>

        <button className="_feed_inner_timeline_reaction_share _feed_reaction" style={{ flex: 1, border:'none', background:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'5px' }}>
            <svg className="_reaction_svg" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 21">
              <path stroke="#65676b" strokeLinejoin="round" d="M23 10.5L12.917 1v5.429C3.267 6.429 1 13.258 1 20c2.785-3.52 5.248-5.429 11.917-5.429V20L23 10.5z"/>
            </svg> 
            <span style={{color:'#65676b', fontWeight:'600', fontSize:'14px'}}>Share</span>
        </button>
      </div>

      {/* --- Comments Section --- */}
      {showComments && (
        <div className="_timline_comment_main" style={{ display: "block", padding: "15px 24px" }}>
          <PostCommentInput 
             userProfilePic={user?.profilePic} 
             onSubmit={handleCommentSubmit} 
          />
          {comments.filter(c => !c.parentId).map((c) => (
            <CommentItem 
                key={c._id} 
                comment={c} 
                postId={post._id} 
                onReplySubmit={async (txt, pid) => {
                    const res = await axios.post(
                        `${API_URL}/posts/${post._id}/comments`,
                        { content: txt, parentId: pid },
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                    return res.data; 
                }} 
            />
          ))}
        </div>
      )}

      {showLikersModal && (
          <LikersModal likes={likersData} onClose={() => setShowLikersModal(false)} />
      )}
    </div>
  );
};

export default memo(PostItem);
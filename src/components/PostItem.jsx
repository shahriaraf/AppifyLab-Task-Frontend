import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import CommentItem from "./CommentItem";
import ReactionPicker from "./ReactionPicker";
import LikersModal from "./LikersModal";
import { formatTimeAgo } from "../utils/dateUtils";
import { REACTION_ICONS, getReactionLabel } from "./ReactionConstants";

const LONG_PRESS_DURATION = 500; // Long press duration for mobile

const PostItem = ({ post }) => {
  // --- State ---
  const [myReaction, setMyReaction] = useState(post.userReaction || null);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [stack, setStack] = useState(post.recentReactors || []);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [totalComments, setTotalComments] = useState(post.commentsCount);
  const [showPicker, setShowPicker] = useState(false);
  const [showLikersModal, setShowLikersModal] = useState(false);
  const [likersData, setLikersData] = useState([]);

  // --- Refs ---
  const openTimerRef = useRef(null);
  const closeTimerRef = useRef(null);
  const longPressTimerRef = useRef(null);

  // --- Env & Auth ---
  const API_URL = "https://appify-lab-task-backend.vercel.app";
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  // --- Sync post state ---
  useEffect(() => {
    setMyReaction(post.userReaction || null);
    setLikesCount(post.likesCount);
    setStack(post.recentReactors || []);
  }, [post]);

  // --- Reaction Handler ---
  const handleReaction = async (type) => {
    setShowPicker(false);
    if (openTimerRef.current) clearTimeout(openTimerRef.current);

    if (myReaction === type) {
      setMyReaction(null);
      setLikesCount((prev) => prev - 1);
      setStack((prev) => prev.filter((u) => u._id !== user._id));
    } else {
      if (!myReaction) {
        setLikesCount((prev) => prev + 1);
        const me = {
          _id: user._id,
          profilePic: user.profilePic,
          firstName: user.firstName,
        };
        setStack((prev) => [me, ...prev].slice(0, 3));
      }
      setMyReaction(type);
    }

    try {
      await axios.put(
        `${API_URL}/api/react/Post/${post._id}`,
        { reactionType: type },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error(err);
    }
  };

  // --- Fetch Likers ---
  const fetchLikers = async () => {
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
  };

  // --- Toggle Comments ---
  const toggleComments = async () => {
    if (!showComments) {
      try {
        const res = await axios.get(`${API_URL}/posts/${post._id}/comments`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setComments(res.data);
      } catch (err) {
        console.error(err);
      }
    }
    setShowComments(!showComments);
  };

  // --- Submit Comment ---
  const handleCommentSubmit = async (text, parentId = null) => {
    try {
      const res = await axios.post(
        `${API_URL}/posts/${post._id}/comments`,
        { content: text, parentId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!parentId) {
        setComments([res.data, ...comments]);
        setTotalComments((prev) => prev + 1);
        setCommentText("");
      }
      return res.data;
    } catch (err) {
      console.error(err);
    }
  };

const renderAvatarStack = () => (
  <div
    style={{ display: "flex", alignItems: "center", cursor: "pointer", flexDirection: "row-reverse" }}
    onClick={fetchLikers}
  >
    {stack.map((u, i) => (
      <img
        key={u._id || i}
        src={u.profilePic || "/assets/images/profile.png"}
        alt=""
        style={{
          width: "24px",
          height: "24px",
          borderRadius: "50%",
          border: "2px solid white",
          marginRight: i === 0 ? 0 : "-12px", // use marginRight for overlap
          objectFit: "cover",
        }}
      />
    ))}
  </div>
);

  const rootComments = comments.filter((c) => !c.parentId);
  const getReplies = (cid) => comments.filter((c) => c.parentId === cid);
  const reactionStyle = myReaction ? getReactionLabel(myReaction) : null;

  return (
    <div
      className="_feed_inner_timeline_post_area _b_radious6 _padd_b24 _padd_t24 _mar_b16"
      style={{ overflow: "visible", position: "relative", marginBottom: "30px" }}
    >
      {/* Post Content */}
      <div className="_feed_inner_timeline_content _padd_r24 _padd_l24">
        <div className="_feed_inner_timeline_post_top">
          <div className="_feed_inner_timeline_post_box">
            <div className="_feed_inner_timeline_post_box_image">
              <img
                src={post.userId.profilePic || "/assets/images/profile.png"}
                alt=""
                className="_post_img"
              />
            </div>
            <div className="_feed_inner_timeline_post_box_txt">
              <h4 className="_feed_inner_timeline_post_box_title">
                {post.userId.firstName} {post.userId.lastName}
              </h4>
              <p className="_feed_inner_timeline_post_box_para">
                {formatTimeAgo(post.createdAt)} .{" "}
                <span style={{ textTransform: "capitalize" }}>
                  {post.privacy}
                </span>
              </p>
            </div>
          </div>
          <div className="_feed_inner_timeline_post_box_dropdown">
            <button className="_feed_timeline_post_dropdown_link">...</button>
          </div>
        </div>

        <h4
          className="_feed_inner_timeline_post_title"
          style={{ fontWeight: "400", fontSize: "16px", margin: "15px 0" }}
        >
          {post.content}
        </h4>
        {post.image && (
          <div className="_feed_inner_timeline_image">
            <img src={post.image} alt="" className="_time_img" />
          </div>
        )}
      </div>

      {/* Status Bar */}
      {likesCount > 0 && (
        <div
          className="_feed_inner_timeline_total_reacts _padd_r24 _padd_l24 _mar_b26"
          style={{ minHeight: "30px", display: "flex", alignItems: "center" }}
        >
          {renderAvatarStack()}
          <p
            style={{ marginLeft:"-10px", color: "white", fontSize: "14px", borderRadius: "100%",   backgroundColor:"#1890ff", cursor: "pointer", width: "24px", textAlign: "center",
            height: "24px", }}
            onClick={fetchLikers}
          >
            {likesCount}
          </p>
          <div style={{ marginLeft: "auto" }}>
            <span onClick={toggleComments} style={{ cursor: "pointer" }}>
              {totalComments} Comments
            </span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div
        className="_feed_inner_timeline_reaction"
        style={{
          position: "relative",
          borderTop: "1px solid #e5e5e5",
          borderBottom: "1px solid #e5e5e5",
          padding: "5px 0",
          display: "flex",
        }}
      >
        {/* Like Button Wrapper */}
        <div
          className="_feed_reaction_wrapper"
          style={{ flex: 1, position: "relative" }}
          onMouseEnter={() => {
            if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
            if (!showPicker) {
              openTimerRef.current = setTimeout(() => setShowPicker(true), 500);
            }
          }}
          onMouseLeave={() => {
            if (openTimerRef.current) clearTimeout(openTimerRef.current);
            closeTimerRef.current = setTimeout(() => setShowPicker(false), 200);
          }}
          onTouchStart={() => {
            longPressTimerRef.current = setTimeout(() => setShowPicker(true), LONG_PRESS_DURATION);
          }}
          onTouchEnd={() => {
            if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
            if (!showPicker) handleReaction(myReaction || "Like");
          }}
        >
          {showPicker && (
            <div
              style={{
                position: "absolute",
                bottom: "15px",
                left: "10%",
                transform: "translateX(-50%)",
                display: "flex",
                justifyContent: "center",
                zIndex: 999,
              }}
            >
              <ReactionPicker onSelect={handleReaction} onClose={() => setShowPicker(false)} />
            </div>
          )}

          <button
            style={{
              background: "none",
              border: "none",
              color: reactionStyle ? reactionStyle.color : "#000000e2",
              fontWeight: "400",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              width: "100%",
              justifyContent: "center",
              padding: "10px",
              cursor: "pointer",
            }}
            onClick={() => {
              if (!showPicker) handleReaction(myReaction || "Like");
            }}
          >
            {myReaction ? (
              <>
                <div style={{ transform: "scale(1.5)", display: "flex", alignItems: "center" }}>
                  {REACTION_ICONS[myReaction]}
                </div>
                <span>{reactionStyle.label}</span>
              </>
            ) : (
              <>
                <svg
                  className="_reaction_svg"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke="#000"
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"
                  />
                </svg>
                <span>Like</span>
              </>
            )}
          </button>
        </div>

        {/* Comment Button */}
        <button className="_feed_inner_timeline_reaction_comment _feed_reaction" onClick={toggleComments} style={{ flex: 1 }}>
          <span className="_feed_inner_timeline_reaction_link">
            <svg
              className="_reaction_svg"
              xmlns="http://www.w3.org/2000/svg"
              width="21"
              height="21"
              fill="none"
              viewBox="0 0 21 21"
            >
              <path
                stroke="#000"
                d="M1 10.5c0-.464 0-.696.009-.893A9 9 0 019.607 1.01C9.804 1 10.036 1 10.5 1v0c.464 0 .696 0 .893.009a9 9 0 018.598 8.598c.009.197.009.429.009.893v6.046c0 1.36 0 2.041-.317 2.535a2 2 0 01-.602.602c-.494.317-1.174.317-2.535.317H10.5c-.464 0-.696 0-.893-.009a9 9 0 01-8.598-8.598C1 11.196 1 10.964 1 10.5v0z"
              />
              <path stroke="#000" strokeLinecap="round" strokeLinejoin="round" d="M6.938 9.313h7.125M10.5 14.063h3.563" />
            </svg>{" "}
            Comment
          </span>
        </button>

        {/* Share Button */}
        <button className="_feed_inner_timeline_reaction_share _feed_reaction" style={{ flex: 1 }}>
          <span className="_feed_inner_timeline_reaction_link">
            <svg
              className="_reaction_svg"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="21"
              fill="none"
              viewBox="0 0 24 21"
            >
              <path stroke="#000" strokeLinejoin="round" d="M23 10.5L12.917 1v5.429C3.267 6.429 1 13.258 1 20c2.785-3.52 5.248-5.429 11.917-5.429V20L23 10.5z" />
            </svg>{" "}
            Share
          </span>
        </button>
      </div>

      {/* Comments */}
      {showComments && (
        <div className="_timline_comment_main" style={{ display: "block", padding: "15px 24px" }}>
          <div className="_feed_inner_comment_box" style={{ marginBottom: "20px", display: "flex", alignItems: "center" }}>
            <img
              src={user?.profilePic || "/assets/images/profile.png"}
              alt="Me"
              className="_comment_img"
              style={{ width: "24px", height: "24px", borderRadius: "100%", marginRight: "10px" }}
            />
            <div className="_feed_inner_comment_box_content_txt" style={{ flex: 1, background: "#f6f6f6", borderRadius: "20px" }}>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleCommentSubmit(commentText);
                }}
              >
                <input
                  className="form-control _comment_textarea"
                  style={{ border: "none", background: "transparent", height: "36px" }}
                  placeholder="Write a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                />
              </form>
            </div>
          </div>
          {rootComments.map((c) => (
            <CommentItem key={c._id} comment={c} postId={post._id} replies={getReplies(c._id)} onReplySubmit={handleCommentSubmit} />
          ))}
        </div>
      )}

      {/* Likers Modal */}
      {showLikersModal && <LikersModal likes={likersData} onClose={() => setShowLikersModal(false)} />}
    </div>
  );
};

export default PostItem;

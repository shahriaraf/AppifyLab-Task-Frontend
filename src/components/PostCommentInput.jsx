import React, { useState, memo } from "react";

const PostCommentInput = ({ userProfilePic, onSubmit }) => {
  const [text, setText] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSubmit(text);
    setText("");
  };

  return (
    <div className="_feed_inner_comment_box" style={{ marginBottom: "20px", display: "flex", alignItems: "center" }}>
      <img
        src={userProfilePic || "/assets/images/profile.png"}
        alt=""
        className="_comment_img"
        style={{ width: "24px", height: "24px", borderRadius: "100%", marginRight: "10px", objectFit: "cover" }}
      />
      <div className="_feed_inner_comment_box_content_txt" style={{ flex: 1, background: "#f6f6f6", borderRadius: "20px" }}>
        <form onSubmit={handleSubmit}>
          <input
            className="form-control _comment_textarea"
            style={{ 
                border: "none", background: "transparent", height: "36px", 
                width: '100%', outline: 'none' // Added outline none
            }}
            placeholder="Write a comment..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </form>
      </div>
    </div>
  );
};

export default memo(PostCommentInput);
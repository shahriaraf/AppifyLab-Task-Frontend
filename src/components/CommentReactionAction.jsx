import React, { useState, memo } from "react";
import ReactionPicker from "./ReactionPicker";
import { getReactionLabel } from "./ReactionConstants";

const CommentReactionAction = ({ myReaction, onReact }) => {
  const [showPicker, setShowPicker] = useState(false);
  
  const reactionStyle = myReaction 
    ? getReactionLabel(myReaction) 
    : { label: 'Like', color: '#65676b' };

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      
      {/* POPUP */}
      {showPicker && (
        <div
          style={{
            position: "absolute",
            bottom: "25px",
            left: "-10px",
            zIndex: 100,
            animation: "fadeIn 0.2s ease-out"
          }}
        >
          <ReactionPicker 
            onSelect={(type) => { onReact(type); setShowPicker(false); }} 
            onClose={() => setShowPicker(false)} 
            isComment={true} 
          />
        </div>
      )}

      {/* BUTTON */}
      <span
        onClick={(e) => {
            e.stopPropagation();
            setShowPicker(!showPicker);
        }}
        style={{ 
          fontWeight: "bold", 
          color: reactionStyle.color,
          fontSize: "12px",
          cursor: "pointer",
          userSelect: "none"
        }}
      >
        {reactionStyle.label}
      </span>
    </div>
  );
};

export default memo(CommentReactionAction);
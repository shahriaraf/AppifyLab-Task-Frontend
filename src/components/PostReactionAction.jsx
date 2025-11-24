import React, { useState, useRef, memo } from "react";
import ReactionPicker from "./ReactionPicker";
import { REACTION_ICONS, getReactionLabel } from "./ReactionConstants";

const LONG_PRESS_DURATION = 500;

const PostReactionAction = ({ myReaction, onReact }) => {
  const [showPicker, setShowPicker] = useState(false);
  const openTimerRef = useRef(null);
  const closeTimerRef = useRef(null);
  const longPressTimerRef = useRef(null);

  // Derived style
  const reactionStyle = myReaction ? getReactionLabel(myReaction) : null;

  // Handlers
  const handleMouseEnter = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    if (!showPicker) {
      openTimerRef.current = setTimeout(() => setShowPicker(true), 500);
    }
  };

  const handleMouseLeave = () => {
    if (openTimerRef.current) clearTimeout(openTimerRef.current);
    closeTimerRef.current = setTimeout(() => setShowPicker(false), 300);
  };

  const handleTouchStart = () => {
    longPressTimerRef.current = setTimeout(() => setShowPicker(true), LONG_PRESS_DURATION);
  };

  const handleTouchEnd = () => {
    if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
    if (!showPicker) onReact(myReaction || "Like");
  };

  const handleSelect = (type) => {
    setShowPicker(false);
    onReact(type);
  };

  return (
    <div
      className="_feed_reaction_wrapper"
      style={{ flex: 1, position: "relative" }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {showPicker && (
        <div
          style={{
            position: "absolute", bottom: "40px", left: "10%",
            transform: "translateX(-50%)", zIndex: 100,
          }}
          // Stop propagation so clicking picker doesn't trigger post click
          onClick={(e) => e.stopPropagation()} 
        >
          <ReactionPicker onSelect={handleSelect} onClose={() => setShowPicker(false)} />
        </div>
      )}

      <button
        style={{
          background: "none", border: "none", cursor: "pointer",
          color: reactionStyle ? reactionStyle.color : "#65676b",
          fontWeight: "600", fontSize: "14px",
          display: "flex", alignItems: "center", justifyContent: "center",
          gap: "8px", width: "100%", padding: "10px",
        }}
        onClick={() => !showPicker && onReact(myReaction || "Like")}
      >
        {myReaction ? (
          <>
            <div style={{ transform: "scale(1.2)", display: "flex" }}>{REACTION_ICONS[myReaction]}</div>
            <span>{reactionStyle.label}</span>
          </>
        ) : (
          <>
            <svg className="_reaction_svg" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
               <path stroke="#000" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
            </svg>
            <span>Like</span>
          </>
        )}
      </button>
    </div>
  );
};

export default memo(PostReactionAction);
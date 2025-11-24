import React, { useState, memo } from "react";
import ReactionPicker from "./ReactionPicker";
import { REACTION_ICONS, getReactionLabel } from "./ReactionConstants";

const PostReactionAction = ({ myReaction, onReact }) => {
  const [showPicker, setShowPicker] = useState(false);

  // Get Style for the main button (Color/Label)
  const reactionStyle = myReaction 
    ? getReactionLabel(myReaction) 
    : { label: 'Like', color: '#65676b' };

  // Toggle the menu open/close
  const handleMainClick = (e) => {
    e.stopPropagation();
    setShowPicker((prev) => !prev);
  };

  // Handle selection from the menu
  const handlePickerSelect = (type) => {
    onReact(type); // Parent handles the toggle logic (add/remove)
    setShowPicker(false); // Close menu after selection
  };

  return (
    <div className="_feed_inner_timeline_reaction_like" style={{ flex: 1, position: "relative" }}>
      
      {/* --- POPUP MENU --- */}
      {showPicker && (
        <div
          style={{
            position: "absolute",
            bottom: "20%", // Sits above the button
            left: "10%",
            width: "100%", // Centers it relative to the button
            display: "flex",
            justifyContent: "center",
            zIndex: 100,
            marginBottom: "10px",
            animation: "fadeIn 0.2s ease-out"
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* We pass onClose so clicking outside or on 'X' can close it if your picker supports it */}
          <ReactionPicker onSelect={handlePickerSelect} onClose={() => setShowPicker(false)} />
        </div>
      )}

      {/* --- MAIN BUTTON --- */}
      <button
        onClick={handleMainClick}
        style={{
          background: "transparent", 
          border: "none", 
          cursor: "pointer",
          width: "100%", 
          padding: "10px 0",
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center", 
          gap: "8px",
          WebkitTapHighlightColor: "transparent"
        }}
      >
        {myReaction ? (
          // ACTIVE STATE (Blue/Red etc)
          <>
            <div style={{ fontSize: '20px', display: 'flex' }}>
                {REACTION_ICONS[myReaction]}
            </div>
            <span style={{ 
                color: reactionStyle.color, 
                fontWeight: "600", 
                fontSize: "14px" 
            }}>
              {reactionStyle.label}
            </span>
          </>
        ) : (
          // DEFAULT STATE (Gray)
          <>
            <svg className="_reaction_svg" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24">
              <path stroke="#65676b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
            </svg>
            <span style={{ color: "#65676b", fontWeight: "600", fontSize: "14px" }}>Like</span>
          </>
        )}
      </button>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default memo(PostReactionAction);
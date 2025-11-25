import React, { memo } from 'react';
import { REACTION_ICONS } from './ReactionConstants';

const CommentReactions = ({ topReactions, myReaction, count, onClick }) => {
  if (count === 0) return null;

  // Determine which icons to show
  let iconsToShow = [...topReactions];
  
  // If I reacted, ensure my reaction is visible in the stack logic
  if (myReaction && !iconsToShow.includes(myReaction)) {
    iconsToShow = [myReaction, ...iconsToShow];
  }
  
  // Fallback if empty
  if (iconsToShow.length === 0) iconsToShow = ['Like'];

  // Slice to max 2 icons
  const displayIcons = iconsToShow.slice(0, 2);
  const primary = displayIcons[0];
  const secondary = displayIcons[1];

  return (
    <div
      onClick={onClick}
      style={{
        position: 'absolute',
        right: '-30px',
        bottom: '-12px',
        background: '#fff',
        borderRadius: '10px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
        padding: '2px 4px',
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer',
        zIndex: 10,
        minWidth: '30px',
        height: '20px',
        userSelect: 'none'
      }}
    >
      {/* Icon Logic */}
      {displayIcons.length === 1 || !secondary ? (
        <div style={{ transform: 'scale(0.8)' }}>{REACTION_ICONS[primary]}</div>
      ) : (
        <div style={{ position: 'relative', width: '34px', height: '18px', display: 'flex', alignItems: 'center' }}>
          <div style={{ position: 'absolute', left: 5, zIndex: 1, transform: 'scale(0.8)' }}>
            {REACTION_ICONS[secondary]}
          </div>
          <div
            style={{
              position: 'absolute',
              left: '14px',
              zIndex: 2,
              border: '2px solid white',
              borderRadius: '50%',
              transform: 'scale(0.8)',
              background: 'white',
            }}
          >
            {REACTION_ICONS[primary]}
          </div>
        </div>
      )}
      
      <span style={{ marginLeft: '4px', fontSize: '12px', color: '#65676b', lineHeight: '20px' }}>
        {count}
      </span>
    </div>
  );
};


export default memo(CommentReactions);
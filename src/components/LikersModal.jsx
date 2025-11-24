import React, { memo } from 'react';
import { REACTION_ICONS } from './ReactionConstants';

const LikersModal = ({ likes, onClose }) => {
  
  // Prevent clicks inside modal from closing it
  const handleContentClick = (e) => e.stopPropagation();

  return (
    <div 
      onClick={onClose}
      style={{
        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', 
        background: 'rgba(255,255,255,0.8)', zIndex: 9999, display: 'flex', 
        justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(2px)'
      }}
    >
      <div 
        onClick={handleContentClick} 
        style={{ 
            background: 'white', 
            borderRadius: '12px', 
            width: '400px', 
            maxHeight: '500px', 
            boxShadow: '0 12px 28px rgba(0,0,0,0.2), 0 2px 4px rgba(0,0,0,0.1)',
            display: 'flex', 
            flexDirection: 'column',
            overflow: 'hidden',
            border: '1px solid #ddd',
            animation: 'fadeIn 0.2s ease-out'
        }}
      >
        
        {/* Header */}
        <div style={{padding: '15px 20px', borderBottom: '1px solid #e5e5e5', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <span style={{fontSize: '18px', fontWeight: '700', color: '#050505'}}>Reactions</span>
            <button 
                onClick={onClose} 
                style={{
                    border:'none', background:'#e4e6eb', borderRadius:'50%', 
                    width:'32px', height:'32px', cursor:'pointer', 
                    display:'flex', alignItems:'center', justifyContent:'center', 
                    fontSize:'16px', color:'#606770', transition: 'background 0.2s'
                }}
            >✕</button>
        </div>
        
        {/* List - Optimized: Uses native scrolling */}
        <div style={{ padding: '0 10px', overflowY: 'auto', flex: 1 }}>
            {likes.length === 0 && <p style={{padding:'20px', textAlign:'center', color:'#65676b'}}>No reactions yet.</p>}

            {likes.map((like) => (
                <div key={like._id} style={{display: 'flex', alignItems: 'center', padding: '10px', borderRadius: '8px', transition: 'background 0.1s'}} className="liker-item">
                    
                    {/* Avatar + Reaction Badge */}
                    <div style={{position: 'relative', marginRight: '12px', cursor: 'pointer'}}>
                        <img 
                            src={like.userId.profilePic || "/assets/images/profile.png"} 
                            alt="" 
                            style={{width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #e5e5e5'}}
                        />
                        <div style={{
                            position: 'absolute', 
                            bottom: '-2px', 
                            right: '-4px', 
                            background: 'white', 
                            borderRadius: '50%', 
                            padding: '2px',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '18px',
                            height: '18px'
                        }}>
                             <div style={{transform: 'scale(0.9)'}}>
                                {REACTION_ICONS[like.type]}
                             </div>
                        </div>
                    </div>

                    <h4 style={{fontSize: '15px', margin:0, fontWeight: '600', color: '#050505', cursor: 'pointer'}}>
                        {like.userId.firstName} {like.userId.lastName}
                    </h4>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default memo(LikersModal);
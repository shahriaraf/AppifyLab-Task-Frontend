import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { formatTimeAgo } from '../utils/dateUtils';
import ReactionPicker from './ReactionPicker';
import { REACTION_ICONS, getReactionLabel } from './ReactionConstants';
import LikersModal from './LikersModal';

const CommentItem = ({ 
    comment, 
    postId, 
    onReplySubmit, 
    onChildReplyAdd 
}) => {
    // --- STATE ---
    const [reaction, setReaction] = useState(comment.userReaction || null);
    const [likesCount, setLikesCount] = useState(comment.likesCount || 0);
    // NEW: Store the top reaction types from DB
    const [topReactions, setTopReactions] = useState(comment.topReactions || []); 
    
    // Reply Management
    const [replies, setReplies] = useState([]);
    const [replyCount, setReplyCount] = useState(comment.replyCount || 0);
    const [showReplies, setShowReplies] = useState(false);
    const [areRepliesLoaded, setAreRepliesLoaded] = useState(false);
    const [isLoadingReplies, setIsLoadingReplies] = useState(false);

    // UI State
    const [showReplyInput, setShowReplyInput] = useState(false);
    const [replyText, setReplyText] = useState("");
    const [showPicker, setShowPicker] = useState(false);
    const [showLikersModal, setShowLikersModal] = useState(false);
    const [likersData, setLikersData] = useState([]);
    
    // Utils
    const timerRef = useRef(null);
    const isLongPress = useRef(false);
    const hoverTimerRef = useRef(null);
    
    // Env & Auth
    const API_URL = "http://localhost:5000";
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    const isReply = !!comment.parentComment; 

    // --- SYNC STATE WITH PROPS ---
    useEffect(() => {
        setReaction(comment.userReaction || null);
        setLikesCount(comment.likesCount || 0);
        setReplyCount(comment.replyCount || 0);
        // Sync the real icon types from backend
        setTopReactions(comment.topReactions || []); 
    }, [comment]);

    // --- FIXED: REAL STACKED ICON LOGIC ---
    const renderBubbleIcons = () => {
        // If count is 0, return nothing
        if (likesCount === 0) return null;

        // 1. Determine which icons to show
        // Use state `topReactions`. If empty (legacy data), fallback to `reaction` or 'Like'.
        let iconsToShow = [...topReactions];

        // Fallback for single user reaction if array is empty but count > 0
        if (iconsToShow.length === 0 && reaction) {
            iconsToShow = [reaction];
        } else if (iconsToShow.length === 0) {
            iconsToShow = ['Like'];
        }

        // If currently reacting, ensure MY reaction is visible at the front (Optimistic UI visual)
        if (reaction && !iconsToShow.includes(reaction)) {
            iconsToShow = [reaction, ...iconsToShow].slice(0, 2);
        }

        const primaryType = iconsToShow[0]; // Top/Front Icon
        const secondaryType = iconsToShow[1]; // Bottom/Back Icon

        // CASE A: Single Icon (Count 1 or only 1 type exists)
        if (likesCount === 1 || !secondaryType) {
             return <div style={{transform:'scale(0.8)'}}>{REACTION_ICONS[primaryType]}</div>;
        }

        // CASE B: Stacked Icons (Count > 1 AND 2 different types exist)
        return (
            <div style={{position: 'relative', width: '34px', height: '18px', display: 'flex', alignItems: 'center'}}>
                 {/* Back Icon (Secondary) */}
                 <div style={{position: 'absolute', left: 5, zIndex: 1, transform: 'scale(0.8)'}}>
                    {REACTION_ICONS[secondaryType]}
                 </div>
                 {/* Front Icon (Primary) */}
                 <div style={{
                     position: 'absolute', left: '14px', zIndex: 2, 
                     border: '2px solid white', borderRadius: '50%', transform: 'scale(0.8)', background: 'white'
                 }}>
                    {REACTION_ICONS[primaryType]}
                 </div>
            </div>
        );
    };

    // --- API HANDLERS ---
    const toggleReplies = async () => {
        if (showReplies) {
            setShowReplies(false);
            return;
        }
        setShowReplies(true);

        if (!areRepliesLoaded && replyCount > 0) {
            setIsLoadingReplies(true);
            try {
                const res = await axios.get(`${API_URL}/comments/${comment._id}/replies`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setReplies(res.data);
                setAreRepliesLoaded(true);
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoadingReplies(false);
            }
        }
    };

    const handleReplySubmit = async (e) => {
        e.preventDefault();
        if (!replyText.trim()) return;

        try {
            const newReply = await onReplySubmit(replyText, comment._id);
            setReplyText("");
            setShowReplyInput(false);

            if (!isReply) {
                setReplies([...replies, newReply]);
                setReplyCount(prev => prev + 1);
                setShowReplies(true);
                setAreRepliesLoaded(true);
            } else {
                if (onChildReplyAdd) {
                    onChildReplyAdd(newReply);
                }
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleChildNewReply = (newReplyObj) => {
        setReplies(prev => [...prev, newReplyObj]);
        setReplyCount(prev => prev + 1);
    };

    // --- REACTION INTERACTIONS ---
    const handleMouseEnter = () => {
        hoverTimerRef.current = setTimeout(() => {
            setShowPicker(true);
        }, 600);
    };

    const handleMouseLeave = () => {
        if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
        setTimeout(() => { }, 200); 
    };

    const handlePressStart = () => {
        isLongPress.current = false;
        timerRef.current = setTimeout(() => {
            isLongPress.current = true;
            setShowPicker(true);
        }, 500);
    };

    const handlePressEnd = () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        if (!isLongPress.current && !showPicker) {
            handleReaction(reaction ? reaction : "Like");
        }
    };

    const handleReaction = async (type) => {
        setShowPicker(false);
        
        // OPTIMISTIC UI
        if (reaction === type) { 
            // REMOVE reaction
            setReaction(null); 
            setLikesCount(prev => Math.max(0, prev - 1)); 
            // Remove from stack visually
            setTopReactions(prev => prev.filter(t => t !== type));
        } else { 
            // ADD/CHANGE reaction
            if (!reaction) setLikesCount(prev => prev + 1);
            setReaction(type);
            
            // Add to stack visually (Remove old if exists, add new to front)
            setTopReactions(prev => {
                const filtered = prev.filter(t => t !== reaction); // Remove old reaction type
                return [type, ...filtered].slice(0, 2); // Add new to front, keep max 2
            });
        }

        try { 
            await axios.put(`${API_URL}/api/react/Comment/${comment._id}`, 
            { reactionType: type }, { headers: { Authorization: `Bearer ${token}` } }); 
        } catch (err) { 
            console.error(err); 
        }
    };

    const fetchLikers = async (e) => {
        e.stopPropagation();
        if (likesCount === 0) return;
        try {
            const res = await axios.get(`${API_URL}/api/react/Comment/${comment._id}`, { 
                headers: { Authorization: `Bearer ${token}` } 
            });
            setLikersData(res.data);
            setShowLikersModal(true);
        } catch (err) { console.error(err); }
    };

    // --- RENDER ---
    const renderContent = () => {
        if (comment.replyToUser) {
            return (
                <p style={{margin:0, fontSize: '14px', color:'#050505', lineHeight:'1.3', wordBreak: 'break-word'}}>
                    {comment.content}
                </p>
            );
        }
        return <p style={{margin:0, fontSize: '14px', color:'#050505', lineHeight:'1.3', wordBreak: 'break-word'}}>{comment.content}</p>;
    };

    const reactionStyle = reaction ? getReactionLabel(reaction) : { label: 'Like', color: '#65676b' };

    return (
        <div style={{ position: 'relative', marginBottom: '8px' }}>
            
            {isReply && (
               <div style={{position: 'absolute', top: '-12px', left: '-20px', width: '20px', height: '25px', borderLeft: '2px solid #f0f2f5', borderBottom: '2px solid #f0f2f5', borderBottomLeftRadius: '12px', zIndex: 0}}></div>
            )}

            <div className="_comment_main" style={{display: 'flex', alignItems: 'flex-start', position:'relative', zIndex:1}}>
                <img 
                    src={comment.userId.profilePic || "/assets/images/profile.png"} 
                    alt="" 
                    style={{width: isReply ? '24px' : '32px', height: isReply ? '24px' : '32px', borderRadius:'50%', marginRight: '8px', objectFit:'cover'}}
                />
                
                <div className="_comment_bubble_wrapper" style={{ maxWidth: 'calc(100% - 50px)' }}>
                    <div style={{background: '#f0f2f5', padding: '8px 12px', borderRadius: '18px', display:'inline-block', position: 'relative'}}>
                        <h4 style={{fontSize: '13px', margin:0, fontWeight: '600', color:'#050505'}}>
                            {comment.userId.firstName} {comment.userId.lastName}
                        </h4>
                        
                        {renderContent()}
                        
                        {/* STACKED REACTION BUBBLE (UPDATED) */}
                        {likesCount > 0 && (
                            <div 
                                onClick={fetchLikers} 
                                style={{
                                    position: 'absolute', right: '-30px', bottom: '-12px', 
                                    background: '#fff', borderRadius: '10px', 
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.3)', padding: '2px 4px', 
                                    display: 'flex', alignItems: 'center', cursor: 'pointer', zIndex: 10,
                                    minWidth: '30px', height: '20px'
                                }}
                            >
                                {renderBubbleIcons()}
                                <span style={{marginLeft: '4px', fontSize: '12px', color: '#65676b', lineHeight: '20px'}}>
                                    {likesCount}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* ACTIONS ROW */}
                    <div style={{display:'flex', gap:'12px', fontSize:'12px', color:'#65676b', fontWeight:'bold', margin: '15px 0 0 12px'}}>
                        
                        <span 
                            style={{cursor:'pointer', color: reactionStyle.color, position: 'relative', userSelect:'none'}}
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                            onMouseDown={handlePressStart} 
                            onMouseUp={handlePressEnd} 
                            onTouchStart={handlePressStart} 
                            onTouchEnd={handlePressEnd}
                        >
                            {showPicker && (
                                <div onMouseEnter={() => { if(hoverTimerRef.current) clearTimeout(hoverTimerRef.current); }}>
                                    <ReactionPicker 
                                        onSelect={handleReaction} 
                                        onClose={()=>setShowPicker(false)} 
                                    />
                                </div>
                            )}
                            {reactionStyle.label}
                        </span>
                        
                        <span onClick={() => setShowReplyInput(!showReplyInput)} style={{cursor:'pointer'}}>Reply</span>
                        <span style={{fontWeight: 'normal'}}>{formatTimeAgo(comment.createdAt)}</span>
                    </div>
                </div>
            </div>

            {showReplyInput && (
                <div style={{paddingLeft: isReply ? '32px' : '40px', marginTop: '5px'}}>
                    <form onSubmit={handleReplySubmit} style={{display:'flex', alignItems:'center'}}>
                        <img src={user?.profilePic || "/assets/images/profile.png"} alt="" style={{width: '24px', height: '24px', borderRadius: '50%', marginRight:'8px'}} />
                        <input placeholder={`Reply to ${comment.userId.firstName}...`} value={replyText} onChange={e => setReplyText(e.target.value)} style={{width: '100%', height: '32px', padding: '0 10px', fontSize:'13px', borderRadius: '16px', background:'#f0f2f5', border:'none', outline: 'none'}} autoFocus />
                    </form>
                </div>
            )}

            {!isReply && (
                <>
                    {replyCount > 0 && (
                        <div style={{paddingLeft: '40px', marginTop: '5px'}}>
                            <div onClick={toggleReplies} style={{fontSize: '13px', fontWeight: '600', color: '#65676b', cursor: 'pointer', display: 'flex', alignItems: 'center', userSelect:'none'}}>
                                {showReplies ? 
                                    <span style={{display:'flex', alignItems:'center'}}><i style={{border:'solid #65676b', borderWidth:'0 2px 2px 0', display:'inline-block', padding:'3px', transform:'rotate(-135deg)', marginRight:'5px'}}></i> Hide replies</span> 
                                    : 
                                    <span style={{display:'flex', alignItems:'center'}}><i style={{border:'solid #65676b', borderWidth:'0 2px 2px 0', display:'inline-block', padding:'3px', transform:'rotate(45deg)', marginRight:'5px', marginBottom:'2px'}}></i> View {replyCount} replies</span>
                                }
                                {isLoadingReplies && <span style={{marginLeft: '5px', fontSize: '10px', fontWeight:'normal'}}>Loading...</span>}
                            </div>
                        </div>
                    )}

                    {showReplies && (
                        <div style={{paddingLeft: '40px', marginTop: '8px'}}> 
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
                </>
            )}

            {showLikersModal && <LikersModal likes={likersData} onClose={() => setShowLikersModal(false)} />}
        </div>
    );
};

export default CommentItem;
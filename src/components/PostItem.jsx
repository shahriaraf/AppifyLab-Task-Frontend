import React, { useState} from 'react';
import axios from 'axios';
import CommentItem from './CommentItem';
import ReactionPicker from './ReactionPicker';
import LikersModal from './LikersModal';
import { formatTimeAgo } from '../utils/dateUtils';
import { REACTION_ICONS, getReactionLabel } from './ReactionConstants';

const PostItem = ({ post }) => {
    // State
    const [myReaction, setMyReaction] = useState(post.userReaction || null); 
    const [likesCount, setLikesCount] = useState(post.likesCount);
    
    // Comments
    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState([]);
    const [commentText, setCommentText] = useState("");
    const [totalComments, setTotalComments] = useState(post.commentsCount);
    
    // Dynamic Reaction Stack State
    const [stack, setStack] = useState(post.recentReactors || []);

    // UI States
    const [showPicker, setShowPicker] = useState(false);
    const [showLikersModal, setShowLikersModal] = useState(false);
    const [likersData, setLikersData] = useState([]);

    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    // --- HANDLE REACTION (Logic to update Stack Instantly) ---
    const handleReaction = async (type) => {
        setShowPicker(false);
        
        // 1. Determine Logic (Add, Remove, or Change)
        if (myReaction === type) {
            // TOGGLE OFF
            setMyReaction(null);
            setLikesCount(prev => prev - 1);
            // Remove ME from stack
            setStack(prev => prev.filter(u => u._id !== user._id));
        } else {
            // ADD or CHANGE
            if (!myReaction) {
                setLikesCount(prev => prev + 1);
                // Add ME to stack (Optimistic)
                const me = { _id: user._id, profilePic: user.profilePic, firstName: user.firstName };
                setStack(prev => [me, ...prev].slice(0, 3)); // Keep max 3
            }
            setMyReaction(type);
        }

        // 2. API Call
        try {
            await axios.put(`http://localhost:5000/api/react/Post/${post._id}`, 
                { reactionType: type },
                { headers: { Authorization: `Bearer ${token}` } }
            );
        } catch (err) { console.error(err); }
    };

    // --- FETCH ALL LIKERS (Modal) ---
    const fetchLikers = async () => {
        if (likesCount === 0) return;
        try {
            const res = await axios.get(`http://localhost:5000/api/react/Post/${post._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setLikersData(res.data);
            setShowLikersModal(true);
        } catch (err) { console.error(err); }
    };

    const toggleComments = async () => {
        if (!showComments) {
            try {
                const res = await axios.get(`http://localhost:5000/posts/${post._id}/comments`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setComments(res.data);
            } catch (err) { console.error(err); }
        }
        setShowComments(!showComments);
    };

       const handleCommentSubmit = async (text, parentId = null) => {
        try {
            const res = await axios.post(`http://localhost:5000/posts/${post._id}/comments`, 
                { content: text, parentId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            // If it's a root comment, add to main list. If reply, return it.
            if (!parentId) {
                setComments([res.data, ...comments]); // Add to top
                setTotalComments(prev => prev + 1);
                setCommentText("");
            }
            return res.data; // RETURN DATA FOR CHILD COMPONENT
        } catch (err) { console.error(err); }
    };

    const rootComments = comments.filter(c => !c.parentId);
    const getReplies = (cid) => comments.filter(c => c.parentId === cid);
    const reactionStyle = myReaction ? getReactionLabel(myReaction) : null;

    return (
        <div className="_feed_inner_timeline_post_area _b_radious6 _padd_b24 _padd_t24 _mar_b16" style={{overflow:'visible', position:'relative'}}> 
            <div className="_feed_inner_timeline_content _padd_r24 _padd_l24">
                {/* Post Header */}
                <div className="_feed_inner_timeline_post_top">
                    <div className="_feed_inner_timeline_post_box">
                        <div className="_feed_inner_timeline_post_box_image">
                            <img src={post.userId.profilePic || "/assets/images/profile.png"} alt="" className="_post_img"/>
                        </div>
                        <div className="_feed_inner_timeline_post_box_txt">
                            <h4 className="_feed_inner_timeline_post_box_title">{post.userId.firstName} {post.userId.lastName}</h4>
                            <p className="_feed_inner_timeline_post_box_para">
                                {formatTimeAgo(post.createdAt)} . <span style={{textTransform: 'capitalize'}}>{post.privacy}</span>
                            </p>
                        </div>
                    </div>
                    {/* 3 Dots Menu (Static UI) */}
                    <div className="_feed_inner_timeline_post_box_dropdown">
                        <button className="_feed_timeline_post_dropdown_link">
                            <svg xmlns="http://www.w3.org/2000/svg" width="4" height="17" fill="none" viewBox="0 0 4 17"><circle cx="2" cy="2" r="2" fill="#C4C4C4" /><circle cx="2" cy="8" r="2" fill="#C4C4C4" /><circle cx="2" cy="15" r="2" fill="#C4C4C4" /></svg>
                        </button>
                    </div>
                </div>
                
                <h4 className="_feed_inner_timeline_post_title" style={{fontWeight:'400', fontSize:'16px', margin:'15px 0'}}>{post.content}</h4>
                {post.image && <div className="_feed_inner_timeline_image"><img src={post.image} alt="" className="_time_img"/></div>}
            </div>
            
            {/* --- DYNAMIC REACTION STACK --- */}
            <div className="_feed_inner_timeline_total_reacts _padd_r24 _padd_l24 _mar_b26" style={{minHeight: '30px', display:'flex', alignItems:'center'}}>
                
                {/* Case 1: Less than 9 likes -> Show Actual Avatars */}
                {likesCount > 0 && likesCount < 9 && (
                    <div 
                        className="_feed_inner_timeline_total_reacts_image" 
                        style={{display:'flex', alignItems:'center', cursor:'pointer'}}
                        onClick={fetchLikers}
                    >
                        {stack.map((u, i) => (
                            <img 
                                key={u._id || i} 
                                src={u.profilePic || "/assets/images/profile.png"} 
                                alt="" 
                                style={{
                                    width:'22px', height:'22px', borderRadius:'50%', 
                                    border:'2px solid white', 
                                    marginLeft: i === 0 ? 0 : '-8px',
                                    zIndex: 3 - i,
                                    objectFit: 'cover'
                                }} 
                            />
                        ))}
                        <p className="_feed_inner_timeline_total_reacts_para" style={{marginLeft:'8px', color:'#65676b'}}>{likesCount}</p>
                    </div>
                )}

                {/* Case 2: 9 or more likes -> Show Count Bubble */}
                {likesCount >= 9 && (
                    <div className="_feed_inner_timeline_total_reacts_image" onClick={fetchLikers} style={{cursor:'pointer'}}>
                        <div style={{background: '#2078f4', color:'white', padding:'2px 6px', borderRadius:'10px', fontSize:'12px', display:'flex', alignItems:'center'}}>
                            <span style={{marginRight:'3px'}}>👍</span> {likesCount}
                        </div>
                    </div>
                )}

                <div className="_feed_inner_timeline_total_reacts_txt" style={{marginLeft: 'auto'}}>
                    <p className="_feed_inner_timeline_total_reacts_para1"><span onClick={toggleComments} style={{cursor:'pointer'}}>{totalComments} Comment</span></p>
                    <p className="_feed_inner_timeline_total_reacts_para2"><span>122</span> Share</p>
                </div>
            </div>
            
            {/* --- ACTIONS --- */}
            <div className="_feed_inner_timeline_reaction" style={{position: 'relative', borderTop: '1px solid #e5e5e5', borderBottom: '1px solid #e5e5e5', padding: '5px 0'}}>
                
                <div 
                    className="_feed_inner_timeline_reaction_emoji _feed_reaction"
                    style={{flex: 1, display: 'flex', justifyContent:'center', position: 'relative'}}
                >
                    {showPicker && <ReactionPicker onSelect={handleReaction} />}
                    
                    <button 
                        onClick={() => setShowPicker(!showPicker)} // Click to Open Picker
                        style={{background:'none', border:'none', color: reactionStyle ? reactionStyle.color : '#666', fontWeight: '600', display:'flex', alignItems:'center', gap:'8px', width:'100%', justifyContent:'center', padding:'10px'}}
                    >
                        {reactionStyle ? (
                            <span style={{transform:'scale(1.2)'}}>{reactionStyle.icon}</span>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 20 20"><path fill="#666" d="M13.916 0c3.109 0 5.18 2.429 5.18 5.914v8.17c0 3.486-2.072 5.916-5.18 5.916H5.999C2.89 20 .827 17.572.827 14.085v-8.17C.827 2.43 2.897 0 6 0h7.917zm0 1.504H5.999c-2.321 0-3.799 1.735-3.799 4.41v8.17c0 2.68 1.472 4.412 3.799 4.412h7.917c2.328 0 3.807-1.734 3.807-4.411v-8.17c0-2.678-1.478-4.411-3.807-4.411zm.65 8.68l.12.125 1.9 2.147a.803.803 0 01-.016 1.063.642.642 0 01-.894.058l-.076-.074-1.9-2.148a.806.806 0 00-1.205-.028l-.074.087-2.04 2.717c-.722.963-2.02 1.066-2.86.26l-.111-.116-.814-.91a.562.562 0 00-.793-.07l-.075.073-1.4 1.617a.645.645 0 01-.97.029.805.805 0 01-.09-.977l.064-.086 1.4-1.617c.736-.852 1.95-.897 2.734-.137l.114.12.81.905a.587.587 0 00.861.033l.07-.078 2.04-2.718c.81-1.08 2.27-1.19 3.205-.275zM6.831 4.64c1.265 0 2.292 1.125 2.292 2.51 0 1.386-1.027 2.511-2.292 2.511S4.54 8.537 4.54 7.152c0-1.386 1.026-2.51 2.291-2.51zm0 1.504c-.507 0-.918.451-.918 1.007 0 .555.411 1.006.918 1.006.507 0 .919-.451.919-1.006 0-.556-.412-1.007-.919-1.007z"/></svg>
                        )}
                        <span>{reactionStyle ? reactionStyle.label : "Like"}</span>
                    </button>
                </div>

                <button className="_feed_inner_timeline_reaction_comment _feed_reaction" onClick={toggleComments} style={{flex: 1}}>
                    <span className="_feed_inner_timeline_reaction_link"> 
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 20 20" style={{marginRight: '5px'}}><path fill="#666" d="M10.867 1.333c2.257 0 3.774 1.581 3.774 3.933v5.435c0 2.352-1.517 3.932-3.774 3.932H5.101c-2.254 0-3.767-1.58-3.767-3.932V5.266c0-2.352 1.513-3.933 3.767-3.933h5.766zm0 1H5.101c-1.681 0-2.767 1.152-2.767 2.933v5.435c0 1.782 1.086 2.932 2.767 2.932h5.766c1.685 0 2.774-1.15 2.774-2.932V5.266c0-1.781-1.089-2.933-2.774-2.933zm.426 5.733l.017.015.013.013.009.008.037.037c.12.12.453.46 1.443 1.477a.5.5 0 11-.716.697S10.73 8.91 10.633 8.816a.614.614 0 00-.433-.118.622.622 0 00-.421.225c-1.55 1.88-1.568 1.897-1.594 1.922a1.456 1.456 0 01-2.057-.021s-.62-.63-.63-.642c-.155-.143-.43-.134-.594.04l-1.02 1.076a.498.498 0 01-.707.018.499.499 0 01-.018-.706l1.018-1.075c.54-.573 1.45-.6 2.025-.06l.639.647c.178.18.467.184.646.008l1.519-1.843a1.618 1.618 0 011.098-.584c.433-.038.854.088 1.19.363zM5.706 4.42c.921 0 1.67.75 1.67 1.67 0 .92-.75 1.67-1.67 1.67-.92 0-1.67-.75-1.67-1.67 0-.921.75-1.67 1.67-1.67zm0 1a.67.67 0 10.001 1.34.67.67 0 00-.002-1.34z"/></svg> Comment
                    </span>
                </button>

                <button className="_feed_inner_timeline_reaction_share _feed_reaction" style={{flex: 1}}>
                    <span className="_feed_inner_timeline_reaction_link"> 
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 20 20" style={{marginRight: '5px'}}><path fill="#666" d="M14.371 2c.32 0 .585.262.627.603l.005.095v.788c2.598.195 4.188 2.033 4.18 5v8.488c0 3.145-1.786 5.026-4.656 5.026H7.395C4.53 22 2.74 20.087 2.74 16.904V8.486c0-2.966 1.596-4.804 4.187-5v-.788c0-.386.283-.698.633-.698.32 0 .584.262.626.603l.006.095v.771h5.546v-.771c0-.386.284-.698.633-.698zm3.546 8.283H4.004l.001 6.621c0 2.325 1.137 3.616 3.183 3.697l.207.004h7.132c2.184 0 3.39-1.271 3.39-3.63v-6.692z"/></svg> Share
                    </span>
                </button>
            </div>

            {/* --- COMMENTS --- */}
            {showComments && (
                <div className="_timline_comment_main" style={{display: 'block', padding: '15px 24px'}}>
                    <div className="_feed_inner_comment_box" style={{marginBottom: '20px', display: 'flex', alignItems: 'center'}}>
                        <img src={user?.profilePic || "/assets/images/profile.png"} alt="Me" className="_comment_img" style={{width: '32px', height: '32px', borderRadius: '50%', marginRight: '10px'}} />
                        <div className="_feed_inner_comment_box_content_txt" style={{flex: 1, background: '#f0f2f5', borderRadius: '20px', padding: '0 10px'}}>
                            <form onSubmit={(e) => { e.preventDefault(); handleCommentSubmit(commentText); }}>
                                <input className="form-control _comment_textarea" style={{border: 'none', background: 'transparent', height: '36px'}} placeholder="Write a comment..." value={commentText} onChange={e => setCommentText(e.target.value)}/>
                            </form>
                        </div>
                    </div>
                    {rootComments.map(c => (
                        <CommentItem key={c._id} comment={c} postId={post._id} replies={getReplies(c._id)} onReplySubmit={handleCommentSubmit}/>
                    ))}
                </div>
            )}

            {/* MODAL */}
            {showLikersModal && <LikersModal likes={likersData} onClose={() => setShowLikersModal(false)} />}
        </div>
    );
};

export default PostItem;
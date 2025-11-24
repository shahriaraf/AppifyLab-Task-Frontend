import React, { createContext, useState, useContext, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';

const FeedContext = createContext();

export const useFeed = () => useContext(FeedContext);

export const FeedProvider = ({ children }) => {
    const { token, api } = useAuth();
    
    // State
    const [posts, setPosts] = useState([]);
    const [feedLoading, setFeedLoading] = useState(false);
    
    // Optimization State
    const [nextCursor, setNextCursor] = useState(null);
    const [hasMore, setHasMore] = useState(true);

    /**
     * fetchPosts - Optimized for Infinite Scroll
     * @param {boolean} isInitial - If true, resets the list (Pull-to-refresh or first load)
     */
    const fetchPosts = useCallback(async (isInitial = false) => {
        if (!token) return;
        
        // Prevent multiple calls or fetching if end reached
        if (feedLoading) return;
        if (!isInitial && !hasMore) return;

        setFeedLoading(true);

        try {
            // Construct URL Params
            const params = { limit: 10 }; // Load 10 at a time
            if (!isInitial && nextCursor) {
                params.cursor = nextCursor;
            }

            const res = await api.get("/posts", {
                headers: { Authorization: `Bearer ${token}` },
                params: params // Axios automatically handles ?limit=10&cursor=xyz
            });

            // Backend should return: { posts: [], nextCursor: "ID", hasMore: bool }
            const { posts: newPosts, nextCursor: newCursor, hasMore: moreAvailable } = res.data;

            if (isInitial) {
                setPosts(newPosts); // Replace entire list
            } else {
                setPosts(prev => [...prev, ...newPosts]); // Append to list
            }

            setNextCursor(newCursor);
            setHasMore(moreAvailable);

        } catch (err) {
            console.error("Feed fetch error:", err);
            toast.error("Could not load feed");
        } finally {
            setFeedLoading(false);
        }
    }, [token, nextCursor, hasMore, feedLoading, api]);

    /**
     * createPost - Optimized with "Optimistic UI"
     * Instead of re-fetching the whole feed, we just prepend the new post to the array.
     */
    const createPost = async (formData) => {
        try {
            // 1. Upload & Save to DB
            const res = await api.post("/posts", formData, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data"
                }
            });
            
            // 2. Optimistic Update: Add new post directly to the TOP of the list
            // (Make sure your backend returns the fully populated user object, 
            // otherwise you might need to manually merge user details here)
            const newPost = res.data;
            
            // Manually populate user details if backend didn't populate deeply
            // (assuming your API returns the post with user details populated)
             if (!newPost.userId.profilePic) {
                 // Fallback if backend didn't populate (optional safety)
                 // You might need to adjust based on your exact backend response
             }

            setPosts(prevPosts => [newPost, ...prevPosts]);
            
            toast.success("Post Created!");
            
        } catch (err) {
            console.error(err);
            toast.error("Failed to create post");
        }
    };

    /**
     * updateLocalPostReaction (Optional Helper)
     * Use this when a user Likes/Unlikes so we don't have to re-fetch data
     */
    const updateLocalPostReaction = (postId, reactionType, isAdding) => {
        setPosts(prevPosts => prevPosts.map(post => {
            if (post._id === postId) {
                return {
                    ...post,
                    isLiked: isAdding, // Simplified for binary like/unlike
                    likesCount: isAdding ? post.likesCount + 1 : post.likesCount - 1,
                    userReaction: isAdding ? reactionType : null
                };
            }
            return post;
        }));
    };

    return (
        <FeedContext.Provider value={{ 
            posts, 
            feedLoading, 
            hasMore, 
            fetchPosts, 
            createPost,
            updateLocalPostReaction 
        }}>
            {children}
        </FeedContext.Provider>
    );
};
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
     */
    const fetchPosts = useCallback(async (isInitial = false) => {
        if (!token) return;
        
        if (feedLoading) return;
        if (!isInitial && !hasMore) return;

        setFeedLoading(true);

        try {
            const params = { limit: 10 };
            if (!isInitial && nextCursor) {
                params.cursor = nextCursor;
            }

            const res = await api.get("/posts", {
                headers: { Authorization: `Bearer ${token}` },
                params: params 
            });

            const { posts: newPosts, nextCursor: newCursor, hasMore: moreAvailable } = res.data;

            if (isInitial) {
                setPosts(newPosts);
            } else {
                setPosts(prev => [...prev, ...newPosts]);
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
     * createPost
     */
    const createPost = async (formData) => {
        try {
            const res = await api.post("/posts", formData, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data"
                }
            });
            
            const newPost = res.data;
            setPosts(prevPosts => [newPost, ...prevPosts]);
            
            toast.success("Post Created!");
            
        } catch (err) {
            console.error(err);
            toast.error("Failed to create post");
        }
    };

    const updateLocalPostReaction = (postId, reactionType, isAdding) => {
        setPosts(prevPosts => prevPosts.map(post => {
            if (post._id === postId) {
                return {
                    ...post,
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
            setPosts, // <--- ADD THIS LINE (Required for Delete functionality)
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
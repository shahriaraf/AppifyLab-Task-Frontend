import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';

const FeedContext = createContext();

export const useFeed = () => useContext(FeedContext);

export const FeedProvider = ({ children }) => {
    const { token, api } = useAuth();
    const [posts, setPosts] = useState([]);
    const [feedLoading, setFeedLoading] = useState(false);

    const fetchPosts = async () => {
        if (!token) return;
        setFeedLoading(true);
        try {
            const res = await api.get("/posts", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPosts(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setFeedLoading(false);
        }
    };

    const createPost = async (formData) => {
        try {
            await api.post("/posts", formData, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data"
                }
            });
            toast.success("Post Created!");
            fetchPosts(); // Refresh Feed
        } catch (err) {
            toast.error("Failed to create post");
        }
    };

    return (
        <FeedContext.Provider value={{ posts, feedLoading, fetchPosts, createPost }}>
            {children}
        </FeedContext.Provider>
    );
};
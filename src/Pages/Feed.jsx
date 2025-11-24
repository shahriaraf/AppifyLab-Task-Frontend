import React, { useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

import Header from '../components/Header';
import LeftSidebar from '../components/LeftSidebar';
import RightSidebar from '../components/RightSidebar';
import Stories from '../components/Stories';
import CreatePost from '../components/CreatePost';
import PostItem from '../components/PostItem';
import { useAuth } from '../context/AuthContext';
import { useFeed } from '../context/FeedContext'; // Ensure this uses the logic from step 2

const Feed = () => {
    const navigate = useNavigate();
    const { user, token } = useAuth();
    
    // Assuming useFeed now returns these optimized values
    const { posts, loading, hasMore, fetchPosts } = useFeed();

    // 1. Intersection Observer Ref
    const observer = useRef();

    // 2. Auth Check & Initial Load
    useEffect(() => {
        if (!token) {
            navigate("/login");
        } else {
            // Pass true to indicate this is the initial load (reset list)
            fetchPosts(true); 
        }
        // eslint-disable-next-line
    }, [token]);

    // 3. The "Infinite Scroll" Callback
    const lastPostElementRef = useCallback(node => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();
        
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                fetchPosts(false); // Fetch next page
            }
        });
        
        if (node) observer.current.observe(node);
    }, [loading, hasMore, fetchPosts]);

    return (
        <div className="_layout _layout_main_wrapper">
            <ToastContainer position="bottom-right" autoClose={3000} theme="dark" />
            
            {/* Static Layout Button omitted for brevity, keep it if needed */}
            
            <div className="_main_layout">
                <Header user={user} />

                <div className="container _custom_container">
                    <div className="_layout_inner_wrap">
                        <div className="row">
                            <LeftSidebar />
                            <div className="col-xl-6 col-lg-6 col-md-12 col-sm-12">
                                <div className="_layout_middle_wrap">
                                    <Stories user={user} /> 
                                    
                                    {/* Pass refresh function if CreatePost needs to add to top */}
                                    <CreatePost />
                                    
                                    {/* Render Posts */}
                                    {posts.map((post, index) => {
                                        // Attach ref to the very last element to trigger fetch
                                        if (posts.length === index + 1) {
                                            return (
                                                <div ref={lastPostElementRef} key={post._id}>
                                                    <PostItem post={post} />
                                                </div>
                                            );
                                        } else {
                                            return <PostItem key={post._id} post={post} />;
                                        }
                                    })}

                                    {/* Loading Indicator */}
                                    {loading && (
                                        <div className="text-center mt-4 mb-4">
                                            <div className="spinner-border text-primary" role="status">
                                                <span className="visually-hidden">Loading...</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* End of Feed Message */}
                                    {!hasMore && posts.length > 0 && (
                                        <p className="text-center mt-4 text-muted">
                                            You've caught up with everything!
                                        </p>
                                    )}
                                </div>
                            </div>
                            <RightSidebar />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Feed;
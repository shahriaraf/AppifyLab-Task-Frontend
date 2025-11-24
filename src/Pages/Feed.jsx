import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';



import Header from '../components/Header';
import LeftSidebar from '../components/LeftSidebar';
import RightSidebar from '../components/RightSidebar';
import Stories from '../components/Stories'; // <--- Imported
import CreatePost from '../components/CreatePost';
import PostItem from '../components/PostItem';
import { useAuth } from '../context/AuthContext';
import { useFeed } from '../context/FeedContext';

const Feed = () => {
    const navigate = useNavigate();
    const { user, token } = useAuth();
    const { posts, feedLoading, fetchPosts } = useFeed();

    useEffect(() => {
        if (!token) navigate("/login");
        else fetchPosts();
    }, [token]);

    return (
        <div className="_layout _layout_main_wrapper">
            <ToastContainer position="bottom-right" autoClose={3000} theme="dark" />
            <Header user={user} />

            <div className="_main_layout">
                <div className="container _custom_container">
                    <div className="_layout_inner_wrap">
                        <div className="row">
                            
                            <LeftSidebar />

                            <div className="col-xl-6 col-lg-6 col-md-12 col-sm-12">
                                <div className="_layout_middle_wrap">
                                    
                                    {/* Stories Section Added Here */}
                                    <Stories user={user} /> 

                                    <CreatePost />
                                    
                                    {feedLoading ? <p className="text-center mt-4">Loading...</p> : (
                                        posts.map(post => <PostItem key={post._id} post={post} />)
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
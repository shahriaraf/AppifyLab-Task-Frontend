import React, { useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import Header from "../components/Header";
import LeftSidebar from "../components/LeftSidebar";
import RightSidebar from "../components/RightSidebar";
import Stories from "../components/Stories";
import CreatePost from "../components/CreatePost";
import PostItem from "../components/PostItem";
import { useAuth } from "../context/AuthContext";
import { useFeed } from "../context/FeedContext";

const Feed = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { posts, loading, hasMore, fetchPosts, setPosts } = useFeed();

  const handlePostDelete = useCallback(
    (deletedPostId) => {
      setPosts((prevPosts) => prevPosts.filter((p) => p._id !== deletedPostId));
    },
    [setPosts]
  );

  const observer = useRef();

  useEffect(() => {
    if (!token) {
      navigate("/login");
    } else {
      fetchPosts(true);
    }
  }, [token]);

  const lastPostElementRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          fetchPosts(false);
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, hasMore, fetchPosts]
  );

  return (
    <div className="_layout _layout_main_wrapper">
      <ToastContainer position="bottom-right" autoClose={3000} theme="dark" />

      <div className="_main_layout">
        <Header user={user} />

        <div className="container _custom_container">
          <div className="_layout_inner_wrap">
            <div className="row">
              <LeftSidebar />
              <div className="col-xl-6 col-lg-6 col-md-12 col-sm-12">
                <div className="_layout_middle_wrap">
                  <Stories user={user} />

                  <CreatePost />

                  {posts.map((post, index) => {
                    if (posts.length === index + 1) {
                      return (
                        <div ref={lastPostElementRef} key={post._id}>
                          <PostItem post={post} onDelete={handlePostDelete} />
                        </div>
                      );
                    } else {
                      return (
                        <PostItem
                          key={post._id}
                          post={post}
                          onDelete={handlePostDelete}
                        />
                      );
                    }
                  })}

                  {loading && (
                    <div className="text-center mt-4 mb-4">
                      <div
                        className="spinner-border text-primary"
                        role="status"
                      >
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  )}

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

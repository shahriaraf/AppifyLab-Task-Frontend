import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useFeed } from '../context/FeedContext';
// Hooks Import


const CreatePost = () => {
  const [content, setContent] = useState("");
  const [file, setFile] = useState(null);
  const [privacy, setPrivacy] = useState("public");
  
  const { user } = useAuth();
  const { createPost } = useFeed();

  const handleSubmit = async () => {
    if (!content && !file) return;
    
    const formData = new FormData();
    formData.append("content", content);
    formData.append("privacy", privacy);
    if (file) formData.append("image", file);

    await createPost(formData); // Action via Context
    
    // Reset Form
    setContent("");
    setFile(null);
    setPrivacy("public");
  };

  return (
    <div className="_feed_inner_text_area _b_radious6 _padd_b24 _padd_t24 _padd_r24 _padd_l24 _mar_b16">
        <div className="_feed_inner_text_area_box">
            <div className="_feed_inner_text_area_box_image">
                <img src={user?.profilePic || "/assets/images/profile.png"} alt="Image" className="_txt_img" />
            </div>
            <div className="form-floating _feed_inner_text_area_box_form">
                <textarea className="form-control _textarea" placeholder="Write something..." value={content} onChange={e => setContent(e.target.value)}></textarea>
                <label className="_feed_textarea_label">Write something ...</label>
            </div>
        </div>
        <div className="_feed_inner_text_area_bottom">
            <div className="_feed_inner_text_area_item" style={{display:'flex', alignItems:'center', gap:'15px'}}>
                <label className="_feed_inner_text_area_bottom_photo_link cursor-pointer"> 
                    <span className="_feed_inner_text_area_bottom_photo_iamge _mar_img"> 
                       <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 20 20"><path fill="#666" d="M13.916 0c3.109 0 5.18 2.429 5.18 5.914v8.17c0 3.486-2.072 5.916-5.18 5.916H5.999C2.89 20 .827 17.572.827 14.085v-8.17C.827 2.43 2.897 0 6 0h7.917zm0 1.504H5.999c-2.321 0-3.799 1.735-3.799 4.41v8.17c0 2.68 1.472 4.412 3.799 4.412h7.917c2.328 0 3.807-1.734 3.807-4.411v-8.17c0-2.678-1.478-4.411-3.807-4.411zm.65 8.68l.12.125 1.9 2.147a.803.803 0 01-.016 1.063.642.642 0 01-.894.058l-.076-.074-1.9-2.148a.806.806 0 00-1.205-.028l-.074.087-2.04 2.717c-.722.963-2.02 1.066-2.86.26l-.111-.116-.814-.91a.562.562 0 00-.793-.07l-.075.073-1.4 1.617a.645.645 0 01-.97.029.805.805 0 01-.09-.977l.064-.086 1.4-1.617c.736-.852 1.95-.897 2.734-.137l.114.12.81.905a.587.587 0 00.861.033l.07-.078 2.04-2.718c.81-1.08 2.27-1.19 3.205-.275zM6.831 4.64c1.265 0 2.292 1.125 2.292 2.51 0 1.386-1.027 2.511-2.292 2.511S4.54 8.537 4.54 7.152c0-1.386 1.026-2.51 2.291-2.51zm0 1.504c-.507 0-.918.451-.918 1.007 0 .555.411 1.006.918 1.006.507 0 .919-.451.919-1.006 0-.556-.412-1.007-.919-1.007z"/></svg>
                    </span>
                    {file ? "Image Selected" : "Photo/Video"}
                    <input type="file" hidden onChange={(e) => setFile(e.target.files[0])} />
                </label>
                <select className="form-select form-select-sm" style={{border:'none', background:'transparent'}} value={privacy} onChange={(e)=>setPrivacy(e.target.value)}>
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                </select>
            </div>
            <div className="_feed_inner_text_area_btn">
                <button type="button" onClick={handleSubmit} className="_feed_inner_text_area_btn_link"><span>Post</span></button>
            </div>
        </div>
    </div>
  );
};

export default CreatePost;
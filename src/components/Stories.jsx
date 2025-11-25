import { useRef } from "react";

const Stories = ({ user }) => {
  const desktopScrollRef = useRef(null);
  const mobileScrollRef = useRef(null);

  const friends = [
    {
      name: "Ryan Roslansky",
      profilePic: "/assets/images/card_ppl2.png",
      miniPic: "/assets/images/mini_pic.png",
    },
    {
      name: "Jane Doe",
      profilePic: "/assets/images/card_ppl3.png",
      miniPic: "/assets/images/mini_pic.png",
    },
    {
      name: "John Smith",
      profilePic: "/assets/images/card_ppl4.png",
      miniPic: "/assets/images/mini_pic.png",
    },
    {
      name: "Emily Johnson",
      profilePic: "/assets/images/card_ppl2.png",
      miniPic: "/assets/images/mini_pic.png",
    },
    {
      name: "Michael Brown",
      profilePic: "/assets/images/card_ppl3.png",
      miniPic: "/assets/images/mini_pic.png",
    },
    {
      name: "Sarah Davis",
      profilePic: "/assets/images/card_ppl4.png",
      miniPic: "/assets/images/mini_pic.png",
    },
    {
      name: "David Wilson",
      profilePic: "/assets/images/card_ppl2.png",
      miniPic: "/assets/images/mini_pic.png",
    },
    {
      name: "Laura Martinez",
      profilePic: "/assets/images/card_ppl3.png",
      miniPic: "/assets/images/mini_pic.png",
    },
    {
      name: "Chris Lee",
      profilePic: "/assets/images/card_ppl4.png",
      miniPic: "/assets/images/mini_pic.png",
    },
    {
      name: "Anna Kim",
      profilePic: "/assets/images/card_ppl2.png",
      miniPic: "/assets/images/mini_pic.png",
    },
  ];

  const scrollDesktop = (direction) => {
    if (desktopScrollRef.current) {
      desktopScrollRef.current.scrollBy({
        left: direction === "left" ? -200 : 200,
        behavior: "smooth",
      });
    }
  };

  const cardStyle = {
    flex: "0 0 calc(25% - 9px)",
    maxWidth: "calc(25% - 9px)",
  };

  // Shared style for the circle buttons
  const arrowBtnStyle = {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    zIndex: 10,
    width: "24px",
    height: "24px",
    borderRadius: "50%",
    backgroundColor: "#1877F2",
    border: "1px solid #fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
    outline: "none",
  };

  return (
    <>
      <div
        className="_feed_inner_ppl_card _mar_b16"
        style={{ position: "relative" }}
      >
        <button
          type="button"
          onClick={() => scrollDesktop("left")}
          style={{ ...arrowBtnStyle, left: "15px" }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#fff"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
        </button>
        <button
          type="button"
          onClick={() => scrollDesktop("right")}
          style={{ ...arrowBtnStyle, right: "15px" }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#fff"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </button>

        <div
          className="_feed_inner_story_row"
          ref={desktopScrollRef}
          style={{
            display: "flex",
            overflowX: "auto",
            gap: "12px",
            padding: "8px 0",
            scrollbarWidth: "none",
          }}
        >
          <style>{`
            ._feed_inner_story_row::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          <div style={cardStyle}>
            <div
              className="_feed_inner_profile_story _b_radious6"
              style={{ width: "100%", height: "100%" }}
            >
              <div className="_feed_inner_profile_story_image">
                <img
                  src={user?.profilePic || "/assets/images/card_ppl1.png"}
                  alt="Your Story"
                  className="_profile_story_img"
                  style={{ width: "100%", objectFit: "cover" }}
                />
                <div className="_feed_inner_story_txt">
                  <div className="_feed_inner_story_btn">
                    <button className="_feed_inner_story_btn_link">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        fill="none"
                        viewBox="0 0 14 14"
                      >
                        <path
                          stroke="#fff"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M7 1v12M1 7h12"
                        />
                      </svg>
                    </button>
                  </div>
                  <p className="_feed_inner_story_para">Your Story</p>
                </div>
              </div>
            </div>
          </div>

          {/* Friend Stories */}
          {friends.map((f, idx) => (
            <div key={idx} style={cardStyle}>
              <div
                className="_feed_inner_public_story _b_radious6"
                style={{ width: "100%", height: "100%" }}
              >
                <div className="_feed_inner_public_story_image">
                  <img
                    src={f.profilePic}
                    alt={f.name}
                    className="_public_story_img"
                    style={{ width: "100%", objectFit: "cover" }}
                  />
                  <div className="_feed_inner_pulic_story_txt">
                    <p className="_feed_inner_pulic_story_para">{f.name}</p>
                  </div>
                  <div className="_feed_inner_public_mini">
                    <img
                      src={f.miniPic}
                      alt="Mini"
                      className="_public_mini_img"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="_feed_inner_ppl_card_mobile _mar_b16">
        <div
          className="_feed_inner_ppl_card_area"
          ref={mobileScrollRef}
          style={{ overflowX: "auto", whiteSpace: "nowrap", marginTop: "15px" }}
        >
          <ul
            className="_feed_inner_ppl_card_area_list"
            style={{ display: "flex", gap: "8px", padding: 0, margin: 0 }}
          >
            <li className="_feed_inner_ppl_card_area_item">
              <a href="#0" className="_feed_inner_ppl_card_area_link">
                <div className="_feed_inner_ppl_card_area_story">
                  <img
                    src={
                      user?.profilePic || "/assets/images/mobile_story_img.png"
                    }
                    alt="Your Story"
                    className="_card_story_img"
                  />
                  <div className="_feed_inner_ppl_btn">
                    <button className="_feed_inner_ppl_btn_link" type="button">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="12"
                        height="12"
                        fill="none"
                        viewBox="0 0 12 12"
                      >
                        <path
                          stroke="#fff"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 2.5v7M2.5 6h7"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
                <p className="_feed_inner_ppl_card_area_link_txt">Your Story</p>
              </a>
            </li>
            {friends.map((f, idx) => (
              <li key={idx} className="_feed_inner_ppl_card_area_item">
                <a href="#0" className="_feed_inner_ppl_card_area_link">
                  <div className="_feed_inner_ppl_card_area_story_active">
                    <img
                      src={f.profilePic}
                      alt={f.name}
                      className="_card_story_img1"
                    />
                  </div>
                  <p className="_feed_inner_ppl_card_area_txt">{f.name}</p>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
};

export default Stories;

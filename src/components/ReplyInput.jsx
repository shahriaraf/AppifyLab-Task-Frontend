import { useState, memo } from 'react';

const ReplyInput = ({ userProfilePic, targetName, onSubmit, onCancel }) => {
    const [text, setText] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if(!text.trim()) return;
        onSubmit(text);
        setText('');
    };

    return (
        <div style={{ marginTop: '5px', display: 'flex', alignItems: 'center' }}>
            <img 
                src={userProfilePic || '/assets/images/profile.png'} 
                alt="" 
                style={{ width: '24px', height: '24px', borderRadius: '50%', marginRight: '8px' }} 
            />
            <form onSubmit={handleSubmit} style={{ flex: 1 }}>
                <input
                    autoFocus
                    placeholder={`Reply to ${targetName}...`}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onBlur={() => !text && onCancel()} 
                    style={{ 
                        width: '100%', height: '32px', padding: '0 10px', 
                        fontSize: '13px', borderRadius: '16px', 
                        background: '#f0f2f5', border: 'none', outline: 'none' 
                    }}
                />
            </form>
        </div>
    );
};

export default memo(ReplyInput);
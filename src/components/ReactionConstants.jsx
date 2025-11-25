
export const REACTION_ICONS = {
    Like: (
        <svg width="18" height="18" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="12" fill="#1877F2" stroke="white" strokeWidth="2"/>
            <path fill="white" d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" transform="translate(2, 2) scale(0.8)"/>
        </svg>
    ),
    Love: (
        <svg width="18" height="18" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="12" fill="#F33E58" stroke="white" strokeWidth="2"/>
            <path fill="white" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" transform="scale(0.7) translate(5,5)"/>
        </svg>
    ),
    Haha: (
        <svg width="18" height="18" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="12" fill="#F7B125" stroke="white" strokeWidth="2"/>
            <path d="M15.5 11a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM8.5 11a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" fill="#3e3e3e"/>
            <path d="M12 18c2.5 0 4.5-1.5 4.5-3.5H7.5c0 2 2 3.5 4.5 3.5z" fill="#3e3e3e"/>
        </svg>
    ),
    Wow: (
        <svg width="18" height="18" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="12" fill="#F7B125" stroke="white" strokeWidth="2"/>
            <circle cx="8.5" cy="10.5" r="1.5" fill="#3e3e3e"/>
            <circle cx="15.5" cy="10.5" r="1.5" fill="#3e3e3e"/>
            <ellipse cx="12" cy="16" rx="2.5" ry="3.5" fill="#3e3e3e"/>
        </svg>
    ),
    Sad: (
        <svg width="18" height="18" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="12" fill="#F7B125" stroke="white" strokeWidth="2"/>
            <circle cx="8.5" cy="10.5" r="1.5" fill="#3e3e3e"/>
            <circle cx="15.5" cy="10.5" r="1.5" fill="#3e3e3e"/>
            <path d="M15.5 17a3.5 3.5 0 0 0-7 0" stroke="#3e3e3e" strokeWidth="1.5" fill="none"/>
        </svg>
    ),
    Angry: (
        <svg width="18" height="18" viewBox="0 0 24 24">
            <defs>
                <linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style={{stopColor:'#ff7a00', stopOpacity:1}} />
                    <stop offset="100%" style={{stopColor:'#ff3d00', stopOpacity:1}} />
                </linearGradient>
            </defs>
            <circle cx="12" cy="12" r="12" fill="url(#grad1)" stroke="white" strokeWidth="2"/>
            <path d="M7.5 9.5l2 1m5-1l2-1" stroke="#3e3e3e" strokeWidth="1.5" strokeLinecap="round"/>
            <circle cx="8.5" cy="12.5" r="1" fill="#3e3e3e"/>
            <circle cx="15.5" cy="12.5" r="1" fill="#3e3e3e"/>
            <path d="M9.5 17a2.5 2.5 0 0 1 5 0" stroke="#3e3e3e" strokeWidth="1.5" fill="none"/>
        </svg>
    )
};

export const getReactionLabel = (type) => {
    const styles = { 
        Like: { color: '#2078f4', label: 'Like' }, 
        Love: { color: '#f33e58', label: 'Love' }, 
        Haha: { color: '#f7b125', label: 'Haha' }, 
        Wow:  { color: '#f7b125', label: 'Wow' }, 
        Sad:  { color: '#f7b125', label: 'Sad' }, 
        Angry:{ color: '#e9710f', label: 'Angry' } 
    };
    return styles[type] || styles['Like'];
};
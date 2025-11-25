import React from 'react';
import { REACTION_ICONS } from './ReactionConstants';

const ReactionPicker = ({ onSelect, onClose }) => {
    return (
        <>
            {/* Invisible Backdrop to close when clicking outside */}
            <div 
                onClick={(e) => { e.stopPropagation(); onClose(); }}
                style={{
                    position: 'fixed',
                    top: 0, left: 0, width: '100vw', height: '100vh',
                    zIndex: 99, cursor: 'default'
                }}
            />

            {/* The Picker Box */}
            <div style={{
                position: 'absolute',
                bottom: '25px', 
                left: '-10px',
                backgroundColor: 'white',
                borderRadius: '50px',
                padding: '4px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                display: 'flex',
                gap: '4px',
                zIndex: 100,
                border: '1px solid #e1e1e1',
                animation: 'fadeIn 0.2s ease-out'
            }}>
                {Object.entries(REACTION_ICONS).map(([type, icon]) => (
                    <div 
                        key={type}
                        onClick={(e) => { e.stopPropagation(); onSelect(type); }}
                        style={{
                            cursor: 'pointer',
                            transition: 'transform 0.2s',
                            padding: '4px'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.3)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        title={type}
                    >
                        <div style={{ transform: 'scale(1.6)' }}>{icon}</div>
                    </div>
                ))}
            </div>
            
           {/* animation keyframes */}
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </>
    );
};

export default ReactionPicker;
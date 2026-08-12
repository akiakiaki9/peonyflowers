'use client'

import './videoBackground.css'

export default function VideoBackground({ children }) {
    return (
        <div className="video-wrapper">
            <video
                className="video-bg"
                autoPlay
                loop
                muted
                playsInline
                poster="/images/poster.jpg"
            >
                <source src="/videos/flowers-bg.mp4" type="video/mp4" />
            </video>
            <div className="video-overlay"></div>
            <div className="video-content">
                {children}
            </div>
        </div>
    )
}
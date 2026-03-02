'use client';

import React, { useEffect } from 'react';

interface Props {
    slot: string;
    format?: 'auto' | 'fluid' | 'rectangle';
    className?: string;
    style?: React.CSSProperties;
}

declare global {
    interface Window {
        adsbygoogle: any[];
    }
}

export default function AdUnit({ slot, format = 'auto', className = '', style }: Props) {
    const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

    useEffect(() => {
        if (!adsenseId) return;
        try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (e) {
            console.error('AdSense error:', e);
        }
    }, [adsenseId]);

    if (!adsenseId) return null;

    return (
        <div className={`ad-container my-8 overflow-hidden flex justify-center ${className}`}>
            <ins
                className="adsbygoogle"
                style={style || { display: 'block' }}
                data-ad-client={adsenseId}
                data-ad-slot={slot}
                data-ad-format={format}
                data-full-width-responsive="true"
            />
        </div>
    );
}

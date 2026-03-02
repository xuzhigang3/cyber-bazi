import React from 'react';

export default function JsonLd() {
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "Service",
        "name": "Cyber Bazi AI Analysis",
        "description": "Professional Chinese Bazi (Four Pillars of Destiny) analysis powered by Artificial Intelligence.",
        "provider": {
            "@type": "Organization",
            "name": "Cyber Bazi",
            "url": "https://cyber-bazi.kaiserxu.asia"
        },
        "serviceType": "Astrology and Fortune Telling",
        "areaServed": "Worldwide",
        "offers": {
            "@type": "Offer",
            "price": "9.90",
            "priceCurrency": "USD",
            "availability": "https://schema.org/InStock"
        },
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.9",
            "reviewCount": "1250"
        }
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
    );
}

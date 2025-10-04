export const dynamic = 'force-static'

export default function manifest() {
    return {
        name: 'ALX Ethiopia Recruitment Tracker',
        short_name: 'ALX Recruitment',
        description: 'ALX Ethiopia recruitment tracking system for managing referral campaigns and monitoring performance.',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#00ff88',
        icons: [
            {
                src: '/alx-logo.png',
                sizes: 'any',
                type: 'image/png',
            },
            {
                src: '/alx-logo.png',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/alx-logo.png',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
    }
}
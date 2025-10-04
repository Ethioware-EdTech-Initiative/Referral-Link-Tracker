import { redirect } from 'next/navigation'

export const dynamic = 'force-static'

export default function AppleIcon() {
    redirect('/alx-logo.png')
}
import { redirect } from 'next/navigation'

export const dynamic = 'force-static'

export default function Icon() {
    redirect('/alx-logo.png')
}
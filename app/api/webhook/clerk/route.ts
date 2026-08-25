import { verifyWebhook } from '@clerk/nextjs/webhooks'
import { NextRequest } from 'next/server'
import { createUser, updateUser, deleteUser } from '@/lib/db/queries'

export async function POST(req: NextRequest) {
    try {
        const evt = await verifyWebhook(req)

        const eventType = evt.type
        console.log(`Webhook received: ${eventType}`)

        if (eventType === 'user.created') {
            const { id, email_addresses, first_name, last_name, image_url } = evt.data
            const primaryEmail = email_addresses?.[0]?.email_address

            if (!primaryEmail) {
                console.error('No email found for user:', id)
                return new Response('No email found', { status: 400 })
            }

            await createUser({
                clerkId: id,
                email: primaryEmail,
                firstName: first_name ?? null,
                lastName: last_name ?? null,
                imageUrl: image_url ?? null,
            })

            console.log('User created in DB:', id)
        }

        if (eventType === 'user.updated') {
            const { id, email_addresses, first_name, last_name, image_url } = evt.data
            const primaryEmail = email_addresses?.[0]?.email_address

            await updateUser(id, {
                email: primaryEmail,
                firstName: first_name ?? null,
                lastName: last_name ?? null,
                imageUrl: image_url ?? null,
            })

            console.log('User updated in DB:', id)
        }

        if (eventType === 'user.deleted') {
            const { id } = evt.data

            if (id) {
                await deleteUser(id)
                console.log('User deleted from DB:', id)
            }
        }

        return new Response('Webhook received', { status: 200 })
    } catch (err) {
        console.error('Error verifying webhook:', err)
        return new Response('Error verifying webhook', { status: 400 })
    }
}
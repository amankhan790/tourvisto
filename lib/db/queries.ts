import { eq } from 'drizzle-orm'
import { db } from './db'
import { users, type NewUser } from '@/schema'

export async function createUser(data: NewUser) {
    const [user] = await db.insert(users).values(data).returning()
    return user
}

export async function updateUser(clerkId: string, data: Partial<Omit<NewUser, 'clerkId'>>) {
    const [user] = await db
        .update(users)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(users.clerkId, clerkId))
        .returning()
    return user
}

export async function deleteUser(clerkId: string) {
    const [user] = await db
        .delete(users)
        .where(eq(users.clerkId, clerkId))
        .returning()
    return user
}

export async function getUserByClerkId(clerkId: string) {
    const [user] = await db
        .select()
        .from(users)
        .where(eq(users.clerkId, clerkId))
    return user ?? null
}

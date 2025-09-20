import logger from "#config/logger.js";
import bcrypt from 'bcrypt';
import {db} from "#config/database.js";
import {eq} from 'drizzle-orm'
import {users} from '#models/user.model.js';

export const hashPassword = async (password) => {
    try{
        return await bcrypt.hash(password, 12);
    }
    catch(err){
        logger.error('Error hashing the password', err.message);
        throw new Error(`Error hashing the password: ${err.message}`);
    }
}

export const createUser = async ({name, email, password, role='user'}) => {
    try{
        const existedUser = await db.select().from(users).where(eq(users.email, email)).limit(1)
        if(existedUser.length > 0){
            throw new Error(`User with email ${email} already exists`);
        }
        const passwordHash = await hashPassword(password);

        const [user] = await db.
        insert(users).
        values({
            name,
            email,
            password: passwordHash,
            role: role,
        }).returning({
            id:users.id,
            name: users.name,
            email: users.email,
            role: users.role,
            created_at: users.created_at,
        })
        logger.info(`User with email ${user.email} created successfully`);
        return user;
    }
    catch(err){
        logger.error('Error creating the user', err.message);
        throw new Error(`Error creating the user: ${err.message}`);
    }
}
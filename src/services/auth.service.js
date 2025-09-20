import logger from '#config/logger.js';
import bcrypt from 'bcrypt';
import {db} from '#config/database.js';
import {eq} from 'drizzle-orm';
import {users} from '#models/user.model.js';

export const hashPassword = async (password) => {
  try{
    return await bcrypt.hash(password, 12);
  }
  catch(err){
    logger.error('Error hashing the password', err.message);
    throw new Error(`Error hashing the password: ${err.message}`);
  }
};

export const createUser = async ({name, email, password, role='user'}) => {
  try{
    const existedUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
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
        role,
      }).returning({
        id:users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        created_at: users.created_at,
      });
    logger.info(`User with email ${user.email} created successfully`);
    return user;
  }
  catch(err){
    logger.error('Error creating the user', err.message);
    throw new Error(`Error creating the user: ${err.message}`);
  }
};

/**
 * Verify password against hash
 */
export const verifyPassword = async (password, hash) => {
  try {
    return await bcrypt.compare(password, hash);
  } catch (err) {
    logger.error('Error verifying password', err.message);
    throw new Error(`Error verifying password: ${err.message}`);
  }
};

/**
 * Find user by email
 */
export const findUserByEmail = async (email) => {
  try {
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return user || null;
  } catch (err) {
    logger.error('Error finding user by email', err.message);
    throw new Error(`Error finding user: ${err.message}`);
  }
};

/**
 * Find user by ID
 */
export const findUserById = async (id) => {
  try {
    const [user] = await db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      created_at: users.created_at,
      updated_at: users.updated_at
    }).from(users).where(eq(users.id, id)).limit(1);
    return user || null;
  } catch (err) {
    logger.error('Error finding user by ID', err.message);
    throw new Error(`Error finding user: ${err.message}`);
  }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (id, updates) => {
  try {
    const allowedUpdates = ['name'];
    const filteredUpdates = {};
        
    // Only allow specific fields to be updated
    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        filteredUpdates[key] = updates[key];
      }
    });

    if (Object.keys(filteredUpdates).length === 0) {
      throw new Error('No valid fields to update');
    }

    filteredUpdates.updated_at = new Date();

    const [updatedUser] = await db
      .update(users)
      .set(filteredUpdates)
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        created_at: users.created_at,
        updated_at: users.updated_at
      });

    logger.info('User profile updated', { userId: id });
    return updatedUser;
  } catch (err) {
    logger.error('Error updating user profile', err.message);
    throw new Error(`Error updating user profile: ${err.message}`);
  }
};

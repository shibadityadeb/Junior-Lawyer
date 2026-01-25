// Profile service - Deprecated with Clerk migration
// Clerk manages user profiles, so this service is no longer needed
// Keeping for reference in case custom attributes are needed

export interface UserProfile {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  email?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateProfileData {
  id: string; // User ID from auth
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
}

export interface UpdateProfileData {
  name?: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
}

/**
 * Create a new user profile - DEPRECATED
 * Profiles are now managed by Clerk
 */
export const createProfile = async (
  data: CreateProfileData
): Promise<UserProfile | null> => {
  console.log('createProfile called but profile management is now handled by Clerk');
  return null;
};

/**
 * Get user profile by user ID - DEPRECATED
 * Profiles are now managed by Clerk
 */
export const getProfileById = async (userId: string): Promise<UserProfile | null> => {
  console.log('getProfileById called but profile management is now handled by Clerk');
  return null;
};

/**
 * Update user profile - DEPRECATED
 * Profiles are now managed by Clerk
 */
export const updateProfile = async (
  userId: string,
  data: UpdateProfileData
): Promise<UserProfile | null> => {
  console.log('updateProfile called but profile management is now handled by Clerk');
  return null;
};

/**
 * Create profile for Google OAuth user - DEPRECATED
 * Profiles are now managed by Clerk
 */
export const createGoogleProfile = async (
  userId: string,
  name: string,
  email: string
): Promise<UserProfile | null> => {
  console.log('createGoogleProfile called but profile management is now handled by Clerk');
  return null;
};

/**
 * Delete user profile - DEPRECATED
 * Profiles are now managed by Clerk
 */
export const deleteProfile = async (userId: string): Promise<void> => {
  console.log('deleteProfile called but profile management is now handled by Clerk');
};

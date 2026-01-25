import { supabase } from '../config/supabase';

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
  id: string; // User ID from auth.users
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
 * Create a new user profile
 * Called after user is created in Supabase Auth
 */
export const createProfile = async (
  data: CreateProfileData
): Promise<UserProfile | null> => {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .insert({
        id: data.id,
        name: data.name,
        age: data.age,
        gender: data.gender,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating profile:', error);
      throw error;
    }

    return profile;
  } catch (error) {
    console.error('Unexpected error in createProfile:', error);
    throw error;
  }
};

/**
 * Get user profile by user ID
 */
export const getProfileById = async (userId: string): Promise<UserProfile | null> => {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      // If profile doesn't exist, return null (not an error)
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Error fetching profile:', error);
      throw error;
    }

    return profile;
  } catch (error) {
    console.error('Unexpected error in getProfileById:', error);
    throw error;
  }
};

/**
 * Update user profile
 */
export const updateProfile = async (
  userId: string,
  data: UpdateProfileData
): Promise<UserProfile | null> => {
  try {
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (data.name !== undefined) updateData.name = data.name;
    if (data.age !== undefined) updateData.age = data.age;
    if (data.gender !== undefined) updateData.gender = data.gender;

    const { data: profile, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating profile:', error);
      throw error;
    }

    return profile;
  } catch (error) {
    console.error('Unexpected error in updateProfile:', error);
    throw error;
  }
};

/**
 * Create profile for Google OAuth user
 * Called after Google login if profile doesn't exist
 */
export const createGoogleProfile = async (
  userId: string,
  name: string,
  email: string
): Promise<UserProfile | null> => {
  try {
    // Check if profile already exists
    const existingProfile = await getProfileById(userId);
    if (existingProfile) {
      return existingProfile;
    }

    // Create profile with defaults for Google users
    const { data: profile, error } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        name: name,
        age: null, // Google doesn't provide age
        gender: null, // Google doesn't provide gender
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating Google profile:', error);
      throw error;
    }

    return profile;
  } catch (error) {
    console.error('Unexpected error in createGoogleProfile:', error);
    throw error;
  }
};

/**
 * Delete user profile
 */
export const deleteProfile = async (userId: string): Promise<void> => {
  try {
    const { error } = await supabase.from('profiles').delete().eq('id', userId);

    if (error) {
      console.error('Error deleting profile:', error);
      throw error;
    }
  } catch (error) {
    console.error('Unexpected error in deleteProfile:', error);
    throw error;
  }
};

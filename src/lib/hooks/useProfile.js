// lib/hooks/useProfile.js - Week 4

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getProfile, 
  updateProfile, 
  changePassword,
  updatePreferences,
  deleteAccount 
} from '../api/users.js';
import { toast } from 'sonner';

/**
 * Hook to get user profile
 */
export const useProfile = () => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: getProfile,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1
  });
};

/**
 * Hook to update user profile
 */
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProfile,
    onSuccess: (response) => {
      // Update cache
      queryClient.setQueryData(['profile'], (oldData) => ({
        ...oldData,
        data: {
          ...oldData?.data,
          user: response.data
        }
      }));
      
      toast.success('הפרופיל עודכן בהצלחה');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'שגיאה בעדכון פרופיל';
      toast.error(message);
    }
  });
};

/**
 * Hook to change password
 */
export const useChangePassword = () => {
  return useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      toast.success('הסיסמה שונתה בהצלחה');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'שגיאה בשינוי סיסמה';
      toast.error(message);
    }
  });
};

/**
 * Hook to update user preferences
 */
export const useUpdatePreferences = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updatePreferences,
    onSuccess: (response) => {
      // Update cache
      queryClient.setQueryData(['profile'], (oldData) => ({
        ...oldData,
        data: {
          ...oldData?.data,
          user: {
            ...oldData?.data?.user,
            preferences: response.data
          }
        }
      }));
      
      toast.success('ההעדפות עודכנו בהצלחה');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'שגיאה בעדכון העדפות';
      toast.error(message);
    }
  });
};

/**
 * Hook to delete account
 */
export const useDeleteAccount = () => {
  return useMutation({
    mutationFn: deleteAccount,
    onSuccess: () => {
      toast.success('החשבון נמחק בהצלחה');
      // Redirect to logout
      setTimeout(() => {
        window.location.href = '/logout';
      }, 2000);
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'שגיאה במחיקת חשבון';
      toast.error(message);
    }
  });
};
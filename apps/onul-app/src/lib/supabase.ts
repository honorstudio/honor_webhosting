import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import { Database } from '../types/database';

const supabaseUrl = 'https://szibgustboctptotffbr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6aWJndXN0Ym9jdHB0b3RmZmJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwNzEzNzUsImV4cCI6MjA3OTY0NzM3NX0.feAIjnAhu33LxawsulBZOU7n_Kgvj7V9F0iLtWsIvGs';

// 웹용 localStorage 래퍼
const webStorage = {
  getItem: (key: string) => {
    if (typeof window !== 'undefined') {
      return Promise.resolve(window.localStorage.getItem(key));
    }
    return Promise.resolve(null);
  },
  setItem: (key: string, value: string) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(key, value);
    }
    return Promise.resolve();
  },
  removeItem: (key: string) => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(key);
    }
    return Promise.resolve();
  },
};

// 웹에서는 localStorage, 모바일에서는 AsyncStorage 사용
const storage = Platform.OS === 'web' ? webStorage : AsyncStorage;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: storage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

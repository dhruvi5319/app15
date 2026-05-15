export const validators = {
  email: (value: string): string | null => {
    if (!value) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Invalid email address';
    return null;
  },
  password: (value: string): string | null => {
    if (!value) return 'Password is required';
    if (value.length < 8) return 'Password must be at least 8 characters';
    return null;
  },
  required: (value: string, label = 'Field'): string | null => {
    if (!value?.trim()) return `${label} is required`;
    return null;
  },
};

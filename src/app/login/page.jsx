'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import GoogleSignInButton from '@/components/auth/GoogleSignInButton';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(formData);
      router.push('/');
    } catch (err) {
      setError(err.message || 'שגיאה בהתחברות. נסה שוב.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-12">
          <Link href="/" className="inline-block">
            <Image
              src="/logo-full.svg"
              alt="TORINO"
              width={180}
              height={50}
              priority
              className="mx-auto"
            />
          </Link>
        </div>

        {/* Main Card */}
        <div className="border border-neutral-200 p-8">
          <h1 className="text-2xl font-light tracking-wide text-center mb-8">התחברות</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Google Sign-In Button */}
            <div className="space-y-5">
              <GoogleSignInButton />

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-neutral-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-neutral-500 font-light">או התחבר באימייל</span>
                </div>
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-light tracking-wide">
                אימייל
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="your@email.com"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-neutral-200 focus:outline-none focus:border-black transition-colors font-light"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-light tracking-wide">
                סיסמה
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-neutral-200 focus:outline-none focus:border-black transition-colors font-light"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 text-sm font-light">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white font-light tracking-wide py-3 px-4 hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'מתחבר...' : 'התחבר'}
            </button>
          </form>
        </div>

        {/* Footer Links */}
        <div className="text-center mt-8">
          <p className="text-neutral-600 font-light">
            אין לך חשבון?{' '}
            <Link href="/register" className="text-black hover:opacity-70 transition-opacity">
              הירשם עכשיו
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
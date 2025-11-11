'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import GoogleSignInButton from '@/components/auth/GoogleSignInButton';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
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

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('הסיסמאות לא תואמות');
      return;
    }

    if (formData.password.length < 6) {
      setError('הסיסמה חייבת להיות לפחות 6 תווים');
      return;
    }

    setLoading(true);

    try {
      await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      });
      router.push('/');
    } catch (err) {
      setError(err.message || 'שגיאה ברישום. נסה שוב.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
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
          <h1 className="text-2xl font-light tracking-wide text-center mb-8">הרשמה</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Google Sign-In Button */}
            <div className="space-y-5">
              <GoogleSignInButton />

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-neutral-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-neutral-500 font-light">או הרשם באימייל</span>
                </div>
              </div>
            </div>

            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="firstName" className="block text-sm font-light tracking-wide">
                  שם פרטי
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  placeholder="שם"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-neutral-200 focus:outline-none focus:border-black transition-colors font-light"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="lastName" className="block text-sm font-light tracking-wide">
                  שם משפחה
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  placeholder="משפחה"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-neutral-200 focus:outline-none focus:border-black transition-colors font-light"
                />
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

            {/* Phone Field - Optional */}
            <div className="space-y-2">
              <label htmlFor="phone" className="block text-sm font-light tracking-wide">
                טלפון <span className="text-neutral-400">(אופציונלי)</span>
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                placeholder="050-1234567"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-neutral-200 focus:outline-none focus:border-black transition-colors font-light"
              />
              <p className="text-xs text-neutral-500 font-light">ניתן להשלים במעמד ההזמנה</p>
            </div>

            {/* Password Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-light tracking-wide">
                  סיסמה
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="לפחות 6 תווים"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-neutral-200 focus:outline-none focus:border-black transition-colors font-light"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="block text-sm font-light tracking-wide">
                  אימות סיסמה
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  placeholder="הזן שוב"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-neutral-200 focus:outline-none focus:border-black transition-colors font-light"
                />
              </div>
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
              {loading ? 'רושם...' : 'הירשם'}
            </button>

            {/* Terms */}
            <p className="text-xs text-neutral-500 text-center font-light">
              בהרשמה, אתה מסכים ל
              <Link href="/terms" className="text-black hover:opacity-70 transition-opacity mx-1">
                תנאי השימוש
              </Link>
              ול
              <Link href="/privacy" className="text-black hover:opacity-70 transition-opacity mx-1">
                מדיניות הפרטיות
              </Link>
            </p>
          </form>
        </div>

        {/* Footer Links */}
        <div className="text-center mt-8">
          <p className="text-neutral-600 font-light">
            כבר יש לך חשבון?{' '}
            <Link href="/login" className="text-black hover:opacity-70 transition-opacity">
              התחבר
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import GoogleSignInButton from './GoogleSignInButton';

export default function AuthModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('login');
  const { login, register } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });

  const [registerData, setRegisterData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const handleLoginChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegisterChange = (e) => {
    setRegisterData({
      ...registerData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(loginData);
      onClose();
      router.refresh();
    } catch (err) {
      setError(err.message || 'שגיאה בהתחברות. נסה שוב.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (registerData.password !== registerData.confirmPassword) {
      setError('הסיסמאות לא תואמות');
      return;
    }

    if (registerData.password.length < 6) {
      setError('הסיסמה חייבת להיות לפחות 6 תווים');
      return;
    }

    setLoading(true);

    try {
      await register({
        firstName: registerData.firstName,
        lastName: registerData.lastName,
        email: registerData.email,
        phone: registerData.phone,
        password: registerData.password,
      });
      onClose();
      router.refresh();
    } catch (err) {
      setError(err.message || 'שגיאה ברישום. נסה שוב.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] bg-white shadow-xl max-h-[90vh] overflow-y-auto">
          {/* Close Button */}
          <Dialog.Close className="absolute top-4 left-4 z-10 rounded-full p-1 hover:bg-neutral-100 transition-colors">
            <X className="h-6 w-6 text-neutral-600" />
            <span className="sr-only">סגור</span>
          </Dialog.Close>

          {/* Logo */}
          <div className="text-center pt-8 pb-6 px-8">
            <Link href="/" onClick={onClose}>
              <Image
                src="/logo-full.svg"
                alt="TORINO"
                width={140}
                height={40}
                priority
                className="mx-auto"
              />
            </Link>
          </div>

          {/* Hidden title for accessibility */}
          <Dialog.Title className="sr-only">התחברות והרשמה</Dialog.Title>

          {/* Tabs */}
          <div className="flex border-b border-neutral-200">
            <button
              onClick={() => {
                setActiveTab('login');
                setError('');
              }}
              className={`flex-1 py-3 text-center font-light tracking-wide transition-colors ${
                activeTab === 'login'
                  ? 'border-b-2 border-black text-black'
                  : 'text-neutral-500 hover:text-black'
              }`}
            >
              התחברות
            </button>
            <button
              onClick={() => {
                setActiveTab('register');
                setError('');
              }}
              className={`flex-1 py-3 text-center font-light tracking-wide transition-colors ${
                activeTab === 'register'
                  ? 'border-b-2 border-black text-black'
                  : 'text-neutral-500 hover:text-black'
              }`}
            >
              הרשמה
            </button>
          </div>

          {/* Content */}
          <div className="p-8">
            {activeTab === 'login' ? (
              <form onSubmit={handleLoginSubmit} className="space-y-6">
                <div className="space-y-5">
                  <GoogleSignInButton />
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-neutral-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white text-neutral-500 font-light">
                        או התחבר באימייל
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="login-email" className="block text-sm font-light tracking-wide">
                    אימייל
                  </label>
                  <input
                    id="login-email"
                    name="email"
                    type="email"
                    required
                    placeholder="your@email.com"
                    value={loginData.email}
                    onChange={handleLoginChange}
                    className="w-full px-4 py-3 border border-neutral-200 focus:outline-none focus:border-black transition-colors font-light"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="login-password" className="block text-sm font-light tracking-wide">
                    סיסמה
                  </label>
                  <input
                    id="login-password"
                    name="password"
                    type="password"
                    required
                    placeholder="••••••••"
                    value={loginData.password}
                    onChange={handleLoginChange}
                    className="w-full px-4 py-3 border border-neutral-200 focus:outline-none focus:border-black transition-colors font-light"
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 text-sm font-light">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-black text-white font-light tracking-wide py-3 px-4 hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'מתחבר...' : 'התחבר'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="space-y-6">
                <div className="space-y-5">
                  <GoogleSignInButton />
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-neutral-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white text-neutral-500 font-light">
                        או הרשם באימייל
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="register-firstName" className="block text-sm font-light tracking-wide">
                      שם פרטי
                    </label>
                    <input
                      id="register-firstName"
                      name="firstName"
                      type="text"
                      required
                      placeholder="שם"
                      value={registerData.firstName}
                      onChange={handleRegisterChange}
                      className="w-full px-4 py-3 border border-neutral-200 focus:outline-none focus:border-black transition-colors font-light"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="register-lastName" className="block text-sm font-light tracking-wide">
                      שם משפחה
                    </label>
                    <input
                      id="register-lastName"
                      name="lastName"
                      type="text"
                      required
                      placeholder="משפחה"
                      value={registerData.lastName}
                      onChange={handleRegisterChange}
                      className="w-full px-4 py-3 border border-neutral-200 focus:outline-none focus:border-black transition-colors font-light"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="register-email" className="block text-sm font-light tracking-wide">
                    אימייל
                  </label>
                  <input
                    id="register-email"
                    name="email"
                    type="email"
                    required
                    placeholder="your@email.com"
                    value={registerData.email}
                    onChange={handleRegisterChange}
                    className="w-full px-4 py-3 border border-neutral-200 focus:outline-none focus:border-black transition-colors font-light"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="register-phone" className="block text-sm font-light tracking-wide">
                    טלפון <span className="text-neutral-400">(אופציונלי)</span>
                  </label>
                  <input
                    id="register-phone"
                    name="phone"
                    type="tel"
                    placeholder="050-1234567"
                    value={registerData.phone}
                    onChange={handleRegisterChange}
                    className="w-full px-4 py-3 border border-neutral-200 focus:outline-none focus:border-black transition-colors font-light"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="register-password" className="block text-sm font-light tracking-wide">
                      סיסמה
                    </label>
                    <input
                      id="register-password"
                      name="password"
                      type="password"
                      required
                      placeholder="לפחות 6 תווים"
                      value={registerData.password}
                      onChange={handleRegisterChange}
                      className="w-full px-4 py-3 border border-neutral-200 focus:outline-none focus:border-black transition-colors font-light"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="register-confirmPassword" className="block text-sm font-light tracking-wide">
                      אימות סיסמה
                    </label>
                    <input
                      id="register-confirmPassword"
                      name="confirmPassword"
                      type="password"
                      required
                      placeholder="הזן שוב"
                      value={registerData.confirmPassword}
                      onChange={handleRegisterChange}
                      className="w-full px-4 py-3 border border-neutral-200 focus:outline-none focus:border-black transition-colors font-light"
                    />
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 text-sm font-light">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-black text-white font-light tracking-wide py-3 px-4 hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'רושם...' : 'הירשם'}
                </button>

                <p className="text-xs text-neutral-500 text-center font-light">
                  בהרשמה, אתה מסכים ל
                  <Link
                    href="/terms"
                    onClick={onClose}
                    className="text-black hover:opacity-70 transition-opacity mx-1"
                  >
                    תנאי השימוש
                  </Link>
                  ול
                  <Link
                    href="/privacy"
                    onClick={onClose}
                    className="text-black hover:opacity-70 transition-opacity mx-1"
                  >
                    מדיניות הפרטיות
                  </Link>
                </p>
              </form>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

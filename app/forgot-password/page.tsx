'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, Shield, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        setSubmitted(true);
        // In development, show the reset URL
        if (data.resetUrl) {
          console.log('Reset URL:', data.resetUrl);
        }
      } else {
        setError(data.error || 'Failed to send reset email');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="flex items-center">
            <Shield className="h-12 w-12 text-primary" />
            <div className="ml-3">
              <h1 className="text-2xl font-bold text-foreground">AWSCC</h1>
              <p className="text-sm text-muted-foreground">AWS Cloud Club</p>
            </div>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
          Reset Your Password
        </h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Enter your email address and we'll send you a link to reset your password
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-card py-8 px-4 shadow-xl sm:rounded-lg sm:px-10 border border-border">
          {error && (
            <div className="mb-4 bg-destructive/10 border border-destructive/20 rounded-md p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <div className="ml-3">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              </div>
            </div>
          )}

          {message && (
            <div className="mb-4 bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div className="ml-3">
                  <p className="text-sm text-green-800">{message}</p>
                </div>
              </div>
            </div>
          )}

          {!submitted ? (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground">
                  Email address
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-input rounded-md leading-5 bg-background placeholder-muted-foreground text-foreground focus:outline-none focus:placeholder-muted-foreground/70 focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm"
                    placeholder="Enter your email address"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending Reset Link...
                    </div>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center">
              <CheckCircle className="mx-auto h-12 w-12 text-green-600" />
              <h3 className="mt-2 text-sm font-medium text-foreground">Check your email</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                We've sent a password reset link to your email address.
              </p>
              <div className="mt-6">
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setEmail('');
                    setMessage('');
                  }}
                  className="text-sm text-primary hover:text-primary/80"
                >
                  Send another email
                </button>
              </div>
            </div>
          )}

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-background text-muted-foreground">or</span>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="inline-flex items-center text-sm text-primary hover:text-primary/80"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to login
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">
          © 2024 AWS Cloud Club. All rights reserved.
        </p>
      </div>
    </div>
  );
}
import React from 'react';
import { Metadata } from 'next';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { AuthCard } from '@/components/auth/AuthCard';

export const metadata: Metadata = {
  title: 'Sign Up | Brand Visibility Analytics',
  description: 'Create your free account to track brand presence across ChatGPT, Perplexity, Gemini, and Copilot.',
};

export default function SignUpPage() {
  return (
    <AuthLayout mode="signup">
      <AuthCard mode="signup" />
    </AuthLayout>
  );
}

import React from 'react';
import { Metadata } from 'next';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { AuthCard } from '@/components/auth/AuthCard';

export const metadata: Metadata = {
  title: 'Sign In | Brand Visibility Analytics',
  description: 'Sign in to monitor your AI citations, share of voice, and conversational engine rankings.',
};

export default function LoginPage() {
  return (
    <AuthLayout mode="login">
      <AuthCard mode="login" />
    </AuthLayout>
  );
}

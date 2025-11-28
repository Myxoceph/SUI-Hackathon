'use client';

import { useCurrentAccount } from '@mysten/dapp-kit';
import Link from 'next/link';

export default function Home() {
  const account = useCurrentAccount();

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center py-20">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          On-Chain Talent Passport
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Build your verifiable skill profile, complete tasks, and earn non-transferable 
          credentials on the Sui blockchain.
        </p>
        {!account && (
          <p className="text-gray-500">Connect your wallet to get started</p>
        )}
      </section>

      {account && (
        <>
          {/* Quick Actions */}
          <section className="grid md:grid-cols-3 gap-6">
            <Link href="/profile" className="card text-center hover:scale-105 transition-transform">
              <div className="text-4xl mb-4">👤</div>
              <h3 className="text-xl font-semibold mb-2">Your Profile</h3>
              <p className="text-gray-600">View and manage your skill profile</p>
            </Link>

            <Link href="/tasks" className="card text-center hover:scale-105 transition-transform">
              <div className="text-4xl mb-4">📋</div>
              <h3 className="text-xl font-semibold mb-2">Browse Tasks</h3>
              <p className="text-gray-600">Find tasks matching your skills</p>
            </Link>

            <Link href="/tasks/create" className="card text-center hover:scale-105 transition-transform">
              <div className="text-4xl mb-4">➕</div>
              <h3 className="text-xl font-semibold mb-2">Create Task</h3>
              <p className="text-gray-600">Post a new task with rewards</p>
            </Link>
          </section>

          {/* Features */}
          <section>
            <h2 className="text-3xl font-bold text-center mb-8">How It Works</h2>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-2xl">
                  1
                </div>
                <h4 className="font-semibold mb-2">Create Profile</h4>
                <p className="text-sm text-gray-600">Set up your on-chain identity</p>
              </div>
              
              <div className="text-center">
                <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-2xl">
                  2
                </div>
                <h4 className="font-semibold mb-2">Find Tasks</h4>
                <p className="text-sm text-gray-600">Browse and apply to tasks</p>
              </div>
              
              <div className="text-center">
                <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-2xl">
                  3
                </div>
                <h4 className="font-semibold mb-2">Complete Work</h4>
                <p className="text-sm text-gray-600">Submit your work for review</p>
              </div>
              
              <div className="text-center">
                <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-2xl">
                  4
                </div>
                <h4 className="font-semibold mb-2">Earn SBT</h4>
                <p className="text-sm text-gray-600">Get verified skill badges</p>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

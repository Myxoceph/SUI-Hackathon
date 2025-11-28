'use client';

import { ConnectButton, useCurrentAccount } from '@mysten/dapp-kit';
import Link from 'next/link';

export function Header() {
  const account = useCurrentAccount();

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              TalentPassport
            </Link>
            {account && (
              <nav className="flex space-x-4">
                <Link href="/profile" className="text-gray-700 hover:text-blue-600">
                  Profile
                </Link>
                <Link href="/tasks" className="text-gray-700 hover:text-blue-600">
                  Tasks
                </Link>
                <Link href="/my-tasks" className="text-gray-700 hover:text-blue-600">
                  My Tasks
                </Link>
              </nav>
            )}
          </div>
          <ConnectButton />
        </div>
      </div>
    </header>
  );
}

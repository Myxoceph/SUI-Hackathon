'use client';

import { useCurrentAccount } from '@mysten/dapp-kit';

export default function MyTasksPage() {
  const account = useCurrentAccount();

  if (!account) {
    return (
      <div className="text-center py-20">
        <p className="text-xl text-gray-600">Please connect your wallet</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold">My Tasks</h1>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-2xl font-semibold mb-4">Tasks I Created</h2>
          <p className="text-gray-600">Your posted tasks will appear here</p>
        </div>

        <div className="card">
          <h2 className="text-2xl font-semibold mb-4">Tasks I Applied To</h2>
          <p className="text-gray-600">Tasks you've applied to will appear here</p>
        </div>
      </div>
    </div>
  );
}

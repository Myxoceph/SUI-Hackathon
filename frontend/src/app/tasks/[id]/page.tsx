'use client';

import { useCurrentAccount } from '@mysten/dapp-kit';
import { useParams } from 'next/navigation';

export default function TaskDetailPage() {
  const account = useCurrentAccount();
  const params = useParams();
  const taskId = params.id as string;

  if (!account) {
    return (
      <div className="text-center py-20">
        <p className="text-xl text-gray-600">Please connect your wallet</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h1 className="text-4xl font-bold">Task Details</h1>
      
      <div className="card">
        <p className="text-gray-600">Task ID: {taskId}</p>
        <p className="text-sm text-gray-500 mt-4">
          Task details, applicant list, and actions will appear here after querying the blockchain
        </p>
      </div>

      <div className="card">
        <h2 className="text-2xl font-semibold mb-4">Actions</h2>
        <div className="space-x-4">
          <button className="btn-primary">Apply to Task</button>
          <button className="btn-secondary">Submit Work</button>
        </div>
      </div>
    </div>
  );
}

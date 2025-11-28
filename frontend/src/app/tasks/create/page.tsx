'use client';

import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { useState } from 'react';
import { PACKAGE_ID } from '@/config/constants';
import { useRouter } from 'next/navigation';

export default function CreateTaskPage() {
  const account = useCurrentAccount();
  const router = useRouter();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  
  const [formData, setFormData] = useState({
    rewardAmount: '',
    skillsUri: '',
    descriptionUri: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account) return;

    setLoading(true);
    try {
      const tx = new Transaction();
      
      // Split coins for reward
      const [coin] = tx.splitCoins(tx.gas, [
        tx.pure.u64(Number(formData.rewardAmount) * 1e9)
      ]);

      tx.moveCall({
        target: `${PACKAGE_ID}::task::create_task`,
        arguments: [
          coin,
          tx.pure.string(formData.skillsUri),
          tx.pure.string(formData.descriptionUri),
        ],
      });

      signAndExecute(
        {
          transaction: tx,
        },
        {
          onSuccess: () => {
            alert('Task created successfully!');
            router.push('/tasks');
          },
          onError: (error) => {
            console.error('Error creating task:', error);
            alert('Failed to create task');
          },
        }
      );
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (!account) {
    return (
      <div className="text-center py-20">
        <p className="text-xl text-gray-600">Please connect your wallet to create a task</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">Create New Task</h1>

      <form onSubmit={handleSubmit} className="card space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">
            Reward Amount (SUI)
          </label>
          <input
            type="number"
            name="rewardAmount"
            step="0.01"
            min="0"
            value={formData.rewardAmount}
            onChange={handleChange}
            required
            className="input"
            placeholder="1.5"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Required Skills URI (IPFS)
          </label>
          <input
            type="text"
            name="skillsUri"
            value={formData.skillsUri}
            onChange={handleChange}
            required
            className="input"
            placeholder="ipfs://..."
          />
          <p className="text-sm text-gray-500 mt-1">
            Upload a JSON file to IPFS with required skills
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Task Description URI (IPFS)
          </label>
          <input
            type="text"
            name="descriptionUri"
            value={formData.descriptionUri}
            onChange={handleChange}
            required
            className="input"
            placeholder="ipfs://..."
          />
          <p className="text-sm text-gray-500 mt-1">
            Upload task description and requirements to IPFS
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full"
        >
          {loading ? 'Creating Task...' : 'Create Task'}
        </button>
      </form>
    </div>
  );
}

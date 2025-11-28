'use client';

import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { useState } from 'react';
import { PACKAGE_ID } from '@/config/constants';

export default function ProfilePage() {
  const account = useCurrentAccount();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const [metadataUri, setMetadataUri] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateProfile = async () => {
    if (!account || !metadataUri) return;

    setLoading(true);
    try {
      const tx = new Transaction();
      tx.moveCall({
        target: `${PACKAGE_ID}::profile::create_profile`,
        arguments: [
          tx.pure.string(metadataUri),
        ],
      });

      signAndExecute(
        {
          transaction: tx,
        },
        {
          onSuccess: () => {
            alert('Profile created successfully!');
            setMetadataUri('');
          },
          onError: (error) => {
            console.error('Error creating profile:', error);
            alert('Failed to create profile');
          },
        }
      );
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!account) {
    return (
      <div className="text-center py-20">
        <p className="text-xl text-gray-600">Please connect your wallet to view your profile</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h1 className="text-4xl font-bold">Your Profile</h1>

      {/* Create Profile Section */}
      <div className="card">
        <h2 className="text-2xl font-semibold mb-4">Create Profile</h2>
        <p className="text-gray-600 mb-4">
          Upload your profile metadata to IPFS first, then paste the IPFS URI here.
        </p>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="ipfs://..."
            value={metadataUri}
            onChange={(e) => setMetadataUri(e.target.value)}
            className="input"
          />
          <button
            onClick={handleCreateProfile}
            disabled={loading || !metadataUri}
            className="btn-primary"
          >
            {loading ? 'Creating...' : 'Create Profile'}
          </button>
        </div>
      </div>

      {/* Profile Info */}
      <div className="card">
        <h2 className="text-2xl font-semibold mb-4">Profile Information</h2>
        <div className="space-y-2">
          <p><strong>Wallet Address:</strong> {account.address}</p>
          <p className="text-gray-600 text-sm">
            Your profile objects and reputation will appear here after creation
          </p>
        </div>
      </div>

      {/* Skill Badges */}
      <div className="card">
        <h2 className="text-2xl font-semibold mb-4">Skill Badges (SBTs)</h2>
        <p className="text-gray-600">
          Your earned skill badges will appear here after completing tasks
        </p>
      </div>
    </div>
  );
}

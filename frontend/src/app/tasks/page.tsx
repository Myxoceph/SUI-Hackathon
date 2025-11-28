'use client';

import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { useState, useEffect } from 'react';
import { PACKAGE_ID } from '@/config/constants';
import Link from 'next/link';

interface Task {
  id: string;
  creator: string;
  status: number;
  reward_amount: string;
  description_uri: string;
}

export default function TasksPage() {
  const account = useCurrentAccount();
  const client = useSuiClient();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      // In a real implementation, query dynamic fields or events
      // For MVP, this would fetch Task objects from the network
      setLoading(false);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setLoading(false);
    }
  };

  const getStatusBadge = (status: number) => {
    const statusMap = ['Open', 'In Progress', 'Submitted', 'Completed'];
    const colorMap = ['badge-open', 'badge-progress', 'badge-submitted', 'badge-completed'];
    return (
      <span className={`badge ${colorMap[status]}`}>
        {statusMap[status]}
      </span>
    );
  };

  if (!account) {
    return (
      <div className="text-center py-20">
        <p className="text-xl text-gray-600">Please connect your wallet to view tasks</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold">Available Tasks</h1>
        <Link href="/tasks/create" className="btn-primary">
          Create New Task
        </Link>
      </div>

      {loading ? (
        <p>Loading tasks...</p>
      ) : tasks.length === 0 ? (
        <div className="card text-center">
          <p className="text-gray-600">No tasks available yet. Create the first one!</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {tasks.map((task) => (
            <div key={task.id} className="card">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold mb-2">Task #{task.id.slice(-8)}</h3>
                  <p className="text-gray-600 text-sm">{task.description_uri}</p>
                </div>
                {getStatusBadge(task.status)}
              </div>
              
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">Reward</p>
                  <p className="font-semibold">{(Number(task.reward_amount) / 1e9).toFixed(2)} SUI</p>
                </div>
                <Link 
                  href={`/tasks/${task.id}`}
                  className="btn-primary"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

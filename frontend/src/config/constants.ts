export const NETWORK = 'testnet';
export const PACKAGE_ID = process.env.NEXT_PUBLIC_PACKAGE_ID || '0x_YOUR_PACKAGE_ID_HERE';

export const TASK_STATUS = {
  OPEN: 0,
  IN_PROGRESS: 1,
  SUBMITTED: 2,
  COMPLETED: 3,
} as const;

export const TASK_STATUS_LABELS = {
  [TASK_STATUS.OPEN]: 'Open',
  [TASK_STATUS.IN_PROGRESS]: 'In Progress',
  [TASK_STATUS.SUBMITTED]: 'Submitted',
  [TASK_STATUS.COMPLETED]: 'Completed',
} as const;

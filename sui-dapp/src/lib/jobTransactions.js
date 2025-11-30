import { Transaction } from "@mysten/sui/transactions";
import { CONTRACTS, JOBS_CONFIG } from "@/config/contracts";

/**
 * Create a new job listing
 * @param {Object} signAndExecute - Function from useSignAndExecuteTransactionBlock
 * @param {Object} jobData - Job data (title, description, tags, budgetSui)
 * @returns {Promise<Object>} Transaction result
 */
export const createJob = async (signAndExecute, jobData) => {
  const tx = new Transaction();

  // Set gas budget
  tx.setGasBudget(50000000);

  tx.moveCall({
    target: `${JOBS_CONFIG.PACKAGE_ID}::jobs::create_job`,
    arguments: [
      tx.object(CONTRACTS.JOBS_REGISTRY),
      tx.pure.string(jobData.title),
      tx.pure.string(jobData.description),
      tx.pure.vector('string', jobData.tags),
      tx.pure.u64(jobData.budgetSui),
    ],
  });

  return new Promise((resolve, reject) => {
    signAndExecute(
      { transaction: tx },
      {
        onSuccess: (result) => {
          resolve(result);
        },
        onError: (error) => {
          reject(error);
        },
      }
    );
  });
};

/**
 * Apply for a job
 * @param {Object} signAndExecute - Function from useSignAndExecuteTransactionBlock
 * @param {string} jobId - ID of the job to apply for
 * @param {string} coverLetter - Application message
 * @returns {Promise<Object>} Transaction result
 */
export const applyForJob = async (signAndExecute, jobId, coverLetter) => {
  const tx = new Transaction();

  // Set gas budget
  tx.setGasBudget(30000000);

  tx.moveCall({
    target: `${JOBS_CONFIG.PACKAGE_ID}::jobs::apply_for_job`,
    arguments: [
      tx.object(CONTRACTS.JOBS_REGISTRY),
      tx.object(jobId),
      tx.pure.string(coverLetter),
    ],
  });

  return new Promise((resolve, reject) => {
    signAndExecute(
      { transaction: tx },
      {
        onSuccess: (result) => {
          resolve(result);
        },
        onError: (error) => {
          reject(error);
        },
      }
    );
  });
};

/**
 * Assign a job to a worker (only job owner can do this)
 * @param {Object} signAndExecute - Function from useSignAndExecuteTransactionBlock
 * @param {string} jobId - ID of the job
 * @param {string} workerAddress - Address of the worker to assign
 * @returns {Promise<Object>} Transaction result
 */
export const assignJob = async (signAndExecute, jobId, workerAddress) => {
  const tx = new Transaction();

  // Set gas budget
  tx.setGasBudget(30000000);

  tx.moveCall({
    target: `${JOBS_CONFIG.PACKAGE_ID}::jobs::assign_job`,
    arguments: [
      tx.object(CONTRACTS.JOBS_REGISTRY),
      tx.object(jobId),
      tx.pure.address(workerAddress),
    ],
  });

  return new Promise((resolve, reject) => {
    signAndExecute(
      { transaction: tx },
      {
        onSuccess: (result) => {
          resolve(result);
        },
        onError: (error) => {
          reject(error);
        },
      }
    );
  });
};

/**
 * Confirm job completion (both parties must confirm)
 * @param {Object} signAndExecute - Function from useSignAndExecuteTransactionBlock
 * @param {string} jobId - ID of the job
 * @returns {Promise<Object>} Transaction result
 */
export const confirmJobCompletion = async (signAndExecute, jobId) => {
  const tx = new Transaction();

  // Set gas budget
  tx.setGasBudget(30000000);

  tx.moveCall({
    target: `${JOBS_CONFIG.PACKAGE_ID}::jobs::confirm_completion`,
    arguments: [
      tx.object(CONTRACTS.JOBS_REGISTRY),
      tx.object(jobId),
    ],
  });

  return new Promise((resolve, reject) => {
    signAndExecute(
      { transaction: tx },
      {
        onSuccess: (result) => {
          resolve(result);
        },
        onError: (error) => {
          reject(error);
        },
      }
    );
  });
};

/**
 * Cancel a job (only job owner, only if not assigned)
 * @param {Object} signAndExecute - Function from useSignAndExecuteTransactionBlock
 * @param {string} jobId - ID of the job to cancel
 * @returns {Promise<Object>} Transaction result
 */
export const cancelJob = async (signAndExecute, jobId) => {
  const tx = new Transaction();

  // Set gas budget
  tx.setGasBudget(20000000);

  tx.moveCall({
    target: `${JOBS_CONFIG.PACKAGE_ID}::jobs::cancel_job`,
    arguments: [
      tx.object(CONTRACTS.JOBS_REGISTRY),
      tx.object(jobId),
    ],
  });

  return new Promise((resolve, reject) => {
    signAndExecute(
      { transaction: tx },
      {
        onSuccess: (result) => {
          resolve(result);
        },
        onError: (error) => {
          reject(error);
        },
      }
    );
  });
};

/**
 * Get user's job applications
 * @param {Object} client - Sui client instance
 * @param {string} address - User address
 * @returns {Promise<Array>} List of job applications
 */
export const getUserJobApplications = async (client, address) => {
  try {
    const objects = await client.getOwnedObjects({
      owner: address,
      filter: {
        StructType: `${JOBS_CONFIG.PACKAGE_ID}::jobs::JobApplication`,
      },
      options: {
        showContent: true,
        showType: true,
      },
    });

    return objects.data
      .filter((obj) => obj.data?.content)
      .map((obj) => {
        const fields = obj.data.content.fields || {};
        return {
          id: obj.data.objectId,
          jobId: fields.job_id,
          applicant: fields.applicant,
          coverLetter: fields.cover_letter,
          timestamp: parseInt(fields.timestamp || "0"),
        };
      });
  } catch (error) {
    console.error("Error fetching job applications:", error);
    return [];
  }
};

/**
 * Get user's posted jobs
 * @param {Object} client - Sui client instance
 * @param {string} address - User address
 * @returns {Promise<Array>} List of jobs
 */
export const getUserJobs = async (client, address) => {
  try {
    const objects = await client.getOwnedObjects({
      owner: address,
      filter: {
        StructType: `${JOBS_CONFIG.PACKAGE_ID}::jobs::Job`,
      },
      options: {
        showContent: true,
        showType: true,
      },
    });

    return objects.data
      .filter((obj) => obj.data?.content)
      .map((obj) => parseJob(obj.data));
  } catch (error) {
    console.error("Error fetching user jobs:", error);
    return [];
  }
};

/**
 * Parse job object from blockchain
 * @param {Object} data - Raw object data from Sui
 * @returns {Object} Parsed job
 */
const parseJob = (data) => {
  const fields = data.content?.fields || {};
  
  return {
    id: data.objectId,
    owner: fields.owner,
    title: fields.title,
    description: fields.description,
    tags: fields.tags || [],
    budgetSui: parseInt(fields.budget_sui || "0"),
    status: parseInt(fields.status || "0"),
    assignedTo: fields.assigned_to?.Some || null,
    ownerConfirmed: fields.owner_confirmed || false,
    workerConfirmed: fields.worker_confirmed || false,
    applicantCount: parseInt(fields.applicant_count || "0"),
    createdAt: parseInt(fields.created_at || "0"),
  };
};

/**
 * Get jobs registry statistics
 * @param {Object} client - Sui client instance
 * @returns {Promise<Object>} Registry stats
 */
export const getJobsRegistryStats = async (client) => {
  try {
    if (CONTRACTS.JOBS_REGISTRY === "TO_BE_DEPLOYED") {
      return {
        totalJobs: 0,
        totalCompleted: 0,
        totalValueLocked: 0,
      };
    }

    const registry = await client.getObject({
      id: CONTRACTS.JOBS_REGISTRY,
      options: { showContent: true },
    });

    const fields = registry.data?.content?.fields || {};

    return {
      totalJobs: parseInt(fields.total_jobs || "0"),
      totalCompleted: parseInt(fields.total_completed || "0"),
      totalValueLocked: parseInt(fields.total_value_locked || "0"),
    };
  } catch (error) {
    console.error("Error fetching jobs registry stats:", error);
    return {
      totalJobs: 0,
      totalCompleted: 0,
      totalValueLocked: 0,
    };
  }
};

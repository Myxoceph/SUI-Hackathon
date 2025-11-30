import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useWallet } from "@/contexts/WalletContext";
import { useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import { CONTRACTS, JOB_STATUS, JOBS_CONFIG } from "@/config/contracts";
import JobCard from "@/components/JobCard";
import CreateJobModal from "@/components/CreateJobModal";
import { createJob, applyForJob, assignJob, confirmJobCompletion } from "@/lib/jobTransactions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Helper to check if jobs module is in demo mode
const isJobsDemoMode = () => {
  return !CONTRACTS.JOBS_REGISTRY || 
         CONTRACTS.JOBS_REGISTRY === "TO_BE_DEPLOYED" || 
         CONTRACTS.JOBS_REGISTRY === "DEMO_MODE" ||
         !JOBS_CONFIG.PACKAGE_ID ||
         JOBS_CONFIG.PACKAGE_ID === "TO_BE_DEPLOYED" ||
         JOBS_CONFIG.PACKAGE_ID === "DEMO_MODE";
};

const Jobs = () => {
  const { isConnected, address } = useWallet();
  const client = useSuiClient();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [userApplications, setUserApplications] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    loadAllJobs();
    
    const interval = setInterval(() => {
      loadAllJobs();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (address && jobs.length > 0) {
      checkUserApplications(jobs.map(j => j.id));
    } else if (!address) {
      setUserApplications(new Set());
    }
  }, [address, jobs]);

  const loadAllJobs = async () => {
    if (loading) return;
    setLoading(true);
    
    try {
      if (isJobsDemoMode()) {
        // Load mock data for demo
        const mockJobs = getMockJobs();
        setJobs(mockJobs);
        return;
      }

      // Load from on-chain using events
      const events = await client.queryEvents({
        query: {
          MoveEventType: JOBS_CONFIG.JOB_CREATED_EVENT,
        },
        limit: 50,
        order: 'descending',
      });

      const jobIds = events.data.map(event => event.parsedJson.job_id);

      if (jobIds.length === 0) {
        setJobs([]);
        return;
      }

      // Fetch actual job objects
      const objectsResponse = await client.multiGetObjects({
        ids: jobIds,
        options: {
          showContent: true,
          showOwner: true,
        },
      });

      const jobsList = objectsResponse
        .filter(obj => obj.data?.content)
        .map(obj => {
          const fields = obj.data.content.fields || {};
          return {
            id: obj.data.objectId,
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
        });

      jobsList.sort((a, b) => b.createdAt - a.createdAt);
      setJobs(jobsList);
    } catch (error) {
      console.error('Error loading jobs:', error);
      // Use mock data on error
      setJobs(getMockJobs());
    } finally {
      setLoading(false);
    }
  };

  const getMockJobs = () => {
    // Demo/mock jobs for when contract is not deployed
    return [
      {
        id: 'mock-1',
        owner: '0x1234567890abcdef1234567890abcdef12345678',
        title: 'Build DeFi Dashboard UI',
        description: 'Looking for a React developer to build a modern DeFi dashboard with charts, wallet connection, and transaction history. Must be responsive and follow our design system.',
        tags: ['React', 'TypeScript', 'DeFi', 'UI/UX'],
        budgetSui: 500_000_000_000, // 500 SUI
        status: JOB_STATUS.OPEN,
        assignedTo: null,
        ownerConfirmed: false,
        workerConfirmed: false,
        applicantCount: 3,
        createdAt: Date.now() - 86400000,
      },
      {
        id: 'mock-2',
        owner: '0xabcdef1234567890abcdef1234567890abcdef12',
        title: 'Smart Contract Audit',
        description: 'Need an experienced Move developer to audit our NFT marketplace contracts. Security focused review with detailed report required.',
        tags: ['Move', 'Security', 'Smart Contracts', 'NFT'],
        budgetSui: 1000_000_000_000, // 1000 SUI
        status: JOB_STATUS.OPEN,
        assignedTo: null,
        ownerConfirmed: false,
        workerConfirmed: false,
        applicantCount: 7,
        createdAt: Date.now() - 172800000,
      },
      {
        id: 'mock-3',
        owner: '0x9876543210fedcba9876543210fedcba98765432',
        title: 'API Integration for Sui Wallet',
        description: 'Integrate our backend API with Sui wallet for seamless user authentication and transaction signing. Node.js experience required.',
        tags: ['Node.js', 'API', 'Web3', 'Backend'],
        budgetSui: 300_000_000_000, // 300 SUI
        status: JOB_STATUS.ASSIGNED,
        assignedTo: '0xworker123456789',
        ownerConfirmed: false,
        workerConfirmed: false,
        applicantCount: 5,
        createdAt: Date.now() - 259200000,
      },
    ];
  };

  const checkUserApplications = async (jobIds) => {
    if (!address || isJobsDemoMode()) {
      return;
    }

    try {
      const applied = new Set();
      
      for (const jobId of jobIds) {
        try {
          const registry = await client.getObject({
            id: CONTRACTS.JOBS_REGISTRY,
            options: { showContent: true },
          });

          const checkTableId = registry.data?.content?.fields?.application_check?.fields?.id?.id;
          if (!checkTableId) continue;

          const jobCheckTable = await client.getDynamicFieldObject({
            parentId: checkTableId,
            name: { type: "0x2::object::ID", value: jobId },
          });

          const innerTableId = jobCheckTable.data?.content?.fields?.value?.fields?.id?.id;
          if (!innerTableId) continue;

          const userCheck = await client.getDynamicFieldObject({
            parentId: innerTableId,
            name: { type: "address", value: address },
          });

          if (userCheck.data) {
            applied.add(jobId);
          }
        } catch (e) {
          // User hasn't applied
        }
      }

      setUserApplications(applied);
    } catch (error) {
      console.error('Error checking applications:', error);
    }
  };

  const handleCreateJob = async (jobData) => {
    if (!isConnected) {
      toast.error("Please connect your wallet first!");
      return;
    }

    if (isJobsDemoMode()) {
      // Demo mode - just show success
      toast.success("Job created! (Demo Mode)", {
        description: "Contract not deployed yet. This is a preview.",
      });
      setShowCreateModal(false);
      
      // Add to mock jobs
      const newJob = {
        id: `mock-${Date.now()}`,
        owner: address,
        ...jobData,
        status: JOB_STATUS.OPEN,
        assignedTo: null,
        ownerConfirmed: false,
        workerConfirmed: false,
        applicantCount: 0,
        createdAt: Date.now(),
      };
      setJobs(prev => [newJob, ...prev]);
      return;
    }

    setProcessingId('creating');
    try {
      const result = await createJob(signAndExecute, jobData);
      toast.success("Job posted successfully! 🎉", {
        description: `Transaction: ${result.digest?.slice(0, 8)}...`,
      });
      setShowCreateModal(false);
      loadAllJobs();
    } catch (error) {
      console.error("Create job error:", error);
      toast.error("Failed to create job: " + (error.message || "Unknown error"));
    } finally {
      setProcessingId(null);
    }
  };

  const handleApply = async (jobId, coverLetter) => {
    if (!isConnected) {
      toast.error("Please connect your wallet to apply!");
      return;
    }

    const job = jobs.find(j => j.id === jobId);
    if (job && address && job.owner.toLowerCase() === address.toLowerCase()) {
      toast.error("You cannot apply to your own job!");
      return;
    }

    if (userApplications.has(jobId)) {
      toast.error("You already applied for this job!");
      return;
    }

    if (isJobsDemoMode()) {
      toast.success("Application submitted! (Demo Mode)");
      setUserApplications(prev => new Set([...prev, jobId]));
      setJobs(prev => prev.map(j => 
        j.id === jobId ? { ...j, applicantCount: j.applicantCount + 1 } : j
      ));
      return;
    }

    setProcessingId(jobId);
    try {
      const result = await applyForJob(signAndExecute, jobId, coverLetter);
      toast.success("Application submitted! 🎉", {
        description: `Transaction: ${result.digest?.slice(0, 8)}...`,
      });
      setUserApplications(prev => new Set([...prev, jobId]));
      loadAllJobs();
    } catch (error) {
      console.error("Apply error:", error);
      toast.error("Failed to apply: " + (error.message || "Unknown error"));
    } finally {
      setProcessingId(null);
    }
  };

  const handleAssign = async (jobId, workerAddress) => {
    if (isJobsDemoMode()) {
      toast.success("Worker assigned! (Demo Mode)");
      setJobs(prev => prev.map(j => 
        j.id === jobId ? { ...j, status: JOB_STATUS.ASSIGNED, assignedTo: workerAddress } : j
      ));
      return;
    }

    setProcessingId(jobId);
    try {
      const result = await assignJob(signAndExecute, jobId, workerAddress);
      toast.success("Job assigned! 🎉", {
        description: `Transaction: ${result.digest?.slice(0, 8)}...`,
      });
      loadAllJobs();
    } catch (error) {
      console.error("Assign error:", error);
      toast.error("Failed to assign: " + (error.message || "Unknown error"));
    } finally {
      setProcessingId(null);
    }
  };

  const handleConfirmCompletion = async (jobId) => {
    if (isJobsDemoMode()) {
      const job = jobs.find(j => j.id === jobId);
      const isOwner = job && address && job.owner.toLowerCase() === address.toLowerCase();
      
      setJobs(prev => prev.map(j => {
        if (j.id !== jobId) return j;
        const updated = { ...j };
        if (isOwner) updated.ownerConfirmed = true;
        else updated.workerConfirmed = true;
        
        if (updated.ownerConfirmed && updated.workerConfirmed) {
          updated.status = JOB_STATUS.COMPLETED;
          toast.success("Job completed! Payment released. (Demo Mode)");
        } else {
          toast.success("Completion confirmed! Waiting for other party. (Demo Mode)");
        }
        return updated;
      }));
      return;
    }

    setProcessingId(jobId);
    try {
      const result = await confirmJobCompletion(signAndExecute, jobId);
      toast.success("Completion confirmed! 🎉", {
        description: `Transaction: ${result.digest?.slice(0, 8)}...`,
      });
      loadAllJobs();
    } catch (error) {
      console.error("Confirm error:", error);
      toast.error("Failed to confirm: " + (error.message || "Unknown error"));
    } finally {
      setProcessingId(null);
    }
  };

  // Filter jobs based on tab and search
  const filteredJobs = jobs.filter(job => {
    // Tab filter
    if (activeTab === 'my-jobs' && (!address || job.owner.toLowerCase() !== address.toLowerCase())) {
      return false;
    }
    if (activeTab === 'my-applications' && !userApplications.has(job.id)) {
      return false;
    }
    if (activeTab === 'open' && job.status !== JOB_STATUS.OPEN) {
      return false;
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesTitle = job.title.toLowerCase().includes(query);
      const matchesDesc = job.description.toLowerCase().includes(query);
      const matchesTags = job.tags.some(tag => tag.toLowerCase().includes(query));
      return matchesTitle || matchesDesc || matchesTags;
    }

    return true;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold font-sans">Jobs Board</h1>
          <p className="text-muted-foreground font-mono text-sm">
            Find work or hire talent. Payments in SUI.
          </p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search jobs or skills..." 
              className="pl-9 rounded-none border-border bg-background"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button 
            onClick={() => setShowCreateModal(true)}
            className="rounded-none gap-2"
            disabled={!isConnected}
          >
            <Plus className="h-4 w-4" />
            Post Job
          </Button>
        </div>
      </div>

      {/* Demo mode notice */}
      {isJobsDemoMode() && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-none">
          <p className="text-sm text-yellow-500 font-mono">
            ⚠️ Demo Mode: Jobs feature is running in preview mode. 
            All actions are simulated locally.
          </p>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="rounded-none border border-border bg-background w-full justify-start">
          <TabsTrigger value="all" className="rounded-none data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            All Jobs
          </TabsTrigger>
          <TabsTrigger value="open" className="rounded-none data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Open
          </TabsTrigger>
          {isConnected && (
            <>
              <TabsTrigger value="my-jobs" className="rounded-none data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                My Jobs
              </TabsTrigger>
              <TabsTrigger value="my-applications" className="rounded-none data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                My Applications
              </TabsTrigger>
            </>
          )}
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {loading ? (
              <div className="col-span-full flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredJobs.length > 0 ? (
              filteredJobs.map((job) => (
                <JobCard 
                  key={job.id} 
                  job={job}
                  currentUserAddress={address}
                  isProcessing={processingId === job.id}
                  hasApplied={userApplications.has(job.id)}
                  onApply={handleApply}
                  onAssign={handleAssign}
                  onConfirmCompletion={handleConfirmCompletion}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12 space-y-4">
                <div className="text-4xl">💼</div>
                <div className="space-y-2">
                  <p className="text-lg font-semibold">No Jobs Found</p>
                  <p className="text-sm text-muted-foreground">
                    {activeTab === 'my-jobs' 
                      ? "You haven't posted any jobs yet."
                      : activeTab === 'my-applications'
                      ? "You haven't applied to any jobs yet."
                      : "Be the first to post a job!"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Job Modal */}
      <CreateJobModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateJob}
        isSubmitting={processingId === 'creating'}
      />
    </div>
  );
};

export default Jobs;

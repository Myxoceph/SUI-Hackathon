/// PeerFlow Jobs Module
/// Manages job listings with escrow-style payments (mockup version)
/// Real escrow will be implemented in production - currently just gas fees
module peerflow::jobs {
    use std::string::String;
    use sui::event;
    use sui::table::{Self, Table};
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;

    // ==================== Error Codes ====================
    
    const ENotJobOwner: u64 = 1;
    const EJobNotOpen: u64 = 2;
    const EAlreadyApplied: u64 = 3;
    const ENotApplicant: u64 = 4;
    const ENotAssigned: u64 = 5;
    const EAlreadyConfirmed: u64 = 6;
    const EJobNotAssigned: u64 = 7;
    const ESelfApplication: u64 = 8;

    // ==================== Job Status Constants ====================
    
    const STATUS_OPEN: u8 = 0;
    const STATUS_ASSIGNED: u8 = 1;
    const STATUS_COMPLETED: u8 = 2;
    const STATUS_CANCELLED: u8 = 3;

    // ==================== Data Structures ====================

    /// Job Listing NFT - Represents a job posting
    public struct Job has key, store {
        id: UID,
        owner: address,           // Job poster
        title: String,
        description: String,
        tags: vector<String>,     // Skill tags like "javascript", "rust", etc.
        budget_sui: u64,          // Budget in MIST (1 SUI = 1_000_000_000 MIST)
        status: u8,               // 0: Open, 1: Assigned, 2: Completed, 3: Cancelled
        assigned_to: Option<address>,  // Assigned worker
        owner_confirmed: bool,    // Owner confirmed completion
        worker_confirmed: bool,   // Worker confirmed completion
        applicant_count: u64,
        created_at: u64,
    }

    /// Application Receipt - Proof that user applied for a job
    public struct JobApplication has key, store {
        id: UID,
        job_id: ID,
        applicant: address,
        cover_letter: String,
        timestamp: u64,
    }

    /// Global Jobs Registry - Shared object for all job tracking
    public struct JobsRegistry has key {
        id: UID,
        total_jobs: u64,
        total_completed: u64,
        total_value_locked: u64,  // Mockup - will track real escrow later
        // Job ID -> list of applicant addresses
        applicants: Table<ID, vector<address>>,
        // Job ID -> (Applicant -> has_applied) for quick lookup
        application_check: Table<ID, Table<address, bool>>,
    }

    // ==================== Events ====================

    /// Emitted when a new job is posted
    public struct JobCreated has copy, drop {
        job_id: ID,
        owner: address,
        title: String,
        budget_sui: u64,
        timestamp: u64,
    }

    /// Emitted when someone applies to a job
    public struct JobApplicationSubmitted has copy, drop {
        job_id: ID,
        applicant: address,
        timestamp: u64,
    }

    /// Emitted when a job is assigned to a worker
    public struct JobAssigned has copy, drop {
        job_id: ID,
        owner: address,
        worker: address,
        timestamp: u64,
    }

    /// Emitted when job completion is confirmed by a party
    public struct JobCompletionConfirmed has copy, drop {
        job_id: ID,
        confirmer: address,
        is_owner: bool,
        timestamp: u64,
    }

    /// Emitted when job is fully completed (both parties confirmed)
    public struct JobCompleted has copy, drop {
        job_id: ID,
        owner: address,
        worker: address,
        budget_sui: u64,
        timestamp: u64,
    }

    // ==================== Init ====================

    fun init(ctx: &mut TxContext) {
        let registry = JobsRegistry {
            id: object::new(ctx),
            total_jobs: 0,
            total_completed: 0,
            total_value_locked: 0,
            applicants: table::new(ctx),
            application_check: table::new(ctx),
        };
        transfer::share_object(registry);
    }

    // ==================== Public API ====================

    /// Create a new job listing (mockup - no real payment locked)
    /// In production, this would lock the budget in escrow
    #[allow(lint(public_entry))]
    public entry fun create_job(
        registry: &mut JobsRegistry,
        title: String,
        description: String,
        tags: vector<String>,
        budget_sui: u64,  // Budget amount (not actually locked in mockup)
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        let timestamp = tx_context::epoch(ctx);

        let job = Job {
            id: object::new(ctx),
            owner: sender,
            title,
            description,
            tags,
            budget_sui,
            status: STATUS_OPEN,
            assigned_to: option::none(),
            owner_confirmed: false,
            worker_confirmed: false,
            applicant_count: 0,
            created_at: timestamp,
        };

        let job_id = object::id(&job);

        // Update registry
        registry.total_jobs = registry.total_jobs + 1;
        registry.total_value_locked = registry.total_value_locked + budget_sui;
        table::add(&mut registry.applicants, job_id, vector::empty());
        table::add(&mut registry.application_check, job_id, table::new(ctx));

        // Emit event
        event::emit(JobCreated {
            job_id,
            owner: sender,
            title: job.title,
            budget_sui,
            timestamp,
        });

        // Transfer job NFT to creator
        transfer::transfer(job, sender);
    }

    /// Apply for a job
    #[allow(lint(public_entry))]
    public entry fun apply_for_job(
        registry: &mut JobsRegistry,
        job: &mut Job,
        cover_letter: String,
        ctx: &mut TxContext
    ) {
        let applicant = tx_context::sender(ctx);
        let timestamp = tx_context::epoch(ctx);
        let job_id = object::id(job);

        // Validations
        assert!(job.status == STATUS_OPEN, EJobNotOpen);
        assert!(applicant != job.owner, ESelfApplication);
        
        let check_table = table::borrow_mut(&mut registry.application_check, job_id);
        assert!(!table::contains(check_table, applicant), EAlreadyApplied);

        // Record application
        table::add(check_table, applicant, true);
        let applicants_list = table::borrow_mut(&mut registry.applicants, job_id);
        vector::push_back(applicants_list, applicant);
        job.applicant_count = job.applicant_count + 1;

        // Create application receipt
        let application = JobApplication {
            id: object::new(ctx),
            job_id,
            applicant,
            cover_letter,
            timestamp,
        };

        // Emit event
        event::emit(JobApplicationSubmitted {
            job_id,
            applicant,
            timestamp,
        });

        // Transfer receipt to applicant
        transfer::transfer(application, applicant);
    }

    /// Assign a job to an applicant (only job owner can do this)
    #[allow(lint(public_entry))]
    public entry fun assign_job(
        registry: &JobsRegistry,
        job: &mut Job,
        worker: address,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        let timestamp = tx_context::epoch(ctx);
        let job_id = object::id(job);

        // Validations
        assert!(sender == job.owner, ENotJobOwner);
        assert!(job.status == STATUS_OPEN, EJobNotOpen);
        
        // Verify worker has applied
        let check_table = table::borrow(&registry.application_check, job_id);
        assert!(table::contains(check_table, worker), ENotApplicant);

        // Assign job
        job.status = STATUS_ASSIGNED;
        job.assigned_to = option::some(worker);

        // Emit event
        event::emit(JobAssigned {
            job_id,
            owner: sender,
            worker,
            timestamp,
        });
    }

    /// Confirm job completion (both parties must confirm)
    #[allow(lint(public_entry))]
    public entry fun confirm_completion(
        registry: &mut JobsRegistry,
        job: &mut Job,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        let timestamp = tx_context::epoch(ctx);
        let job_id = object::id(job);

        // Must be assigned
        assert!(job.status == STATUS_ASSIGNED, EJobNotAssigned);

        let worker = *option::borrow(&job.assigned_to);
        let is_owner = sender == job.owner;
        let is_worker = sender == worker;

        // Must be owner or assigned worker
        assert!(is_owner || is_worker, ENotJobOwner);

        // Set confirmation
        if (is_owner) {
            assert!(!job.owner_confirmed, EAlreadyConfirmed);
            job.owner_confirmed = true;
        } else {
            assert!(!job.worker_confirmed, EAlreadyConfirmed);
            job.worker_confirmed = true;
        };

        // Emit confirmation event
        event::emit(JobCompletionConfirmed {
            job_id,
            confirmer: sender,
            is_owner,
            timestamp,
        });

        // Check if both confirmed - complete the job
        if (job.owner_confirmed && job.worker_confirmed) {
            job.status = STATUS_COMPLETED;
            registry.total_completed = registry.total_completed + 1;
            
            // In production, this would transfer the escrowed funds to worker
            // For mockup, we just emit the event

            event::emit(JobCompleted {
                job_id,
                owner: job.owner,
                worker,
                budget_sui: job.budget_sui,
                timestamp,
            });
        };
    }

    /// Cancel a job (only owner, only if not assigned)
    #[allow(lint(public_entry))]
    public entry fun cancel_job(
        registry: &mut JobsRegistry,
        job: &mut Job,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);

        assert!(sender == job.owner, ENotJobOwner);
        assert!(job.status == STATUS_OPEN, EJobNotOpen);

        job.status = STATUS_CANCELLED;
        registry.total_value_locked = registry.total_value_locked - job.budget_sui;

        // In production, this would refund the escrowed funds to owner
    }

    // ==================== View Functions ====================

    /// Get job details
    public fun get_job_info(job: &Job): (
        address,           // owner
        String,            // title
        String,            // description
        vector<String>,    // tags
        u64,               // budget_sui
        u8,                // status
        Option<address>,   // assigned_to
        bool,              // owner_confirmed
        bool,              // worker_confirmed
        u64,               // applicant_count
        u64                // created_at
    ) {
        (
            job.owner,
            job.title,
            job.description,
            job.tags,
            job.budget_sui,
            job.status,
            job.assigned_to,
            job.owner_confirmed,
            job.worker_confirmed,
            job.applicant_count,
            job.created_at,
        )
    }

    /// Get registry statistics
    public fun get_registry_stats(registry: &JobsRegistry): (u64, u64, u64) {
        (registry.total_jobs, registry.total_completed, registry.total_value_locked)
    }

    /// Get job status
    public fun get_status(job: &Job): u8 {
        job.status
    }

    /// Check if user has applied
    public fun has_applied(registry: &JobsRegistry, job_id: ID, user: address): bool {
        if (!table::contains(&registry.application_check, job_id)) {
            return false
        };
        let check_table = table::borrow(&registry.application_check, job_id);
        table::contains(check_table, user)
    }

    /// Get applicants for a job
    public fun get_applicants(registry: &JobsRegistry, job_id: ID): vector<address> {
        if (!table::contains(&registry.applicants, job_id)) {
            return vector::empty()
        };
        *table::borrow(&registry.applicants, job_id)
    }

    // ==================== Test-Only Functions ====================

    #[test_only]
    public fun init_for_testing(ctx: &mut TxContext) {
        init(ctx);
    }
}

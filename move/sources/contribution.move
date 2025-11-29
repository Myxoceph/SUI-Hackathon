/// TrustChain Contribution Passport - Core Module
/// Manages on-chain contribution records and endorsements
module trustchain::contribution {
    use std::string::String;
    use sui::event;
    use sui::table::{Self, Table};

    // ==================== Error Codes ====================
    
    const ENotOwner: u64 = 1;
    const EAlreadyEndorsed: u64 = 2;
    const ESelfEndorsement: u64 = 3;

    // ==================== Structs ====================

    /// Main contribution record - owned by creator
    public struct Contribution has key, store {
        id: UID,
        owner: address,
        contribution_type: String,
        title: String,
        description: String,
        proof_link: String,
        endorsements: u64,
        created_at: u64,
    }

    /// Endorsement record - prevents double endorsements
    public struct Endorsement has key {
        id: UID,
        contribution_id: ID,
        endorser: address,
        timestamp: u64,
    }

    /// Shared registry to track all contributions
    public struct ContributionRegistry has key {
        id: UID,
        total_contributions: u64,
        total_endorsements: u64,
        // Track endorsement counts by contribution ID
        endorsement_counts: Table<ID, u64>,
    }

    // ==================== Events ====================

    public struct ContributionCreated has copy, drop {
        contribution_id: ID,
        owner: address,
        contribution_type: String,
        title: String,
        timestamp: u64,
    }

    public struct ContributionEndorsed has copy, drop {
        contribution_id: ID,
        endorser: address,
        owner: address,
        new_endorsement_count: u64,
        timestamp: u64,
    }

    // ==================== Init ====================

    /// Initialize the shared registry on module publish
    fun init(ctx: &mut TxContext) {
        let registry = ContributionRegistry {
            id: object::new(ctx),
            total_contributions: 0,
            total_endorsements: 0,
            endorsement_counts: table::new(ctx),
        };
        transfer::share_object(registry);
    }

    // ==================== Core Functions ====================

    /// Create a new contribution record
    public entry fun mint_contribution(
        registry: &mut ContributionRegistry,
        contribution_type: String,
        title: String,
        description: String,
        proof_link: String,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        let timestamp = tx_context::epoch(ctx);

        let contribution = Contribution {
            id: object::new(ctx),
            owner: sender,
            contribution_type,
            title,
            description,
            proof_link,
            endorsements: 0,
            created_at: timestamp,
        };

        let contribution_id = object::id(&contribution);

        // Update registry
        registry.total_contributions = registry.total_contributions + 1;
        
        // Initialize endorsement count for this contribution
        table::add(&mut registry.endorsement_counts, contribution_id, 0);

        // Emit event
        event::emit(ContributionCreated {
            contribution_id,
            owner: sender,
            contribution_type: contribution.contribution_type,
            title: contribution.title,
            timestamp,
        });

        // Transfer to creator
        transfer::transfer(contribution, sender);
    }

    /// Endorse a contribution (must be different user)
    /// Now uses contribution_id and owner instead of mutable reference
    public entry fun endorse_contribution(
        registry: &mut ContributionRegistry,
        contribution_id: ID,
        contribution_owner: address,
        ctx: &mut TxContext
    ) {
        let endorser = tx_context::sender(ctx);
        let timestamp = tx_context::epoch(ctx);

        // Validations
        assert!(endorser != contribution_owner, ESelfEndorsement);

        // Increment endorsement count in registry
        let current_count = table::borrow_mut(&mut registry.endorsement_counts, contribution_id);
        *current_count = *current_count + 1;
        registry.total_endorsements = registry.total_endorsements + 1;

        let new_count = *current_count;

        // Create endorsement record
        let endorsement = Endorsement {
            id: object::new(ctx),
            contribution_id,
            endorser,
            timestamp,
        };

        // Emit event
        event::emit(ContributionEndorsed {
            contribution_id,
            endorser,
            owner: contribution_owner,
            new_endorsement_count: new_count,
            timestamp,
        });

        // Transfer endorsement record to endorser
        transfer::transfer(endorsement, endorser);
    }

    // ==================== View Functions ====================

    /// Get contribution details
    public fun get_contribution_info(contribution: &Contribution): (address, String, String, String, String, u64, u64) {
        (
            contribution.owner,
            contribution.contribution_type,
            contribution.title,
            contribution.description,
            contribution.proof_link,
            contribution.endorsements,
            contribution.created_at,
        )
    }

    /// Get registry stats
    public fun get_registry_stats(registry: &ContributionRegistry): (u64, u64) {
        (registry.total_contributions, registry.total_endorsements)
    }

    /// Get contribution owner
    public fun get_owner(contribution: &Contribution): address {
        contribution.owner
    }

    /// Get endorsement count from Contribution object (deprecated - use registry)
    public fun get_endorsements(contribution: &Contribution): u64 {
        contribution.endorsements
    }

    /// Get endorsement count from registry (recommended)
    public fun get_endorsement_count(registry: &ContributionRegistry, contribution_id: ID): u64 {
        if (table::contains(&registry.endorsement_counts, contribution_id)) {
            *table::borrow(&registry.endorsement_counts, contribution_id)
        } else {
            0
        }
    }

    // ==================== Test-Only Functions ====================

    #[test_only]
    public fun init_for_testing(ctx: &mut TxContext) {
        init(ctx);
    }
}

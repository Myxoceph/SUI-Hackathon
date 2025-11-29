/// TrustChain Contribution Passport - Core Module
/// Manages on-chain contribution records and endorsements
module peerflow::contribution {
    use std::string::String;
    use sui::event;
    use sui::table::{Self, Table};
    use sui::package;
    use sui::display;

    // ==================== One-Time-Witness ====================
    
    /// One-Time-Witness for Display creation
    public struct CONTRIBUTION has drop {}

    // ==================== Error Codes ====================
    
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
        // Track who endorsed what (contribution_id => Table<endorser_address, bool>)
        endorsers: Table<ID, Table<address, bool>>,
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

    /// Initialize the shared registry and Display on module publish
    fun init(otw: CONTRIBUTION, ctx: &mut TxContext) {
        // Create shared registry
        let registry = ContributionRegistry {
            id: object::new(ctx),
            total_contributions: 0,
            total_endorsements: 0,
            endorsement_counts: table::new(ctx),
            endorsers: table::new(ctx),
        };
        transfer::share_object(registry);

        // Setup Display for NFT visualization
        let publisher = package::claim(otw, ctx);
        let mut display = display::new<Contribution>(&publisher, ctx);
        
        // Define how Contributions appear in wallets/explorers
        display.add(
            b"name".to_string(),
            b"{title}".to_string()
        );
        display.add(
            b"description".to_string(),
            b"{description}".to_string()
        );
        display.add(
            b"image_url".to_string(),
            b"https://api.dicebear.com/7.x/shapes/svg?seed={title}".to_string()
        );
        display.add(
            b"project_url".to_string(),
            b"{proof_link}".to_string()
        );
        display.add(
            b"creator".to_string(),
            b"PeerFlow - 42 Global".to_string()
        );
        display.add(
            b"type".to_string(),
            b"{contribution_type}".to_string()
        );
        display.add(
            b"endorsements".to_string(),
            b"{endorsements}".to_string()
        );
        
        display.update_version();

        transfer::public_transfer(publisher, ctx.sender());
        transfer::public_transfer(display, ctx.sender());
    }

    // ==================== Core Functions ====================

    /// Create a new contribution record
    #[allow(lint(public_entry))]
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
        
        // Initialize endorsers table for this contribution
        table::add(&mut registry.endorsers, contribution_id, table::new(ctx));

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
    #[allow(lint(public_entry))]
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
        
        // Check if already endorsed
        let endorsers_table = table::borrow_mut(&mut registry.endorsers, contribution_id);
        assert!(!table::contains(endorsers_table, endorser), EAlreadyEndorsed);
        
        // Mark as endorsed by this user
        table::add(endorsers_table, endorser, true);

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
        let otw = CONTRIBUTION {};
        init(otw, ctx);
    }
}

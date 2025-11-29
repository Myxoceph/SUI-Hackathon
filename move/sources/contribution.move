/// PeerFlow Project Registry Module
/// Manages student projects/work as on-chain NFTs with peer endorsement system
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

    // ==================== Data Structures ====================

    /// Project NFT - Represents a student's work/project
    /// Transferable asset that can be showcased in portfolios
    public struct Project has key, store {
        id: UID,
        owner: address,
        project_type: String,      // "Hackathon", "Open Source", etc.
        title: String,
        description: String,
        proof_link: String,        // GitHub, demo, etc.
        endorsement_count: u64,    // Cached from registry
        created_at: u64,
    }

    /// Endorsement Receipt - Proof that user endorsed a project
    /// Non-transferable receipt owned by the endorser
    public struct EndorsementReceipt has key {
        id: UID,
        project_id: ID,
        endorser: address,
        project_owner: address,
        timestamp: u64,
    }

    /// Global Project Registry - Shared object for all project tracking
    /// Manages endorsement state and prevents fraud
    public struct ProjectRegistry has key {
        id: UID,
        total_projects: u64,
        total_endorsements: u64,
        // Project ID -> endorsement count mapping
        endorsement_counts: Table<ID, u64>,
        // Project ID -> (Endorser address -> has_endorsed) nested mapping
        endorsers: Table<ID, Table<address, bool>>,
    }

    // ==================== Events ====================

    /// Emitted when a new project is created
    public struct ProjectCreated has copy, drop {
        project_id: ID,
        owner: address,
        project_type: String,
        title: String,
        timestamp: u64,
    }

    /// Emitted when a project receives an endorsement
    public struct ProjectEndorsed has copy, drop {
        project_id: ID,
        endorser: address,
        project_owner: address,
        new_endorsement_count: u64,
        timestamp: u64,
    }

    // ==================== Init ====================

    fun init(otw: CONTRIBUTION, ctx: &mut TxContext) {
        // Initialize shared project registry
        let registry = ProjectRegistry {
            id: object::new(ctx),
            total_projects: 0,
            total_endorsements: 0,
            endorsement_counts: table::new(ctx),
            endorsers: table::new(ctx),
        };
        transfer::share_object(registry);

        // Setup NFT Display standard for wallets/explorers
        let publisher = package::claim(otw, ctx);
        let mut display = display::new<Project>(&publisher, ctx);
        
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

    // ==================== Public API ====================

    /// Create a new project NFT
    /// @param registry: Shared project registry
    /// @param project_type: Type of project ("Hackathon", "Open Source", etc.)
    /// @param title: Project name
    /// @param description: Project details
    /// @param proof_link: Evidence URL (GitHub, demo, etc.)
    #[allow(lint(public_entry))]
    public entry fun create_project(
        registry: &mut ProjectRegistry,
        project_type: String,
        title: String,
        description: String,
        proof_link: String,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        let timestamp = tx_context::epoch(ctx);

        // Create project NFT
        let project = Project {
            id: object::new(ctx),
            owner: sender,
            project_type,
            title,
            description,
            proof_link,
            endorsement_count: 0,
            created_at: timestamp,
        };

        let project_id = object::id(&project);

        // Update registry state
        registry.total_projects = registry.total_projects + 1;
        table::add(&mut registry.endorsement_counts, project_id, 0);
        table::add(&mut registry.endorsers, project_id, table::new(ctx));

        // Emit creation event
        event::emit(ProjectCreated {
            project_id,
            owner: sender,
            project_type: project.project_type,
            title: project.title,
            timestamp,
        });

        // Transfer NFT to creator
        transfer::transfer(project, sender);
    }

    /// Endorse a project (peer validation)
    /// @param registry: Shared project registry
    /// @param project_id: ID of the project to endorse
    /// @param project_owner: Owner address (prevents self-endorsement)
    #[allow(lint(public_entry))]
    public entry fun endorse_project(
        registry: &mut ProjectRegistry,
        project_id: ID,
        project_owner: address,
        ctx: &mut TxContext
    ) {
        let endorser = tx_context::sender(ctx);
        let timestamp = tx_context::epoch(ctx);

        // Fraud prevention checks
        assert!(endorser != project_owner, ESelfEndorsement);
        
        let endorsers_table = table::borrow_mut(&mut registry.endorsers, project_id);
        assert!(!table::contains(endorsers_table, endorser), EAlreadyEndorsed);
        
        // Record endorsement
        table::add(endorsers_table, endorser, true);

        // Update counts
        let count = table::borrow_mut(&mut registry.endorsement_counts, project_id);
        *count = *count + 1;
        registry.total_endorsements = registry.total_endorsements + 1;

        let new_count = *count;

        // Create receipt NFT for endorser
        let receipt = EndorsementReceipt {
            id: object::new(ctx),
            project_id,
            endorser,
            project_owner,
            timestamp,
        };

        // Emit endorsement event
        event::emit(ProjectEndorsed {
            project_id,
            endorser,
            project_owner,
            new_endorsement_count: new_count,
            timestamp,
        });

        // Transfer receipt to endorser
        transfer::transfer(receipt, endorser);
    }

    // ==================== View Functions ====================

    /// Get project details
    public fun get_project_info(project: &Project): (address, String, String, String, String, u64, u64) {
        (
            project.owner,
            project.project_type,
            project.title,
            project.description,
            project.proof_link,
            project.endorsement_count,
            project.created_at,
        )
    }

    /// Get registry statistics
    public fun get_registry_stats(registry: &ProjectRegistry): (u64, u64) {
        (registry.total_projects, registry.total_endorsements)
    }

    /// Get project owner address
    public fun get_owner(project: &Project): address {
        project.owner
    }

    /// Get cached endorsement count from project NFT (may be stale)
    public fun get_cached_endorsement_count(project: &Project): u64 {
        project.endorsement_count
    }

    /// Get live endorsement count from registry (always accurate)
    public fun get_endorsement_count(registry: &ProjectRegistry, project_id: ID): u64 {
        if (table::contains(&registry.endorsement_counts, project_id)) {
            *table::borrow(&registry.endorsement_counts, project_id)
        } else {
            0
        }
    }

    /// Check if user has endorsed a project
    public fun has_user_endorsed(registry: &ProjectRegistry, project_id: ID, user: address): bool {
        if (!table::contains(&registry.endorsers, project_id)) {
            return false
        };
        let endorsers_table = table::borrow(&registry.endorsers, project_id);
        table::contains(endorsers_table, user)
    }

    // ==================== Backward Compatibility Aliases ====================
    // These functions maintain compatibility with existing frontend code
    // TODO: Update frontend to use new names, then deprecate these

    /// Alias for create_project (backward compatibility)
    #[allow(lint(public_entry))]
    public entry fun mint_contribution(
        registry: &mut ProjectRegistry,
        contribution_type: String,
        title: String,
        description: String,
        proof_link: String,
        ctx: &mut TxContext
    ) {
        create_project(registry, contribution_type, title, description, proof_link, ctx);
    }

    /// Alias for endorse_project (backward compatibility)
    #[allow(lint(public_entry))]
    public entry fun endorse_contribution(
        registry: &mut ProjectRegistry,
        contribution_id: ID,
        contribution_owner: address,
        ctx: &mut TxContext
    ) {
        endorse_project(registry, contribution_id, contribution_owner, ctx);
    }

    // ==================== Test-Only Functions ====================

    #[test_only]
    public fun init_for_testing(ctx: &mut TxContext) {
        let otw = CONTRIBUTION {};
        init(otw, ctx);
    }
}

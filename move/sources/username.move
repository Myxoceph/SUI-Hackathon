/// TrustChain Username Registry Module
/// Manages unique username registration linked to wallet addresses
module peerflow::username {
    use std::string::String;
    use sui::table::{Self, Table};
    use sui::event;
    use sui::package;
    use sui::display;

    // ==================== One-Time-Witness ====================
    
    /// One-Time-Witness for Display creation
    public struct USERNAME has drop {}

    // ==================== Error Codes ====================
    
    const EUsernameTaken: u64 = 1;

    // ==================== Structs ====================

    /// User profile NFT - soulbound to owner
    public struct UserProfile has key {
        id: UID,
        owner: address,
        username: String,
        created_at: u64,
    }

    /// Global username registry - shared object
    public struct UsernameRegistry has key {
        id: UID,
        usernames: Table<String, address>, // username -> address mapping
        total_users: u64,
    }

    // ==================== Events ====================

    public struct UsernameRegistered has copy, drop {
        owner: address,
        username: String,
        timestamp: u64,
    }

    // ==================== Init ====================

    fun init(otw: USERNAME, ctx: &mut TxContext) {
        // Create shared registry
        let registry = UsernameRegistry {
            id: object::new(ctx),
            usernames: table::new(ctx),
            total_users: 0,
        };
        transfer::share_object(registry);

        // Setup Display for Profile NFT visualization
        let publisher = package::claim(otw, ctx);
        let mut display = display::new<UserProfile>(&publisher, ctx);
        
        // Define how User Profiles appear in wallets/explorers
        display.add(
            b"name".to_string(),
            b"@{username}".to_string()
        );
        display.add(
            b"description".to_string(),
            b"42 Student Profile - Soulbound Identity".to_string()
        );
        display.add(
            b"image_url".to_string(),
            b"https://api.dicebear.com/7.x/avataaars/svg?seed={username}".to_string()
        );
        
        display.update_version();

        transfer::public_transfer(publisher, ctx.sender());
        transfer::public_transfer(display, ctx.sender());
    }

    // ==================== Core Functions ====================

    /// Register a new username (one per address)
    #[allow(lint(public_entry))]
    public entry fun register_username(
        registry: &mut UsernameRegistry,
        username: String,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        let timestamp = tx_context::epoch(ctx);

        // Check if username is already taken
        assert!(!table::contains(&registry.usernames, username), EUsernameTaken);

        // Add to registry
        table::add(&mut registry.usernames, username, sender);
        registry.total_users = registry.total_users + 1;

        // Create user profile NFT
        let profile = UserProfile {
            id: object::new(ctx),
            owner: sender,
            username,
            created_at: timestamp,
        };

        // Emit event
        event::emit(UsernameRegistered {
            owner: sender,
            username,
            timestamp,
        });

        // Transfer profile to user (soulbound)
        transfer::transfer(profile, sender);
    }

    // ==================== View Functions ====================

    /// Check if username is available
    public fun is_username_available(registry: &UsernameRegistry, username: String): bool {
        !table::contains(&registry.usernames, username)
    }

    /// Get address by username
    public fun get_address_by_username(registry: &UsernameRegistry, username: String): address {
        *table::borrow(&registry.usernames, username)
    }

    /// Get total registered users
    public fun get_total_users(registry: &UsernameRegistry): u64 {
        registry.total_users
    }

    /// Get profile info
    public fun get_profile_info(profile: &UserProfile): (address, String, u64) {
        (profile.owner, profile.username, profile.created_at)
    }

    // ==================== Test-Only Functions ====================

    #[test_only]
    public fun init_for_testing(ctx: &mut TxContext) {
        let otw = USERNAME {};
        init(otw, ctx);
    }
}

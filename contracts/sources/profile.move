module talent_passport::profile {
    use sui::object::{Self, UID};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use std::string::{Self, String};

    /// User profile object representing on-chain identity
    public struct UserProfile has key, store {
        id: UID,
        owner: address,
        reputation_score: u64,
        metadata_uri: String, // IPFS link to profile details
    }

    /// Event emitted when a profile is created
    public struct ProfileCreated has copy, drop {
        profile_id: address,
        owner: address,
    }

    /// Event emitted when metadata is updated
    public struct MetadataUpdated has copy, drop {
        profile_id: address,
        new_uri: String,
    }

    /// Event emitted when reputation increases
    public struct ReputationIncreased has copy, drop {
        profile_id: address,
        new_score: u64,
    }

    /// Error codes
    const E_NOT_PROFILE_OWNER: u64 = 0;
    const E_INVALID_REPUTATION: u64 = 1;

    /// Create a new user profile
    public entry fun create_profile(
        metadata_uri: vector<u8>,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        let profile = UserProfile {
            id: object::new(ctx),
            owner: sender,
            reputation_score: 0,
            metadata_uri: string::utf8(metadata_uri),
        };

        let profile_id = object::uid_to_address(&profile.id);
        
        sui::event::emit(ProfileCreated {
            profile_id,
            owner: sender,
        });

        transfer::public_transfer(profile, sender);
    }

    /// Update profile metadata URI
    public entry fun update_metadata_uri(
        profile: &mut UserProfile,
        new_uri: vector<u8>,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        assert!(profile.owner == sender, E_NOT_PROFILE_OWNER);

        profile.metadata_uri = string::utf8(new_uri);

        sui::event::emit(MetadataUpdated {
            profile_id: object::uid_to_address(&profile.id),
            new_uri: profile.metadata_uri,
        });
    }

    /// Increase reputation score (called by task module)
    public fun increase_reputation(
        profile: &mut UserProfile,
        score: u64,
    ) {
        profile.reputation_score = profile.reputation_score + score;

        sui::event::emit(ReputationIncreased {
            profile_id: object::uid_to_address(&profile.id),
            new_score: profile.reputation_score,
        });
    }

    /// Getter functions
    public fun get_owner(profile: &UserProfile): address {
        profile.owner
    }

    public fun get_reputation_score(profile: &UserProfile): u64 {
        profile.reputation_score
    }

    public fun get_metadata_uri(profile: &UserProfile): String {
        profile.metadata_uri
    }
}

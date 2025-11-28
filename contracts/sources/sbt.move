module talent_passport::sbt {
    use sui::object::{Self, UID};
    use sui::tx_context::{TxContext};
    use sui::transfer;
    use std::string::{Self, String};

    /// Soul-Bound Token (non-transferable skill badge)
    public struct SkillBadge has key {
        id: UID,
        holder: address,
        task_id: address,
        metadata_uri: String,
    }

    /// Event emitted when SBT is minted
    public struct SkillBadgeMinted has copy, drop {
        badge_id: address,
        holder: address,
        task_id: address,
    }

    /// Mint a new skill badge (SBT) - non-transferable
    /// Called by task module after successful task completion
    public(package) fun mint_skill_badge(
        holder: address,
        task_id: address,
        metadata_uri: String,
        ctx: &mut TxContext
    ) {
        let badge = SkillBadge {
            id: object::new(ctx),
            holder,
            task_id,
            metadata_uri,
        };

        let badge_id = object::uid_to_address(&badge.id);

        sui::event::emit(SkillBadgeMinted {
            badge_id,
            holder,
            task_id,
        });

        // Transfer to holder - SkillBadge has only `key` ability, not `store`
        // This makes it non-transferable after initial transfer
        transfer::transfer(badge, holder);
    }

    /// Getter functions for verification
    public fun get_holder(badge: &SkillBadge): address {
        badge.holder
    }

    public fun get_task_id(badge: &SkillBadge): address {
        badge.task_id
    }

    public fun get_metadata_uri(badge: &SkillBadge): String {
        badge.metadata_uri
    }

    /// Verify badge ownership
    public fun verify_badge(badge: &SkillBadge, claimed_holder: address): bool {
        badge.holder == claimed_holder
    }
}

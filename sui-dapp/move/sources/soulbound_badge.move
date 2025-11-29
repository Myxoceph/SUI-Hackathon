module contributions::soulbound_badge {
    use std::string::String;
    use sui::event;
    use sui::display;
    use sui::package;

    // Soulbound Badge - non-transferable NFT
    public struct SoulboundBadge has key {
        id: sui::object::UID,
        name: String,
        description: String,
        project_name: String,
        contribution_type: String,
        image_url: String,
        owner: address,
        contribution_id: sui::object::ID,
        timestamp: u64,
    }

    // One-Time-Witness for the module
    public struct SOULBOUND_BADGE has drop {}

    // Events
    public struct BadgeMinted has copy, drop {
        badge_id: sui::object::ID,
        owner: address,
        project_name: String,
        contribution_id: sui::object::ID,
    }

    // Initialize function to set up Display
    fun init(otw: SOULBOUND_BADGE, ctx: &mut sui::tx_context::TxContext) {
        let keys = vector[
            std::string::utf8(b"name"),
            std::string::utf8(b"description"),
            std::string::utf8(b"image_url"),
            std::string::utf8(b"project_name"),
            std::string::utf8(b"contribution_type"),
        ];

        let values = vector[
            std::string::utf8(b"{name}"),
            std::string::utf8(b"{description}"),
            std::string::utf8(b"{image_url}"),
            std::string::utf8(b"{project_name}"),
            std::string::utf8(b"{contribution_type}"),
        ];

        let publisher = package::claim(otw, ctx);
        let mut display = display::new_with_fields<SoulboundBadge>(
            &publisher, keys, values, ctx
        );
        
        display::update_version(&mut display);
        
        sui::transfer::public_transfer(publisher, sui::tx_context::sender(ctx));
        sui::transfer::public_transfer(display, sui::tx_context::sender(ctx));
    }

    // Mint a new soulbound badge
    public fun mint_badge(
        project_name: String,
        description: String,
        contribution_type: String,
        contribution_id: sui::object::ID,
        recipient: address,
        ctx: &mut sui::tx_context::TxContext
    ) {
        let badge_id = sui::object::new(ctx);
        let id_copy = sui::object::uid_to_inner(&badge_id);
        
        // Generate image URL based on contribution type
        let image_url = generate_badge_image_url(&contribution_type);
        
        let mut name = std::string::utf8(b"Contribution Badge - ");
        name.append(project_name);
        
        let badge = SoulboundBadge {
            id: badge_id,
            name,
            description,
            project_name,
            contribution_type,
            image_url,
            owner: recipient,
            contribution_id,
            timestamp: sui::tx_context::epoch(ctx),
        };

        event::emit(BadgeMinted {
            badge_id: id_copy,
            owner: recipient,
            project_name,
            contribution_id,
        });

        // Transfer to recipient - they cannot transfer it to anyone else
        sui::transfer::transfer(badge, recipient);
    }

    // Helper function to generate badge image URL based on type
    fun generate_badge_image_url(contribution_type: &String): String {
        // You can customize these URLs or use IPFS/Arweave links
        let mut base_url = std::string::utf8(b"https://api.dicebear.com/7.x/shapes/svg?seed=");
        base_url.append(*contribution_type);
        base_url
    }

    // View functions
    public fun get_badge_details(badge: &SoulboundBadge): (String, String, String, String, address, sui::object::ID, u64) {
        (
            badge.name,
            badge.description,
            badge.project_name,
            badge.contribution_type,
            badge.owner,
            badge.contribution_id,
            badge.timestamp
        )
    }

    public fun get_owner(badge: &SoulboundBadge): address {
        badge.owner
    }

    public fun get_project_name(badge: &SoulboundBadge): String {
        badge.project_name
    }

    public fun get_contribution_type(badge: &SoulboundBadge): String {
        badge.contribution_type
    }

    // Note: No transfer function - badges are soulbound (non-transferable)
    // The lack of `store` ability on SoulboundBadge struct prevents trading
}

module contributions::contributions {
    use std::string::String;
    use sui::event;
    use contributions::soulbound_badge;

    // Structs
    public struct Contribution has key, store {
        id: sui::object::UID,
        title: String,
        description: String,
        proof_link: String,
        contribution_type: u8,
        creator: address,
        endorsements: u64,
        timestamp: u64,
    }

    // Events
    public struct ContributionSubmitted has copy, drop {
        contribution_id: sui::object::ID,
        creator: address,
        title: String,
        timestamp: u64,
    }

    public struct ContributionEndorsed has copy, drop {
        contribution_id: sui::object::ID,
        endorser: address,
        total_endorsements: u64,
    }

    // Public entry functions
    public fun submit_contribution(
        title: String,
        description: String,
        proof_link: String,
        contribution_type: u8,
        ctx: &mut sui::tx_context::TxContext
    ) {
        let contribution_id = sui::object::new(ctx);
        let id_copy = sui::object::uid_to_inner(&contribution_id);
        let sender = sui::tx_context::sender(ctx);
        
        let contribution = Contribution {
            id: contribution_id,
            title,
            description,
            proof_link,
            contribution_type,
            creator: sender,
            endorsements: 0,
            timestamp: sui::tx_context::epoch(ctx),
        };
        
        event::emit(ContributionSubmitted {
            contribution_id: id_copy,
            creator: sender,
            title: contribution.title,
            timestamp: contribution.timestamp,
        });
        
        // Mint a soulbound badge for the contributor
        let type_name = contribution_type_to_string(contribution_type);
        soulbound_badge::mint_badge(
            contribution.title,
            contribution.description,
            type_name,
            id_copy,
            sender,
            ctx
        );
        
        sui::transfer::share_object(contribution);
    }

    public fun endorse(
        contribution: &mut Contribution,
        ctx: &mut sui::tx_context::TxContext
    ) {
        contribution.endorsements = contribution.endorsements + 1;
        
        event::emit(ContributionEndorsed {
            contribution_id: sui::object::uid_to_inner(&contribution.id),
            endorser: sui::tx_context::sender(ctx),
            total_endorsements: contribution.endorsements,
        });
    }

    // View functions
    public fun get_contribution_details(contribution: &Contribution): (String, String, String, u8, address, u64, u64) {
        (
            contribution.title,
            contribution.description,
            contribution.proof_link,
            contribution.contribution_type,
            contribution.creator,
            contribution.endorsements,
            contribution.timestamp
        )
    }

    public fun get_endorsements(contribution: &Contribution): u64 {
        contribution.endorsements
    }

    // Helper function to convert contribution type to string
    fun contribution_type_to_string(contribution_type: u8): String {
        if (contribution_type == 0) {
            std::string::utf8(b"Development")
        } else if (contribution_type == 1) {
            std::string::utf8(b"Design")
        } else if (contribution_type == 2) {
            std::string::utf8(b"Research")
        } else if (contribution_type == 3) {
            std::string::utf8(b"Documentation")
        } else if (contribution_type == 4) {
            std::string::utf8(b"Community")
        } else {
            std::string::utf8(b"Other")
        }
    }
}

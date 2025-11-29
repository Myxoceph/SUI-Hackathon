#[test_only]
module trustchain::contribution_tests {
    use trustchain::contribution::{Self, Contribution, ContributionRegistry};
    use sui::test_scenario::{Self as ts, Scenario};
    use std::string;

    const ADMIN: address = @0xAD;
    const USER1: address = @0x1;
    const USER2: address = @0x2;

    // ==================== Test Helpers ====================

    fun setup_test(): Scenario {
        let mut scenario = ts::begin(ADMIN);
        {
            let ctx = ts::ctx(&mut scenario);
            contribution::init_for_testing(ctx);
        };
        scenario
    }

    // ==================== Tests ====================

    #[test]
    fun test_mint_contribution() {
        let mut scenario = setup_test();
        
        // Mint contribution
        ts::next_tx(&mut scenario, USER1);
        {
            let mut registry = ts::take_shared<ContributionRegistry>(&scenario);
            let ctx = ts::ctx(&mut scenario);
            
            contribution::mint_contribution(
                &mut registry,
                string::utf8(b"PULL REQUEST"),
                string::utf8(b"Fixed memory leak"),
                string::utf8(b"Optimized malloc implementation"),
                string::utf8(b"https://github.com/example/pr/123"),
                ctx
            );
            
            ts::return_shared(registry);
        };

        // Verify contribution was created
        ts::next_tx(&mut scenario, USER1);
        {
            let contribution = ts::take_from_sender<Contribution>(&scenario);
            let (owner, _, _, _, _, endorsements, _) = contribution::get_contribution_info(&contribution);
            
            assert!(owner == USER1, 0);
            assert!(endorsements == 0, 1);
            
            ts::return_to_sender(&scenario, contribution);
        };

        ts::end(scenario);
    }

    #[test]
    fun test_endorse_contribution() {
        let mut scenario = setup_test();
        
        // USER1 mints contribution
        ts::next_tx(&mut scenario, USER1);
        {
            let mut registry = ts::take_shared<ContributionRegistry>(&scenario);
            let ctx = ts::ctx(&mut scenario);
            
            contribution::mint_contribution(
                &mut registry,
                string::utf8(b"HACKATHON"),
                string::utf8(b"Sui Overflow Winner"),
                string::utf8(b"Built DeFi protocol"),
                string::utf8(b"https://github.com/example"),
                ctx
            );
            
            ts::return_shared(registry);
        };

        // USER2 endorses USER1's contribution
        ts::next_tx(&mut scenario, USER2);
        {
            let mut registry = ts::take_shared<ContributionRegistry>(&scenario);
            let contribution = ts::take_from_address<Contribution>(&scenario, USER1);
            let ctx = ts::ctx(&mut scenario);
            
            let contribution_id = object::id(&contribution);
            contribution::endorse_contribution(&mut registry, contribution_id, USER1, ctx);
            
            // Check endorsement count from registry
            let endorsements = contribution::get_endorsement_count(&registry, contribution_id);
            assert!(endorsements == 1, 0);
            
            ts::return_shared(registry);
            ts::return_to_address(USER1, contribution);
        };

        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = contribution::ESelfEndorsement)]
    fun test_cannot_self_endorse() {
        let mut scenario = setup_test();
        
        // USER1 mints contribution
        ts::next_tx(&mut scenario, USER1);
        {
            let mut registry = ts::take_shared<ContributionRegistry>(&scenario);
            let ctx = ts::ctx(&mut scenario);
            
            contribution::mint_contribution(
                &mut registry,
                string::utf8(b"PROJECT"),
                string::utf8(b"Test Project"),
                string::utf8(b"Description"),
                string::utf8(b"https://example.com"),
                ctx
            );
            
            ts::return_shared(registry);
        };

        // USER1 tries to endorse own contribution (should fail)
        ts::next_tx(&mut scenario, USER1);
        {
            let mut registry = ts::take_shared<ContributionRegistry>(&scenario);
            let contribution = ts::take_from_sender<Contribution>(&scenario);
            let ctx = ts::ctx(&mut scenario);
            
            let contribution_id = object::id(&contribution);
            contribution::endorse_contribution(&mut registry, contribution_id, USER1, ctx);
            
            ts::return_shared(registry);
            ts::return_to_sender(&scenario, contribution);
        };

        ts::end(scenario);
    }

    #[test]
    fun test_registry_stats() {
        let mut scenario = setup_test();
        
        // Mint 2 contributions
        ts::next_tx(&mut scenario, USER1);
        {
            let mut registry = ts::take_shared<ContributionRegistry>(&scenario);
            let ctx = ts::ctx(&mut scenario);
            
            contribution::mint_contribution(
                &mut registry,
                string::utf8(b"TYPE1"),
                string::utf8(b"Title1"),
                string::utf8(b"Desc1"),
                string::utf8(b"Link1"),
                ctx
            );
            
            ts::return_shared(registry);
        };

        ts::next_tx(&mut scenario, USER2);
        {
            let mut registry = ts::take_shared<ContributionRegistry>(&scenario);
            let ctx = ts::ctx(&mut scenario);
            
            contribution::mint_contribution(
                &mut registry,
                string::utf8(b"TYPE2"),
                string::utf8(b"Title2"),
                string::utf8(b"Desc2"),
                string::utf8(b"Link2"),
                ctx
            );
            
            let (total_contributions, total_endorsements) = contribution::get_registry_stats(&registry);
            assert!(total_contributions == 2, 0);
            assert!(total_endorsements == 0, 1);
            
            ts::return_shared(registry);
        };

        ts::end(scenario);
    }
}

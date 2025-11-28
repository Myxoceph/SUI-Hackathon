module talent_passport::task {
    use sui::object::{Self, UID};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::balance::{Self, Balance};
    use std::string::{Self, String};
    use std::option::{Self, Option};
    use std::vector;
    use talent_passport::profile::{Self, UserProfile};
    use talent_passport::sbt;

    /// Task status enumeration
    const STATUS_OPEN: u8 = 0;
    const STATUS_IN_PROGRESS: u8 = 1;
    const STATUS_SUBMITTED: u8 = 2;
    const STATUS_COMPLETED: u8 = 3;

    /// Task object
    public struct Task has key, store {
        id: UID,
        creator: address,
        status: u8,
        reward: Balance<SUI>,
        reward_amount: u64,
        required_skills_uri: String,
        description_uri: String,
        applicants: vector<address>,
        selected_applicant: Option<address>,
    }

    /// Events
    public struct TaskCreated has copy, drop {
        task_id: address,
        creator: address,
        reward_amount: u64,
    }

    public struct ApplicationSubmitted has copy, drop {
        task_id: address,
        applicant: address,
    }

    public struct ApplicantAccepted has copy, drop {
        task_id: address,
        applicant: address,
    }

    public struct WorkSubmitted has copy, drop {
        task_id: address,
        applicant: address,
    }

    public struct TaskCompleted has copy, drop {
        task_id: address,
        applicant: address,
        reward_amount: u64,
    }

    /// Error codes
    const E_NOT_TASK_CREATOR: u64 = 0;
    const E_TASK_NOT_OPEN: u64 = 1;
    const E_ALREADY_APPLIED: u64 = 2;
    const E_NO_APPLICANTS: u64 = 3;
    const E_INVALID_APPLICANT: u64 = 4;
    const E_NOT_IN_PROGRESS: u64 = 5;
    const E_NOT_SELECTED_APPLICANT: u64 = 6;
    const E_NOT_SUBMITTED: u64 = 7;

    /// Create a new task with reward
    public entry fun create_task(
        reward: Coin<SUI>,
        required_skills_uri: vector<u8>,
        description_uri: vector<u8>,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        let reward_amount = coin::value(&reward);
        let reward_balance = coin::into_balance(reward);

        let task = Task {
            id: object::new(ctx),
            creator: sender,
            status: STATUS_OPEN,
            reward: reward_balance,
            reward_amount,
            required_skills_uri: string::utf8(required_skills_uri),
            description_uri: string::utf8(description_uri),
            applicants: vector::empty(),
            selected_applicant: option::none(),
        };

        let task_id = object::uid_to_address(&task.id);

        sui::event::emit(TaskCreated {
            task_id,
            creator: sender,
            reward_amount,
        });

        transfer::public_share_object(task);
    }

    /// Apply to a task
    public entry fun apply_to_task(
        task: &mut Task,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        assert!(task.status == STATUS_OPEN, E_TASK_NOT_OPEN);
        assert!(!vector::contains(&task.applicants, &sender), E_ALREADY_APPLIED);

        vector::push_back(&mut task.applicants, sender);

        sui::event::emit(ApplicationSubmitted {
            task_id: object::uid_to_address(&task.id),
            applicant: sender,
        });
    }

    /// Accept an applicant (task creator only)
    public entry fun accept_applicant(
        task: &mut Task,
        applicant: address,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        assert!(task.creator == sender, E_NOT_TASK_CREATOR);
        assert!(task.status == STATUS_OPEN, E_TASK_NOT_OPEN);
        assert!(vector::contains(&task.applicants, &applicant), E_INVALID_APPLICANT);

        task.status = STATUS_IN_PROGRESS;
        task.selected_applicant = option::some(applicant);

        sui::event::emit(ApplicantAccepted {
            task_id: object::uid_to_address(&task.id),
            applicant,
        });
    }

    /// Submit work (selected applicant only)
    public entry fun submit_work(
        task: &mut Task,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        assert!(task.status == STATUS_IN_PROGRESS, E_NOT_IN_PROGRESS);
        assert!(option::contains(&task.selected_applicant, &sender), E_NOT_SELECTED_APPLICANT);

        task.status = STATUS_SUBMITTED;

        sui::event::emit(WorkSubmitted {
            task_id: object::uid_to_address(&task.id),
            applicant: sender,
        });
    }

    /// Confirm completion and distribute rewards (task creator only)
    public entry fun confirm_completion(
        task: &mut Task,
        applicant_profile: &mut UserProfile,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        assert!(task.creator == sender, E_NOT_TASK_CREATOR);
        assert!(task.status == STATUS_SUBMITTED, E_NOT_SUBMITTED);

        let applicant = option::extract(&mut task.selected_applicant);
        assert!(profile::get_owner(applicant_profile) == applicant, E_INVALID_APPLICANT);

        // Transfer reward
        let reward_coin = coin::from_balance(
            balance::withdraw_all(&mut task.reward),
            ctx
        );
        transfer::public_transfer(reward_coin, applicant);

        // Update reputation
        profile::increase_reputation(applicant_profile, 10);

        // Mint SBT
        let task_id = object::uid_to_address(&task.id);
        sbt::mint_skill_badge(
            applicant,
            task_id,
            task.description_uri,
            ctx
        );

        // Update task status
        task.status = STATUS_COMPLETED;

        sui::event::emit(TaskCompleted {
            task_id,
            applicant,
            reward_amount: task.reward_amount,
        });
    }

    /// Getter functions
    public fun get_creator(task: &Task): address {
        task.creator
    }

    public fun get_status(task: &Task): u8 {
        task.status
    }

    public fun get_reward_amount(task: &Task): u64 {
        task.reward_amount
    }

    public fun get_applicants(task: &Task): vector<address> {
        task.applicants
    }

    public fun get_selected_applicant(task: &Task): Option<address> {
        task.selected_applicant
    }

    public fun get_description_uri(task: &Task): String {
        task.description_uri
    }
}

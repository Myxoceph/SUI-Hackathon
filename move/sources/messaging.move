/// On-chain messaging module for PeerFlow
/// All messages are stored as events on the SUI blockchain
module peerflow::messaging {
    use std::string::String;
    use sui::event;

    /// Event emitted when a message is sent
    public struct MessageSent has copy, drop {
        sender: address,
        recipient: address,
        content: String,
        timestamp: u64,
    }

    /// Send a message to another address
    /// The message is stored as an event on-chain
    public entry fun send_message(
        recipient: address,
        content: String,
        timestamp: u64,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        
        event::emit(MessageSent {
            sender,
            recipient,
            content,
            timestamp,
        });
    }
}

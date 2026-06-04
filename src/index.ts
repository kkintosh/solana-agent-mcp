import * as dotenv from "dotenv";
import { SolanaAgentKit, KeypairWallet, Action } from "solana-agent-kit";
import { startMcpServer } from "@solana-agent-kit/adapter-mcp";
import TokenPlugin from "@solana-agent-kit/plugin-token";
import bs58 from "bs58";
import { Keypair } from "@solana/web3.js";

dotenv.config();

if (!process.env.SOLANA_PRIVATE_KEY) {
    throw new Error("Please set your SOLANA_PRIVATE_KEY in .env");
}

if (!process.env.RPC_URL) {
    throw new Error("Please set your RPC_URL in .env");
}

const decodedPrivateKey = bs58.decode(process.env.SOLANA_PRIVATE_KEY);
const keypair = Keypair.fromSecretKey(decodedPrivateKey);
const wallet = new KeypairWallet(keypair, process.env.RPC_URL as string);

// Create agent with plugin
const agent = new SolanaAgentKit(wallet, wallet.rpcUrl, {}).use(TokenPlugin);

// Select which actions to expose to the MCP server
const mcpActions: Record<string, Action> = {
    BALANCE_ACTION: agent.actions.find((action) => action.name === "BALANCE_ACTION")!,
    TOKEN_BALANCE_ACTION: agent.actions.find((action) => action.name === "TOKEN_BALANCE_ACTION")!,
    REQUEST_FUNDS: agent.actions.find((action) => action.name === "REQUEST_FUNDS")!,
    WALLET_ADDRESS: agent.actions.find((action) => action.name === "WALLET_ADDRESS")!
};

startMcpServer(mcpActions, agent, { name: "solana-agent", version: "0.0.1" });
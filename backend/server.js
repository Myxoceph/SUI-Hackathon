/**
 * Enoki Gas Sponsorship Backend Service
 * Bu servis Walrus'a deploy edilmiş frontend için gas sponsorship sağlar
 */

import express from 'express';
import cors from 'cors';
import { EnokiClient } from '@mysten/enoki';
import { Transaction } from '@mysten/sui/transactions';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration - Walrus domain'inizi ekleyin
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  // Walrus domain'inizi buraya ekleyin:
  // 'https://your-site-id.walrus.site',
  // Production domain:
  // 'https://your-custom-domain.com',
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin) || 
        origin.endsWith('.walrus.site') || 
        origin.includes('localhost')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));

// Enoki Client initialization
const ENOKI_PRIVATE_KEY = process.env.ENOKI_PRIVATE_KEY;

if (!ENOKI_PRIVATE_KEY || ENOKI_PRIVATE_KEY.includes('YOUR_')) {
  console.error('❌ ENOKI_PRIVATE_KEY not configured!');
  console.error('Get it from: https://portal.enoki.mystenlabs.com/');
  process.exit(1);
}

const enokiClient = new EnokiClient({
  apiKey: ENOKI_PRIVATE_KEY,
});

console.log('✅ Enoki client initialized');

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'Enoki Gas Sponsorship',
    timestamp: new Date().toISOString(),
  });
});

// Check sponsorship status
app.get('/api/sponsorship/status', async (req, res) => {
  try {
    // Bu endpoint Enoki portal ayarlarını kontrol eder
    // Gerçek budget bilgisi için Enoki Portal'a bakın
    res.json({
      available: true,
      message: 'Sponsorship configured. Check Enoki Portal for budget details.',
      portalUrl: 'https://portal.enoki.mystenlabs.com/',
    });
  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({
      available: false,
      error: error.message,
    });
  }
});

// Sponsor a transaction
app.post('/api/sponsorship/sponsor', async (req, res) => {
  try {
    const { transactionData, sender, network = 'testnet' } = req.body;

    if (!transactionData || !sender) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: transactionData, sender',
      });
    }

    console.log(`📝 Sponsoring transaction for ${sender}`);

    // Deserialize transaction from base64
    const transaction = Transaction.from(transactionData);

    // Sponsor the transaction through Enoki
    const sponsoredTx = await enokiClient.createSponsoredTransaction({
      transaction,
      sender,
      network,
    });

    console.log('✅ Transaction sponsored successfully');

    res.json({
      success: true,
      sponsoredTransaction: sponsoredTx,
      message: 'Transaction sponsored successfully',
    });

  } catch (error) {
    console.error('❌ Sponsorship error:', error);
    
    res.status(500).json({
      success: false,
      error: error.message,
      details: error.toString(),
    });
  }
});

// Execute sponsored transaction
app.post('/api/sponsorship/execute', async (req, res) => {
  try {
    const { sponsoredTransaction, signature } = req.body;

    if (!sponsoredTransaction || !signature) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: sponsoredTransaction, signature',
      });
    }

    console.log('🚀 Executing sponsored transaction...');

    // Execute the transaction with Enoki
    const result = await enokiClient.executeSponsoredTransaction({
      sponsoredTransaction,
      signature,
    });

    console.log('✅ Transaction executed:', result.digest);

    res.json({
      success: true,
      digest: result.digest,
      effects: result.effects,
    });

  } catch (error) {
    console.error('❌ Execution error:', error);
    
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal server error',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Enoki Sponsorship Service running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`💰 Sponsorship endpoint: http://localhost:${PORT}/api/sponsorship/sponsor`);
  console.log('\n⚠️  Remember to:');
  console.log('   1. Configure CORS for your Walrus domain');
  console.log('   2. Set up sponsorship budget in Enoki Portal');
  console.log('   3. Update frontend VITE_BACKEND_URL');
});

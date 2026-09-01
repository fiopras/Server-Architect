import dotenv from 'dotenv';
import { startGatewayBot } from './src/gatewayBot.js';

dotenv.config();

console.log('🤖 Starting Server Architect Discord Gateway Bot...');
startGatewayBot();

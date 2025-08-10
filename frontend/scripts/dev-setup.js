#!/usr/bin/env node

import { execSync, spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ANSI color codes for pretty output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
  console.log(`\n${colors.cyan}${colors.bright}${step}${colors.reset} ${message}`);
}

function logSuccess(message) {
  console.log(`${colors.green}✓${colors.reset} ${message}`);
}

function logError(message) {
  console.log(`${colors.red}✗${colors.reset} ${message}`);
}

function logWarning(message) {
  console.log(`${colors.yellow}⚠${colors.reset} ${message}`);
}

function runCommand(command, options = {}) {
  try {
    const result = execSync(command, { 
      stdio: 'inherit', 
      cwd: resolve(__dirname, '..'),
      ...options 
    });
    return { success: true, result };
  } catch (error) {
    return { success: false, error };
  }
}

function waitForService(serviceName, maxAttempts = 30) {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    
    const checkService = () => {
      attempts++;
      log(`Checking ${serviceName}... (attempt ${attempts}/${maxAttempts})`, 'yellow');
      
      const result = runCommand(`docker-compose ps ${serviceName}`, { stdio: 'pipe' });
      
      if (result.success) {
        const output = result.result.toString();
        if (output.includes('Up') || output.includes('healthy')) {
          logSuccess(`${serviceName} is ready!`);
          resolve();
          return;
        }
      }
      
      if (attempts >= maxAttempts) {
        logError(`${serviceName} failed to start after ${maxAttempts} attempts`);
        reject(new Error(`${serviceName} startup timeout`));
        return;
      }
      
      setTimeout(checkService, 2000);
    };
    
    checkService();
  });
}

async function main() {
  log('🎨 Starting Frontend Development Environment', 'bright');
  log('This will set up everything automatically...', 'blue');
  
  // Step 1: Check if Docker is running
  logStep('1', 'Checking Docker...');
  const dockerCheck = runCommand('docker --version', { stdio: 'pipe' });
  if (!dockerCheck.success) {
    logError('Docker is not installed or not running. Please start Docker Desktop.');
    process.exit(1);
  }
  logSuccess('Docker is ready');
  
  // Step 2: Start Docker services
  logStep('2', 'Starting Docker services...');
  const dockerUp = runCommand('docker-compose up -d --build');
  if (!dockerUp.success) {
    logError('Failed to start Docker services');
    process.exit(1);
  }
  logSuccess('Docker services started');
  
  // Step 3: Wait for backend to be ready
  logStep('3', 'Waiting for backend API...');
  try {
    await waitForService('backend');
  } catch (error) {
    logWarning('Backend might not be ready yet, but continuing...');
  }
  
  // Step 4: Show status
  logStep('4', 'Checking service status...');
  runCommand('docker-compose ps');
  
  // Step 5: Show helpful information
  log('\n🎉 Frontend development environment is ready!', 'bright');
  log('\n📋 Service URLs:', 'cyan');
  log('   Frontend: http://localhost:5173', 'green');
  log('   Backend API: http://localhost:3001', 'green');
  log('   Database: localhost:5432', 'green');
  
  log('\n🔧 Useful commands:', 'cyan');
  log('   View logs: docker-compose logs -f frontend', 'yellow');
  log('   Stop services: docker-compose down', 'yellow');
  log('   Restart: docker-compose restart', 'yellow');
  log('   Local dev (no Docker): npm run dev:local', 'yellow');
  
  log('\n💡 Tips:', 'cyan');
  log('   - Your React code changes will auto-reload', 'yellow');
  log('   - Hot module replacement is enabled', 'yellow');
  log('   - Use Ctrl+C to stop all services', 'yellow');
  log('   - Backend changes will auto-restart', 'yellow');
  
  // Step 6: Show logs
  log('\n📝 Starting log stream (Ctrl+C to stop)...', 'cyan');
  log('='.repeat(50), 'blue');
  
  // Start log streaming
  const logProcess = spawn('docker-compose', ['logs', '-f', 'frontend'], {
    stdio: 'inherit',
    cwd: resolve(__dirname, '..')
  });
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    log('\n\n🛑 Stopping development environment...', 'yellow');
    logProcess.kill();
    runCommand('docker-compose down');
    log('Goodbye! 👋', 'green');
    process.exit(0);
  });
  
  logProcess.on('close', (code) => {
    log(`\nLog stream ended with code ${code}`, 'yellow');
  });
}

// Run the setup
main().catch((error) => {
  logError(`Setup failed: ${error.message}`);
  process.exit(1);
}); 
#!/usr/bin/env node

const { execSync, spawn, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

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

function runCommandSync(command, options = {}) {
  try {
    const result = spawnSync(command, [], { 
      stdio: 'inherit', 
      cwd: path.resolve(__dirname, '..'),
      shell: true,
      ...options 
    });
    return { success: result.status === 0, result };
  } catch (error) {
    return { success: false, error };
  }
}

function runCommandWithOutput(command, options = {}) {
  try {
    const result = spawnSync(command, [], { 
      stdio: 'pipe', 
      cwd: path.resolve(__dirname, '..'),
      shell: true,
      encoding: 'utf8',
      ...options 
    });
    
    return { 
      success: result.status === 0, 
      stdout: result.stdout,
      stderr: result.stderr,
      result 
    };
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
  log('🚀 Starting Docker Study Development Environment', 'bright');
  log('This will set up everything automatically...', 'blue');
  
  // Step 1: Check if Docker is running
  logStep('1', 'Checking Docker...');
  const dockerCheck = runCommandWithOutput('docker --version');
  if (!dockerCheck.success) {
    logError('Docker is not installed or not running. Please start Docker Desktop.');
    process.exit(1);
  }
  logSuccess('Docker is ready');
  
  // Step 2: Start Docker services
  logStep('2', 'Starting Docker services...');
  const dockerUp = runCommandSync('docker-compose up -d --build');
  if (!dockerUp.success) {
    logError('Failed to start Docker services');
    process.exit(1);
  }
  logSuccess('Docker services started');
  
  // Step 3: Wait for database to be ready
  logStep('3', 'Waiting for database to be ready...');
  try {
    await waitForService('database');
  } catch (error) {
    logError('Database failed to start properly');
    process.exit(1);
  }
  
  // Step 4: Set up database schema
  logStep('4', 'Setting up database schema...');
  const dbPush = runCommandSync('docker-compose exec -T backend npx prisma db push --schema=./prisma/schema.prisma');
  if (!dbPush.success) {
    logWarning('Database push failed, trying migrate deploy...');
    const dbMigrate = runCommandSync('docker-compose exec -T backend npx prisma migrate deploy --schema=./prisma/schema.prisma');
    if (!dbMigrate.success) {
      logError('Failed to set up database schema');
      process.exit(1);
    }
  }
  logSuccess('Database schema ready');
  
  // Step 5: Generate Prisma client
  logStep('5', 'Generating Prisma client...');
  const prismaGenerate = runCommandSync('docker-compose exec -T backend npx prisma generate --schema=./prisma/schema.prisma');
  if (!prismaGenerate.success) {
    logError('Failed to generate Prisma client');
    process.exit(1);
  }
  logSuccess('Prisma client generated');
  
  // Step 6: Show status
  logStep('6', 'Checking service status...');
  runCommandSync('docker-compose ps');
  
  // Step 7: Show helpful information
  log('\n🎉 Development environment is ready!', 'bright');
  log('\n📋 Service URLs:', 'cyan');
  log('   Frontend: http://localhost:5173', 'green');
  log('   Backend API: http://localhost:3001', 'green');
  log('   Database: localhost:5432', 'green');
  
  log('\n🔧 Useful commands:', 'cyan');
  log('   View logs: docker-compose logs -f', 'yellow');
  log('   Stop services: docker-compose down', 'yellow');
  log('   Restart: docker-compose restart', 'yellow');
  log('   Database studio: docker-compose exec backend npx prisma studio', 'yellow');
  
  log('\n💡 Tips:', 'cyan');
  log('   - Your code changes will auto-reload', 'yellow');
  log('   - Database changes require running this script again', 'yellow');
  log('   - Use Ctrl+C to stop all services', 'yellow');
  
  // Step 8: Show logs
  log('\n📝 Starting log stream (Ctrl+C to stop)...', 'cyan');
  log('='.repeat(50), 'blue');
  
  // Start log streaming
  const logProcess = spawn('docker-compose', ['logs', '-f'], {
    stdio: 'inherit',
    cwd: path.resolve(__dirname, '..')
  });
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    log('\n\n🛑 Stopping development environment...', 'yellow');
    logProcess.kill();
    runCommandSync('docker-compose down');
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
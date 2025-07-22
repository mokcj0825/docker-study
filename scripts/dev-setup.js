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
      
      // First check if container is running
      const psResult = runCommandWithOutput(`docker-compose ps ${serviceName}`);
      
      if (!psResult.success) {
        if (attempts >= maxAttempts) {
          logError(`${serviceName} failed to start after ${maxAttempts} attempts`);
          reject(new Error(`${serviceName} startup timeout`));
          return;
        }
        setTimeout(checkService, 2000);
        return;
      }
      
      // Check if container is up
      if (!psResult.stdout.includes('Up')) {
        if (attempts >= maxAttempts) {
          logError(`${serviceName} is not running after ${maxAttempts} attempts`);
          reject(new Error(`${serviceName} not running`));
          return;
        }
        setTimeout(checkService, 2000);
        return;
      }
      
      // Try to check health status if healthcheck is defined
      const healthResult = runCommandWithOutput(`docker inspect --format='{{.State.Health.Status}}' docker-study-${serviceName}-1`);
      
      if (healthResult.success && healthResult.stdout.trim() === 'healthy') {
        logSuccess(`${serviceName} is healthy!`);
        resolve();
        return;
      }
      
      // If no healthcheck or not healthy, check if service is responding
      if (serviceName === 'database') {
        // For database, check if it's accepting connections
        const dbCheck = runCommandWithOutput(`docker-compose exec -T ${serviceName} pg_isready -U postgres`);
        if (dbCheck.success) {
          logSuccess(`${serviceName} is ready!`);
          resolve();
          return;
        }
      } else if (serviceName === 'backend') {
        // For backend, check if it's responding on port 3001
        const backendCheck = runCommandWithOutput(`curl -f http://localhost:3001/health || echo "not ready"`);
        if (backendCheck.success && !backendCheck.stdout.includes('not ready')) {
          logSuccess(`${serviceName} is ready!`);
          resolve();
          return;
        }
      } else if (serviceName === 'frontend') {
        // For frontend, check if it's responding on port 5173
        const frontendCheck = runCommandWithOutput(`curl -f http://localhost:5173 || echo "not ready"`);
        if (frontendCheck.success && !frontendCheck.stdout.includes('not ready')) {
          logSuccess(`${serviceName} is ready!`);
          resolve();
          return;
        }
      } else {
        // For other services, assume ready if container is up
        logSuccess(`${serviceName} is ready!`);
        resolve();
        return;
      }
      
      if (attempts >= maxAttempts) {
        logError(`${serviceName} failed to be ready after ${maxAttempts} attempts`);
        reject(new Error(`${serviceName} readiness timeout`));
        return;
      }
      
      setTimeout(checkService, 2000);
    };
    
    checkService();
  });
}

async function main() {
  log('🚀 Starting Full-Stack Docker Study Development Environment', 'bright');
  log('This will set up everything automatically...', 'blue');
  
  // Step 1: Check if Docker is running
  logStep('1', 'Checking Docker...');
  const dockerCheck = runCommandWithOutput('docker --version');
  if (!dockerCheck.success) {
    logError('Docker is not installed or not running. Please start Docker Desktop.');
    process.exit(1);
  }
  logSuccess('Docker is ready');
  
  // Step 2: Check if dependencies are installed
  logStep('2', 'Checking dependencies...');
  const backendNodeModules = path.resolve(__dirname, '../backend/node_modules');
  const frontendNodeModules = path.resolve(__dirname, '../frontend/node_modules');
  
  if (!fs.existsSync(backendNodeModules) || !fs.existsSync(frontendNodeModules)) {
    logWarning('Dependencies not found. Installing...');
    const installResult = runCommandSync('npm run install:all');
    if (!installResult.success) {
      logError('Failed to install dependencies');
      process.exit(1);
    }
  }
  logSuccess('Dependencies ready');
  
  // Step 3: Start Docker services
  logStep('3', 'Starting Docker services...');
  const dockerUp = runCommandSync('docker-compose up -d --build');
  if (!dockerUp.success) {
    logError('Failed to start Docker services');
    process.exit(1);
  }
  logSuccess('Docker services started');
  
  // Step 4: Wait for database to be ready
  logStep('4', 'Waiting for database to be ready...');
  try {
    await waitForService('database');
  } catch (error) {
    logError('Database failed to start properly');
    process.exit(1);
  }
  
  // Step 5: Set up database schema
  logStep('5', 'Setting up database schema...');
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
  
  // Step 6: Generate Prisma client
  logStep('6', 'Generating Prisma client...');
  const prismaGenerate = runCommandSync('docker-compose exec -T backend npx prisma generate --schema=./prisma/schema.prisma');
  if (!prismaGenerate.success) {
    logError('Failed to generate Prisma client');
    process.exit(1);
  }
  logSuccess('Prisma client generated');
  
  // Step 7: Wait for backend to be ready
  logStep('7', 'Waiting for backend API...');
  try {
    await waitForService('backend');
  } catch (error) {
    logWarning('Backend might not be ready yet, but continuing...');
  }
  
  // Step 8: Wait for frontend to be ready
  logStep('8', 'Waiting for frontend...');
  try {
    await waitForService('frontend');
  } catch (error) {
    logWarning('Frontend might not be ready yet, but continuing...');
  }
  
  // Step 9: Show status
  logStep('9', 'Checking service status...');
  runCommandSync('docker-compose ps');
  
  // Step 10: Show helpful information
  log('\n🎉 Full-Stack Development Environment is Ready!', 'bright');
  log('\n📋 Service URLs:', 'cyan');
  log('   Frontend: http://localhost:5173', 'green');
  log('   Backend API: http://localhost:3001', 'green');
  log('   Database: localhost:5432', 'green');
  
  log('\n🔧 Useful Commands:', 'cyan');
  log('   View all logs: docker-compose logs -f', 'yellow');
  log('   View backend logs: docker-compose logs -f backend', 'yellow');
  log('   View frontend logs: docker-compose logs -f frontend', 'yellow');
  log('   Stop all services: docker-compose down', 'yellow');
  log('   Restart services: docker-compose restart', 'yellow');
  log('   Database studio: docker-compose exec backend npx prisma studio', 'yellow');
  
  log('\n💡 Development Tips:', 'cyan');
  log('   - Frontend changes auto-reload with hot module replacement', 'yellow');
  log('   - Backend changes auto-restart with ts-node-dev', 'yellow');
  log('   - Database changes require running this script again', 'yellow');
  log('   - Use Ctrl+C to stop all services gracefully', 'yellow');
  log('   - All services are isolated but can communicate', 'yellow');
  
  log('\n🎯 What\'s Running:', 'cyan');
  log('   - React frontend with Vite (TypeScript)', 'yellow');
  log('   - Node.js backend with Express (TypeScript)', 'yellow');
  log('   - PostgreSQL database with Prisma ORM', 'yellow');
  log('   - Hot reload for both frontend and backend', 'yellow');
  
  // Step 11: Show logs
  log('\n📝 Starting log stream (Ctrl+C to stop)...', 'cyan');
  log('='.repeat(60), 'blue');
  
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
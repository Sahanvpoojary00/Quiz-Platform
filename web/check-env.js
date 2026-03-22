// web/check-env.js
const requiredEnv = ['DATABASE_URL', 'POSTGRES_PRISMA_URL', 'POSTGRES_URL'];

console.log('--- Environment Check ---');
requiredEnv.forEach(env => {
  if (process.env[env]) {
    console.log(`[OK] ${env} is defined (starts with ${process.env[env].substring(0, 10)}...)`);
  } else {
    console.log(`[MISSING] ${env} is NOT defined`);
  }
});
console.log('-------------------------');

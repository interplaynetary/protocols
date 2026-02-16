/**
 * Watch script for development
 * Watches schema files and rebuilds on changes
 * 
 * @package: vf-graphql
 * @since:   2026-02-14
 */

const { watch } = require('fs');
const { exec } = require('child_process');
const path = require('path');

const schemasDir = path.join(__dirname, '../schemas');

console.log('👀 Watching schemas directory for changes...');

// Initial build
console.log('🔨 Running initial build...');
exec('bun run build', (error, stdout, stderr) => {
  if (error) {
    console.error(`Build error: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`Build stderr: ${stderr}`);
  }
  console.log(stdout);
  console.log('✅ Initial build complete');
});

// Watch for changes
watch(schemasDir, { recursive: true }, (eventType, filename) => {
  if (filename && filename.endsWith('.gql')) {
    console.log(`\n📝 Detected change in ${filename}`);
    console.log('🔨 Rebuilding...');
    
    exec('bun run build', (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ Build error: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`Build stderr: ${stderr}`);
      }
      console.log(stdout);
      console.log('✅ Build complete');
      
      // Run tests after successful build
      console.log('🧪 Running tests...');
      exec('cd ../tests && bun test', (error, stdout, stderr) => {
        if (error) {
          console.error(`❌ Test error: ${error.message}`);
          return;
        }
        console.log(stdout);
        console.log('✅ Tests complete');
      });
    });
  }
});

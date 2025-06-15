
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';

const execAsync = promisify(exec);

async function checkRecentChanges() {
  try {
    console.log('🔍 Checking for recent Git changes...');
    
    // Get the last commit info
    const { stdout: lastCommit } = await execAsync('git log -1 --pretty=format:"%H|%an|%ae|%s|%ad" --date=iso');
    const [hash, author, email, message, date] = lastCommit.split('|');
    
    console.log(`📝 Last commit: ${hash.substring(0, 8)}`);
    console.log(`👤 Author: ${author} (${email})`);
    console.log(`💬 Message: ${message}`);
    console.log(`📅 Date: ${date}`);
    
    // Get changed files in the last commit
    const { stdout: changedFiles } = await execAsync('git diff-tree --no-commit-id --name-only -r HEAD');
    const files = changedFiles.trim().split('\n').filter(f => f);
    
    console.log(`\n📂 Changed files (${files.length}):`);
    files.forEach(file => console.log(`  - ${file}`));
    
    // Filter for relevant files
    const relevantFiles = files.filter(file => 
      file.endsWith('.tsx') || 
      file.endsWith('.ts') || 
      file.endsWith('.js') || 
      file.endsWith('.json') ||
      file.includes('Chat') ||
      file.includes('Menu') ||
      file.includes('Order')
    );
    
    if (relevantFiles.length > 0) {
      console.log(`\n✅ Found ${relevantFiles.length} relevant files for knowledge update:`);
      relevantFiles.forEach(file => console.log(`  - ${file}`));
      
      // Create a knowledge update summary
      const updateSummary = {
        timestamp: new Date().toISOString(),
        commit: {
          hash: hash,
          author: author,
          message: message,
          date: date
        },
        relevantFiles: relevantFiles,
        totalFiles: files.length
      };
      
      // Save to a log file
      const logFile = 'knowledge-updates.json';
      let updates = [];
      
      if (fs.existsSync(logFile)) {
        updates = JSON.parse(fs.readFileSync(logFile, 'utf-8'));
      }
      
      updates.push(updateSummary);
      
      // Keep only last 10 updates
      if (updates.length > 10) {
        updates = updates.slice(-10);
      }
      
      fs.writeFileSync(logFile, JSON.stringify(updates, null, 2));
      
      console.log(`\n💾 Knowledge update logged to ${logFile}`);
      console.log('🤖 AI assistant will be aware of these changes in the next chat session');
      
      return updateSummary;
    } else {
      console.log('\n ℹ️  No relevant files changed in the last commit');
      return null;
    }
    
  } catch (error) {
    console.error('❌ Error checking recent changes:', error.message);
    return null;
  }
}

checkRecentChanges();

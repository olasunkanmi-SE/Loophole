
import express from 'express';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';

const app = express();
app.use(express.json());

// Webhook endpoint for Git push events
app.post('/webhook/git-push', async (req, res) => {
  try {
    const { commits, repository } = req.body;
    
    // Extract changed files from commits
    const changedFiles = new Set();
    commits.forEach(commit => {
      commit.added?.forEach(file => changedFiles.add(file));
      commit.modified?.forEach(file => changedFiles.add(file));
    });

    // Filter for relevant files (code, docs, configs)
    const relevantFiles = [...changedFiles].filter(file => 
      file.endsWith('.js') || 
      file.endsWith('.ts') || 
      file.endsWith('.tsx') || 
      file.endsWith('.md') || 
      file.endsWith('.json')
    );

    if (relevantFiles.length > 0) {
      await updateKnowledgeBase(relevantFiles, commits);
    }

    res.status(200).json({ message: 'Webhook processed successfully' });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Failed to process webhook' });
  }
});

async function updateKnowledgeBase(changedFiles, commits) {
  try {
    const MAX_TOKENS_PER_BATCH = 8000; // Conservative limit for most LLMs
    const MAX_FILE_SIZE = 50000; // 50KB max per file
    const updates = [];
    let currentTokenCount = 0;
    
    // Process files in priority order
    const prioritizedFiles = prioritizeFiles(changedFiles);
    
    for (const file of prioritizedFiles) {
      if (!fs.existsSync(file)) continue;
      
      const stats = fs.statSync(file);
      if (stats.size > MAX_FILE_SIZE) {
        console.log(`Skipping large file: ${file} (${stats.size} bytes)`);
        continue;
      }
      
      const content = fs.readFileSync(file, 'utf-8');
      const estimatedTokens = estimateTokenCount(content);
      
      // If adding this file would exceed token limit, process current batch
      if (currentTokenCount + estimatedTokens > MAX_TOKENS_PER_BATCH && updates.length > 0) {
        await processBatch(updates, commits);
        updates.length = 0;
        currentTokenCount = 0;
      }
      
      // Extract only relevant changes, not entire file content
      const relevantChanges = extractRelevantChanges(file, content, commits);
      
      const fileInfo = {
        path: file,
        changes: relevantChanges,
        summary: generateFileSummary(content),
        lastModified: new Date().toISOString(),
        commitInfo: commits[0],
        estimatedTokens: estimatedTokens
      };
      
      updates.push(fileInfo);
      currentTokenCount += estimatedTokens;
    }
    
    // Process remaining batch
    if (updates.length > 0) {
      await processBatch(updates, commits);
    }
    
  } catch (error) {
    console.error('Knowledge base update error:', error);
  }
}

function prioritizeFiles(files) {
  const priorities = {
    // High priority - core application files
    '.tsx': 10, '.ts': 10, '.js': 9, '.jsx': 9,
    // Medium priority - configuration and docs
    '.json': 5, '.md': 4, '.yml': 3, '.yaml': 3,
    // Low priority - assets and generated files
    '.css': 2, '.scss': 2, '.png': 1, '.jpg': 1
  };
  
  return files.sort((a, b) => {
    const extA = path.extname(a);
    const extB = path.extname(b);
    const priorityA = priorities[extA] || 0;
    const priorityB = priorities[extB] || 0;
    return priorityB - priorityA;
  });
}

function estimateTokenCount(text) {
  // Rough estimation: 1 token ≈ 4 characters for English text
  return Math.ceil(text.length / 4);
}

function extractRelevantChanges(filePath, content, commits) {
  // For new files or if git diff isn't available, return structured summary
  const lines = content.split('\n');
  
  // Extract key elements instead of full content
  const relevantParts = {
    imports: lines.filter(line => line.includes('import') || line.includes('require')).slice(0, 10),
    functions: extractFunctionSignatures(content).slice(0, 5),
    components: extractComponentNames(content).slice(0, 5),
    exports: lines.filter(line => line.includes('export')).slice(0, 5),
    apis: extractAPIEndpoints(content),
    totalLines: lines.length
  };
  
  return relevantParts;
}

function extractFunctionSignatures(content) {
  const signatures = [];
  const functionRegex = /(function\s+\w+\([^)]*\)|const\s+\w+\s*=\s*\([^)]*\)\s*=>|export\s+function\s+\w+\([^)]*\))/g;
  let match;
  
  while ((match = functionRegex.exec(content)) !== null && signatures.length < 10) {
    signatures.push(match[1].trim());
  }
  
  return signatures;
}

function extractComponentNames(content) {
  const components = [];
  const componentRegex = /(export\s+default\s+function\s+(\w+)|function\s+(\w+)\(\)|const\s+(\w+)\s*=\s*\(\)\s*=>)/g;
  let match;
  
  while ((match = componentRegex.exec(content)) !== null && components.length < 5) {
    const componentName = match[2] || match[3] || match[4];
    if (componentName && componentName[0] === componentName[0].toUpperCase()) {
      components.push(componentName);
    }
  }
  
  return components;
}

function generateFileSummary(content) {
  const lines = content.split('\n');
  return {
    lineCount: lines.length,
    hasReactComponents: content.includes('React') || content.includes('tsx'),
    hasAPIEndpoints: content.includes('app.') && (content.includes('.get') || content.includes('.post')),
    hasDatabase: content.includes('mongoose') || content.includes('mongodb') || content.includes('db.'),
    hasTests: content.includes('test') || content.includes('describe') || content.includes('it('),
    mainPurpose: inferFilePurpose(content)
  };
}

async function processBatch(updates, commits) {
  try {
    // Store in knowledge base collection
    await storeKnowledgeUpdates(updates);
    
    // Generate AI context from changes with token-aware processing
    await generateAIContextBatch(updates, commits);
    
    console.log(`Processed batch of ${updates.length} files`);
  } catch (error) {
    console.error('Batch processing error:', error);
  }
}

async function storeKnowledgeUpdates(updates) {
  // Store in MongoDB knowledge_base collection
  const { MongoClient } = await import('mongodb');
  const client = new MongoClient(process.env.DATABASE_URL);
  
  try {
    await client.connect();
    const db = client.db('learn');
    const collection = db.collection('knowledge_base');
    
    for (const update of updates) {
      await collection.updateOne(
        { path: update.path },
        { 
          $set: {
            ...update,
            updated_at: new Date()
          }
        },
        { upsert: true }
      );
    }
  } finally {
    await client.close();
  }
}

async function generateAIContextBatch(updates, commits) {
  // Generate structured context for AI assistant with token awareness
  const context = {
    type: 'code_update_batch',
    timestamp: new Date().toISOString(),
    batchSize: updates.length,
    totalEstimatedTokens: updates.reduce((sum, update) => sum + (update.estimatedTokens || 0), 0),
    commitSummary: {
      hash: commits[0]?.id || 'unknown',
      message: commits[0]?.message || 'No message',
      author: commits[0]?.author?.name || 'Unknown',
      timestamp: commits[0]?.timestamp || new Date().toISOString()
    },
    files: updates.map(update => ({
      path: update.path,
      changes: update.changes,
      summary: update.summary,
      priority: getFilePriority(update.path),
      estimatedTokens: update.estimatedTokens
    }))
  };
  
  // Store AI context
  const { MongoClient } = await import('mongodb');
  const client = new MongoClient(process.env.DATABASE_URL);
  
  try {
    await client.connect();
    const db = client.db('learn');
    await db.collection('ai_context').insertOne(context);
    
    // Also maintain a rolling window of recent contexts (keep last 50)
    const contextCount = await db.collection('ai_context').countDocuments();
    if (contextCount > 50) {
      const oldestContexts = await db.collection('ai_context')
        .find({})
        .sort({ timestamp: 1 })
        .limit(contextCount - 50)
        .toArray();
      
      const idsToDelete = oldestContexts.map(doc => doc._id);
      await db.collection('ai_context').deleteMany({ _id: { $in: idsToDelete } });
    }
    
  } finally {
    await client.close();
  }
}

function getFilePriority(filePath) {
  if (filePath.includes('Chat.tsx') || filePath.includes('Menu')) return 'high';
  if (filePath.includes('Admin') || filePath.includes('server/')) return 'medium';
  if (filePath.includes('components/') || filePath.includes('contexts/')) return 'medium';
  return 'low';
}

function extractFileSummary(content) {
  // Extract key information from file content
  const lines = content.split('\n');
  const comments = lines.filter(line => 
    line.trim().startsWith('//') || 
    line.trim().startsWith('/*') ||
    line.trim().startsWith('*')
  );
  
  return {
    lineCount: lines.length,
    hasComments: comments.length > 0,
    mainPurpose: inferFilePurpose(content)
  };
}

function extractFunctions(content) {
  // Extract function definitions
  const functionRegex = /(function\s+\w+|const\s+\w+\s*=\s*\(|export\s+function\s+\w+)/g;
  return content.match(functionRegex) || [];
}

function extractComponents(content) {
  // Extract React component definitions
  const componentRegex = /(export\s+default\s+function\s+\w+|function\s+\w+\(\)|const\s+\w+\s*=\s*\(\)\s*=>)/g;
  return content.match(componentRegex) || [];
}

function extractAPIEndpoints(content) {
  // Extract API endpoint definitions
  const apiRegex = /(app\.(get|post|put|delete)\s*\(['"`]([^'"`]+)['"`])/g;
  const matches = [];
  let match;
  
  while ((match = apiRegex.exec(content)) !== null) {
    matches.push({
      method: match[2].toUpperCase(),
      path: match[3]
    });
  }
  
  return matches;
}

function inferFilePurpose(content) {
  if (content.includes('React') || content.includes('tsx')) return 'React Component';
  if (content.includes('express') || content.includes('app.')) return 'API Server';
  if (content.includes('mongoose') || content.includes('Schema')) return 'Database Model';
  if (content.includes('test') || content.includes('describe')) return 'Test File';
  return 'Utility/Other';
}

app.listen(3002, '0.0.0.0', () => {
  console.log('Git webhook handler running on port 3002');
});

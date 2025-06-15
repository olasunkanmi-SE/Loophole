
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
    // Read changed files and extract relevant information
    const updates = [];
    
    for (const file of changedFiles) {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf-8');
        const fileInfo = {
          path: file,
          content: content,
          lastModified: new Date().toISOString(),
          commitInfo: commits[0] // Latest commit info
        };
        updates.push(fileInfo);
      }
    }

    // Store in knowledge base collection
    await storeKnowledgeUpdates(updates);
    
    // Generate AI context from changes
    await generateAIContext(updates);
    
  } catch (error) {
    console.error('Knowledge base update error:', error);
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

async function generateAIContext(updates) {
  // Generate structured context for AI assistant
  const context = {
    type: 'code_update',
    timestamp: new Date().toISOString(),
    files: updates.map(update => ({
      path: update.path,
      summary: extractFileSummary(update.content),
      functions: extractFunctions(update.content),
      components: extractComponents(update.content),
      apis: extractAPIEndpoints(update.content)
    }))
  };
  
  // Store AI context
  const { MongoClient } = await import('mongodb');
  const client = new MongoClient(process.env.DATABASE_URL);
  
  try {
    await client.connect();
    const db = client.db('learn');
    await db.collection('ai_context').insertOne(context);
  } finally {
    await client.close();
  }
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

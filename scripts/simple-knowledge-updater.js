
// Simple script to update AI knowledge base manually
import fs from 'fs';
import path from 'path';

const RELEVANT_PATHS = [
  'src/pages/',
  'src/components/',
  'server/index.js'
];

const KNOWLEDGE_FILE = 'ai-knowledge.json';

function updateKnowledgeBase() {
  const knowledge = {
    lastUpdated: new Date().toISOString(),
    components: [],
    pages: [],
    apiEndpoints: []
  };

  RELEVANT_PATHS.forEach(dirPath => {
    if (fs.existsSync(dirPath)) {
      const files = fs.readdirSync(dirPath, { recursive: true });
      files.forEach(file => {
        if (file.endsWith('.tsx') || file.endsWith('.ts')) {
          const content = fs.readFileSync(path.join(dirPath, file), 'utf-8');
          knowledge.components.push({
            name: file,
            path: path.join(dirPath, file),
            purpose: inferPurpose(content)
          });
        }
      });
    }
  });

  fs.writeFileSync(KNOWLEDGE_FILE, JSON.stringify(knowledge, null, 2));
  console.log('Knowledge base updated successfully');
}

function inferPurpose(content) {
  if (content.includes('Questionnaire')) return 'Survey/Questionnaire Component';
  if (content.includes('Admin')) return 'Admin Management Component';
  if (content.includes('Menu')) return 'Food Menu Component';
  if (content.includes('Order')) return 'Order Management Component';
  return 'General Component';
}

updateKnowledgeBase();

const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function updateImports(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const updatedContent = content.replace(/from ['"]@\/utils['"]/g, 'from "@/lib/utils"');
    
    if (content !== updatedContent) {
      fs.writeFileSync(filePath, updatedContent, 'utf8');
      console.log(`Updated imports in: ${path.relative(process.cwd(), filePath)}`);
      return 1;
    }
    return 0;
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
    return 0;
  }
}

function processDirectory(directory) {
  let count = 0;
  const entries = fs.readdirSync(directory, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    
    if (entry.isDirectory()) {
      count += processDirectory(fullPath);
    } else if (entry.isFile() && (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts'))) {
      count += updateImports(fullPath);
    }
  }
  
  return count;
}

console.log('Starting to update import paths...');
const updatedFiles = processDirectory(srcDir);
console.log(`\n✅ Updated import paths in ${updatedFiles} files.`);

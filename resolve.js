const fs = require('fs');
const glob = require('glob'); // Note: we can just use native node fs to recurse or specify files explicitly

const files = [
  'client/src/features/tenant/pages/AIChatPage.jsx',
  'client/src/pages/HomePage.jsx',
  'client/src/features/tenant/pages/SearchPage.jsx',
  'client/src/components/common/AIChatWidget.jsx'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  
  // Regex to match git conflict markers and extract the Stashed changes part
  // Format:
  // <<<<<<< Updated upstream
  // (upstream content)
  // =======
  // (stashed content)
  // >>>>>>> Stashed changes
  
  const regex = /<<<<<<< Updated upstream[\s\S]*?=======\r?\n([\s\S]*?)>>>>>>> Stashed changes/g;
  
  const newContent = content.replace(regex, (match, stashedContent) => {
    return stashedContent;
  });
  
  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    console.log(`Resolved conflicts in ${file}`);
  }
}

const fs = require('fs');
const path = require('path');
function walk(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const p = path.join(dir, file);
    if (fs.statSync(p).isDirectory()) {
      walk(p);
    } else if (p.endsWith('.css')) {
      let content = fs.readFileSync(p, 'utf8');
      let orig = content;
      
      content = content.replace(/background(-color)?:\s*#F9FAFB/gi, 'background$1: var(--bg-main)');
      content = content.replace(/background(-color)?:\s*(#fff|#ffffff|white)(?!.*var)/gi, 'background$1: var(--bg-card)');
      
      if (content !== orig) {
        fs.writeFileSync(p, content, 'utf8');
        console.log('Fixed bg in:', p);
      }
    }
  });
}
walk('src');

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (!content.includes('alert(')) return;

    // Add import
    if (!content.includes("import toast")) {
        const importMatch = content.match(/import .*?;?\n/);
        if (importMatch) {
            content = content.replace(/(import .*?;?\n)/, "$1import toast from 'react-hot-toast';\n");
        } else {
            content = "import toast from 'react-hot-toast';\n" + content;
        }
    }

    content = content.replace(/\balert\(([\s\S]*?)\)/g, (match, p1) => {
        const lower = p1.toLowerCase();
        if (lower.includes('fail') || lower.includes('err') || lower.includes('invalid') || lower.includes('please')) {
            return `toast.error(${p1})`;
        } else if (lower.includes('success')) {
            return `toast.success(${p1})`;
        } else {
            return `toast(${p1})`;
        }
    });

    fs.writeFileSync(filePath, content);
}

function walk(dir) {
    fs.readdirSync(dir).forEach(f => {
        const p = path.join(dir, f);
        if (fs.statSync(p).isDirectory()) walk(p);
        else if (p.endsWith('.js') || p.endsWith('.jsx')) processFile(p);
    });
}

walk(path.join(__dirname, 'src'));
console.log('Done replacing alerts!');

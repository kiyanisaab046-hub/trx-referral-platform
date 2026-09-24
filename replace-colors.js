const fs = require('fs');
const path = require('path');

function replaceColors(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            replaceColors(fullPath);
        } else if (fullPath.endsWith('.css') || fullPath.endsWith('.tsx') || fullPath.endsWith('.ts') || fullPath.endsWith('.js')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let newContent = content
                .replace(/255,\s*154,\s*134/g, '0, 210, 255')
                .replace(/#FF9A86/gi, '#00d2ff')
                .replace(/#FFB399/gi, '#ffaa00')
                .replace(/#FFD7A6/gi, '#ffcc00')
                .replace(/#FFF0BD/gi, '#00e5ff');
                
            if (content !== newContent) {
                fs.writeFileSync(fullPath, newContent);
                console.log(`Updated ${fullPath}`);
            }
        }
    }
}

replaceColors('d:/trx/app');

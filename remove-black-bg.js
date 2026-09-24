const fs = require('fs');
const path = require('path');

function replaceBlackBg(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            replaceBlackBg(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.css') || fullPath.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let newContent = content
                // Replace hardcoded #050505 background class with a glassmorphic dark blue for cards or transparent for sections
                .replace(/bg-\[\#050505\]\/80/gi, 'bg-[#030816]/70')
                .replace(/bg-\[\#050505\]\/95/gi, 'bg-[#030816]/85')
                .replace(/bg-\[\#050505\]/gi, 'bg-transparent')
                // Replace hardcoded #0c0a08 background class
                .replace(/bg-\[\#0c0a08\]/gi, 'bg-[#030816]')
                // Make main body class in page.tsx transparent so the body animated bg shows through
                .replace(/bg-deep-black/g, 'bg-transparent');
                
            // Also update globals.css deep-black to be slightly translucent dark blue
            if (fullPath.endsWith('globals.css')) {
                newContent = newContent.replace(/--color-deep-black:\s*#0[aA]0[aA]0[aA];/g, '--color-deep-black: rgba(5, 10, 20, 0.4);');
                newContent = newContent.replace(/--color-deep-black:\s*#050505;/g, '--color-deep-black: rgba(5, 10, 20, 0.4);');
                newContent = newContent.replace(/--color-background-dark:\s*#0f0f0f;/g, '--color-background-dark: transparent;');
            }
                
            if (content !== newContent) {
                fs.writeFileSync(fullPath, newContent);
                console.log(`Updated ${fullPath}`);
            }
        }
    }
}

replaceBlackBg('d:/trx/app');
replaceBlackBg('d:/trx/components');

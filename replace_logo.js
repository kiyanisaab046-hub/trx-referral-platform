const fs = require('fs');
const path = require('path');

function fixInDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            fixInDir(fullPath);
        } else if (file.endsWith('.tsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            const broken = `<img src=" https://i.postimg.cc/hGhQX5YR/ZMhoi-O-modified.png\\ alt=\\Logo\\ className={styles.logoBadge} style={{ padding: 0, background: 'none', objectFit: 'cover' }} />`;
            const fixed = `<img src="https://i.postimg.cc/hGhQX5YR/ZMhoi-O-modified.png" alt="Logo" className={styles.logoBadge} style={{ padding: 0, background: 'none', objectFit: 'cover' }} />`;
            if (content.includes(broken)) {
                content = content.split(broken).join(fixed);
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log('Fixed: ' + fullPath);
            }
        }
    }
}

fixInDir('D:/trx/app/dashboard');

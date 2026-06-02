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
            const target = `<img src="https://i.postimg.cc/hGhQX5YR/ZMhoi-O-modified.png" alt="Logo" className={styles.logoBadge} style={{ padding: 0, background: 'none', objectFit: 'cover' }} />`;
            const replacement = `<img src="https://i.postimg.cc/hGhQX5YR/ZMhoi-O-modified.png" alt="Logo" className={styles.logoBadge} style={{ padding: 0, background: 'none', objectFit: 'cover', width: '40px', height: '40px', borderRadius: '50%' }} />`;
            
            // Wait, maybe I also need to cover my first attempt script format?
            const target2 = `<img src="https://i.postimg.cc/hGhQX5YR/ZMhoi-O-modified.png" alt="Logo" className={styles.logoBadge} style={{ padding: 0, background: 'none', objectFit: 'cover', border: 'none' }} />`;
            const replacement2 = `<img src="https://i.postimg.cc/hGhQX5YR/ZMhoi-O-modified.png" alt="Logo" className={styles.logoBadge} style={{ padding: 0, background: 'none', objectFit: 'cover', width: '40px', height: '40px', borderRadius: '50%', border: 'none' }} />`;
            
            let changed = false;
            if (content.includes(target)) {
                content = content.split(target).join(replacement);
                changed = true;
            }
            if (content.includes(target2)) {
                content = content.split(target2).join(replacement2);
                changed = true;
            }
            if (changed) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log('Fixed size in: ' + fullPath);
            }
        }
    }
}

fixInDir('D:/trx/app/dashboard');

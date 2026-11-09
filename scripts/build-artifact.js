// Builds one self-contained HTML file (for hosting as a claude.ai Artifact)
// from index.html + css/style.css + js/app.js.
// Usage: node scripts/build-artifact.js [output-path]
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const read = f => fs.readFileSync(path.join(root, f), 'utf8');
const html = read('index.html');
const body = html.split('<!-- APP:START -->')[1].split('<!-- APP:END -->')[0];
const out = process.argv[2] || path.join(root, 'dist', 'minii-sankhuu.html');

const page = `<title>Миний Санхүү</title>
<meta name="claude:viewport-fit-sides" content="cover">
<meta name="description" content="Хувийн орлого, зарлагаа хянах энгийн веб апп">
<style>
${read('css/style.css')}
</style>
${body.trim()}
<script>
${read('js/app.js')}
</script>
`;

fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, page);
console.log('Wrote', out, (page.length / 1024).toFixed(1) + ' KB');

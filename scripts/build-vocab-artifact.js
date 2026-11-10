// Builds one self-contained HTML file of the vocabulary site (vocab/) for hosting as a claude.ai Artifact.
// Usage: node scripts/build-vocab-artifact.js [output-path]
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..', 'vocab');
const read = f => fs.readFileSync(path.join(root, f), 'utf8');
const html = read('index.html');
const body = html.split('<!-- APP:START -->')[1].split('<!-- APP:END -->')[0];
const out = process.argv[2] || path.join(__dirname, '..', 'dist', 'ugiin-san.html');

const page = `<title>Үгийн Сан</title>
<meta name="claude:viewport-fit-sides" content="cover">
<meta name="description" content="Англи үгийн дуудлага, ижил утгатай үгс, ахисан түвшний үгийн дунд түвшний орлуулга">
<style>
${read('css/style.css')}
</style>
${body.trim()}
<script>
${read('js/words.js')}
</script>
<script>
${read('js/app.js')}
</script>
`;

fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, page);
console.log('Wrote', out, (page.length / 1024).toFixed(1) + ' KB');

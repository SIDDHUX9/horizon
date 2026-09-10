import https from 'https';

const chunks = [
  '0pqt~8bl3ukh4.js',
  '0l5_gn4fiusrq.js',
  '06_ju9d9r2an..js',
  '0q15y31qzr0mv.js',
  '13~_2_wtb1toy.js',
  '0mxsps9qtx0yr.js',
  '0bwq8nckze1vs.js'
];

for (const c of chunks) {
  const url = `https://preview.midnightexplorer.com/_next/static/chunks/${c}`;
  https.get(url, res => {
    let d = '';
    res.on('data', chunk => d += chunk);
    res.on('end', () => {
      const matches = d.match(/https?:\/\/[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}[^\s"'`)]*/g);
      if (matches) {
        const relevant = matches.filter(m => m.includes('midnight') || m.includes('graphql') || m.includes('indexer') || m.includes('api'));
        if (relevant.length > 0) {
          console.log(`In ${c}:`, [...new Set(relevant)]);
        }
      }
    });
  });
}

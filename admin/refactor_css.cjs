const fs = require('fs');
const path = require('path');

function walk(dir, done) {
  let results = [];
  fs.readdir(dir, function(err, list) {
    if (err) return done(err);
    let pending = list.length;
    if (!pending) return done(null, results);
    list.forEach(function(file) {
      file = path.resolve(dir, file);
      fs.stat(file, function(err, stat) {
        if (stat && stat.isDirectory()) {
          walk(file, function(err, res) {
            results = results.concat(res);
            if (!--pending) done(null, results);
          });
        } else {
          if (file.endsWith('.jsx') || file.endsWith('.js') || file.endsWith('.css')) {
            results.push(file);
          }
          if (!--pending) done(null, results);
        }
      });
    });
  });
}

walk('./src', function(err, results) {
  if (err) throw err;
  let filesModified = 0;
  
  results.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // Backgrounds
    content = content.replace(/\bbg-zinc-950\b/g, 'bg-slate-50 dark:bg-zinc-950');
    content = content.replace(/\bbg-zinc-900\/50\b/g, 'bg-white/50 dark:bg-zinc-900/50');
    content = content.replace(/\bbg-zinc-900\b/g, 'bg-white dark:bg-zinc-900');
    content = content.replace(/\bbg-zinc-800\/50\b/g, 'bg-slate-100/50 dark:bg-zinc-800/50');
    content = content.replace(/\bbg-zinc-800\b/g, 'bg-slate-100 dark:bg-zinc-800');
    
    // Text colors
    content = content.replace(/\btext-zinc-400\b/g, 'text-slate-500 dark:text-zinc-400');
    content = content.replace(/\btext-zinc-500\b/g, 'text-slate-400 dark:text-zinc-500');
    
    // We will carefully replace text-white only if it's NOT following a solid color bg like bg-blue, bg-red
    // Actually, it's safer to just replace all text-white and fix buttons if the user complains, or we can use regex negative lookbehind
    content = content.replace(/(?<!bg-\w+-\d{3}.*)\btext-white\b/g, 'text-slate-900 dark:text-white');
    
    // Borders
    content = content.replace(/\bborder-white\/5\b/g, 'border-slate-200 dark:border-white/5');
    content = content.replace(/\bborder-white\/10\b/g, 'border-slate-300 dark:border-white/10');
    content = content.replace(/\bborder-zinc-800\b/g, 'border-slate-200 dark:border-zinc-800');

    if (content !== original) {
      fs.writeFileSync(file, content);
      filesModified++;
    }
  });
  
  console.log("Modified " + filesModified + " files.");
});

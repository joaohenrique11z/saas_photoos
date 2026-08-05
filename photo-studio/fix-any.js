const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = dir + '/' + file;
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else { 
            if (file.endsWith('.ts') || file.endsWith('.tsx')) {
                results.push(file);
            }
        }
    });
    return results;
}

const actionFiles = walk('./actions');

actionFiles.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Fix .map, .filter
    content = content.replace(/\.(map|filter)\(\(([a-zA-Z0-9_]+)\) =>/g, '.$1((_temp_$2) =>');
    content = content.replace(/\.(map|filter)\(\(_temp_([a-zA-Z0-9_]+)\) =>/g, '.$1(($2: any) =>');

    // Fix .map(a => ) without parens
    content = content.replace(/\.(map|filter)\(([a-zA-Z0-9_]+) =>/g, '.$1((_temp_$2) =>');
    content = content.replace(/\.(map|filter)\(\(_temp_([a-zA-Z0-9_]+)\) =>/g, '.$1(($2: any) =>');

    // Fix multiple parameters like .map((a, i) =>
    content = content.replace(/\.(map|filter)\(\(([a-zA-Z0-9_]+),\s*([a-zA-Z0-9_]+)\)\s*=>/g, '.$1((_temp_$2, _temp_$3) =>');
    content = content.replace(/\.(map|filter)\(\(_temp_([a-zA-Z0-9_]+),\s*_temp_([a-zA-Z0-9_]+)\)\s*=>/g, '.$1(($2: any, $3: any) =>');
    
    // Fix .reduce with 2 params
    content = content.replace(/\.reduce\(\(([a-zA-Z0-9_]+),\s*([a-zA-Z0-9_]+)\)\s*=>/g, '.reduce((_temp_$1, _temp_$2) =>');
    content = content.replace(/\.reduce\(\(_temp_([a-zA-Z0-9_]+),\s*_temp_([a-zA-Z0-9_]+)\)\s*=>/g, '.reduce(($1: any, $2: any) =>');
    
    // Fix Prisma transactions
    content = content.replace(/\$transaction\(async\s*\(([a-zA-Z0-9_]+)\)\s*=>/g, '$transaction(async (_temp_$1) =>');
    content = content.replace(/\$transaction\(async\s*\(_temp_([a-zA-Z0-9_]+)\)\s*=>/g, '$transaction(async ($1: any) =>');

    // Fix non-async Prisma transactions
    content = content.replace(/\$transaction\(\(([a-zA-Z0-9_]+)\)\s*=>/g, '$transaction((_temp_$1) =>');
    content = content.replace(/\$transaction\(\(_temp_([a-zA-Z0-9_]+)\)\s*=>/g, '$transaction(($1: any) =>');

    // One more pass for anything that already had : any so we don't mess it up
    // Actually the regex above only matches identifiers without : any.
    // wait, if it was (a: any) it wouldn't match `([a-zA-Z0-9_]+)` entirely because of the `:` and space, so it's safe.

    fs.writeFileSync(file, content, 'utf8');
    console.log('Processed', file);
});

import {spawnSync} from 'node:child_process';
import {mkdirSync,copyFileSync,cpSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
// Build an isolated app with only public routes; never load SQLite or admin.
const directory=resolve('.demo-build');
mkdirSync(resolve(directory,'app'),{recursive:true});
copyFileSync('app/page.demo.tsx',resolve(directory,'app/page.tsx'));
copyFileSync('app/layout.demo.tsx',resolve(directory,'app/layout.tsx'));
for(const file of ['globals.css'])copyFileSync('app/'+file,resolve(directory,'app',file));
for(const file of ['tailwind.config.ts','postcss.config.js'])copyFileSync(file,resolve(directory,file));
cpSync('public',resolve(directory,'public'),{recursive:true});
writeFileSync(resolve(directory,'package.json'),JSON.stringify({name:'coffe-a-demo',private:true,version:'1.0.0'}));
writeFileSync(resolve(directory,'next.config.mjs'),'export default {output:"export",images:{unoptimized:true}};');
writeFileSync(resolve(directory,'tsconfig.json'),JSON.stringify({compilerOptions:{target:'ES2017',lib:['dom','dom.iterable','esnext'],skipLibCheck:true,strict:true,noEmit:true,esModuleInterop:true,module:'esnext',moduleResolution:'bundler',resolveJsonModule:true,isolatedModules:true,jsx:'preserve',plugins:[{name:'next'}],paths:{'@/*':['../*']}},include:['next-env.d.ts','app/**/*.tsx','.next/types/**/*.ts']}));
const result=spawnSync(process.execPath,['node_modules/next/dist/bin/next','build',directory],{stdio:'inherit',env:process.env});
process.exit(result.status??1);

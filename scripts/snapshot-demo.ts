import {writeFileSync,mkdirSync} from 'node:fs';
import {listByCategory} from '../lib/data/products';
import {getTheme,getBackground} from '../lib/data/settings';
import {getMenuDisplay} from '../lib/data/menu-display';
mkdirSync('lib/demo',{recursive:true});
writeFileSync('lib/demo/menu.json',JSON.stringify({groups:listByCategory(),theme:getTheme(),background:getBackground(),display:getMenuDisplay()},null,2)+'\n');
console.log('Carta guardada en lib/demo/menu.json');

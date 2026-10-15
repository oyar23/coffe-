import {migrate} from '../lib/db/migrate';
import {clearProducts,createProduct} from '../lib/data/products';
import {setTheme,setBackground,defaultTheme,defaultBackground} from '../lib/data/settings';
import {db} from '../lib/db';
migrate();
const categories=[['Cafés calientes','Espresso','Latte','Cappuccino'],['Fríos','Cold brew','Latte helado','Limonada'],['Pastelería','Medialuna','Brownie','Cheesecake'],['Salados','Tostado','Croissant relleno','Bagel']];
db.transaction(()=>{clearProducts();categories.forEach(([categoria,...names],c)=>names.forEach((nombre,i)=>createProduct({nombre,categoria,descripcion:`${nombre} de coffe-a`,precio:2500+c*700+i*500,imagen:'/placeholder.svg',orden:i,disponible:!(c===3&&i===2),destacado:(c===0&&i===1)||(c===2&&i===2),...(i===0&&c<2?{precio_promo:2000+c*500,etiqueta_promo:'Especial'}:{})})));setTheme(defaultTheme);setBackground(defaultBackground);});
console.log('12 productos en 4 categorías. Seed reemplaza productos y marca.');

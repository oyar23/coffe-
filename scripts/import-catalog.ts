import {readFile,realpath,mkdir,copyFile,unlink} from 'node:fs/promises';
import path from 'node:path';
import {randomUUID} from 'node:crypto';
import {z} from 'zod';
import {migrate} from '../lib/db/migrate';
import {clearProducts,createProduct} from '../lib/data/products';
import {productSchema} from '../lib/validation/product';
const entrySchema=z.object({nombre:z.string(),descripcion:z.string().optional(),categoria:z.string(),precio:z.number().int().positive(),imagen:z.string().min(1)});
async function main(){
 const root=path.resolve('scraper-output');
 const raw:unknown=JSON.parse(await readFile(path.join(root,'catalogo.json'),'utf8'));
 if(!Array.isArray(raw))throw new Error('catalogo.json debe contener un array');
 // Preparar y validar todos los registros antes de que --reset elimine datos.
 const prepared:{index:number;source:string;destination:string;input:z.input<typeof productSchema>}[]=[];
 const errors:string[]=[];
 for(const [index,value] of raw.entries()){
  try{
   const entry=entrySchema.parse(value);
   const imageRoot=await realpath(path.join(root,'imagenes'));
   const source=await realpath(path.resolve(root,entry.imagen));
   const relative=path.relative(imageRoot,source);
   if(relative.startsWith('..')||path.isAbsolute(relative))throw new Error('La imagen debe estar dentro de scraper-output/imagenes/');
   const ext=path.extname(source).toLowerCase();
   if(!['.jpg','.jpeg','.png','.webp','.avif','.gif'].includes(ext))throw new Error('Formato de imagen no admitido');
   const filename=randomUUID()+ext;
   const input=productSchema.parse({...entry,imagen:'/uploads/'+filename});
   prepared.push({index,source,destination:path.resolve('public/uploads',filename),input});
  }catch(error){errors.push(`Fila ${index+1}: ${error instanceof Error?error.message:String(error)}`);}
 }
 if(process.argv.includes('--reset') && errors.length){for(const error of errors)console.error(error);throw new Error('--reset cancelado: corregir el catálogo antes de vaciar products');}
 migrate();await mkdir('public/uploads',{recursive:true});
 if(process.argv.includes('--reset'))clearProducts();
 let imported=0;
 for(const item of prepared){
  try{await copyFile(item.source,item.destination);try{createProduct(item.input);}catch(error){await unlink(item.destination);throw error;}imported++;}
  catch(error){errors.push(`Fila ${item.index+1}: ${error instanceof Error?error.message:String(error)}`);}
 }
 console.log(`Importados: ${imported}. Fallidos: ${errors.length}.`);
 for(const error of errors)console.error(error);
 if(errors.length)process.exitCode=1;
}
main().catch(error=>{console.error(error instanceof Error?error.message:error);process.exitCode=1;});

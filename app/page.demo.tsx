import PublicMenu from '@/components/menu/PublicMenu';
import snapshot from '@/lib/demo/menu.json';
import type {Background} from '@/lib/data/settings';
export const metadata={icons:{icon:'/placeholder.svg'}};
export default function DemoPage(){const groups=snapshot.groups.map(group=>({...group,productos:group.productos.map(product=>({...product,updated_at:new Date(product.updated_at)}))}));return <PublicMenu groups={groups} theme={snapshot.theme} background={snapshot.background as Background} display={snapshot.display}/>;}

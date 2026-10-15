import PublicMenu from '@/components/menu/PublicMenu';
import {listByCategory} from '@/lib/data/products';
import {getTheme,getBackground} from '@/lib/data/settings';
import {getMenuDisplay} from '@/lib/data/menu-display';
export const dynamic='force-dynamic';
export const metadata={icons:{icon:'/placeholder.svg'}};
export default function MenuPage(){return <PublicMenu groups={listByCategory()} theme={getTheme()} background={getBackground()} display={getMenuDisplay()}/>;}

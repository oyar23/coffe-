import AdminShell from '@/components/admin/AdminShell';
import ProductList from '@/components/admin/ProductList';
import { listProducts } from '@/lib/data/products';
import { getMenuDisplay } from '@/lib/data/menu-display';
export const metadata = { title: 'Productos | coffe-a', icons: { icon: '/placeholder.svg' } };
export default function AdminPage() {
  return <AdminShell><ProductList initialProducts={listProducts()} showProductImages={getMenuDisplay().showProductImages} /></AdminShell>;
}

import AdminShell from '@/components/admin/AdminShell';
import ProductForm from '@/components/admin/ProductForm';
import { listCategories } from '@/lib/data/products';
import { getMenuDisplay } from '@/lib/data/menu-display';
export const metadata = { title: 'Nuevo producto | coffe-a', icons: { icon: '/placeholder.svg' } };
export default function NewProductPage() {
  return <AdminShell><ProductForm categories={listCategories()} showImages={getMenuDisplay().showProductImages} /></AdminShell>;
}

import { notFound } from 'next/navigation';
import AdminShell from '@/components/admin/AdminShell';
import ProductForm from '@/components/admin/ProductForm';
import { getProduct, listCategories } from '@/lib/data/products';
import { getMenuDisplay } from '@/lib/data/menu-display';
export const metadata = { title: 'Editar producto | coffe-a', icons: { icon: '/placeholder.svg' } };
export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = getProduct(id);
  if (!product) notFound();
  return <AdminShell><ProductForm initial={product} categories={listCategories()} showImages={getMenuDisplay().showProductImages} /></AdminShell>;
}

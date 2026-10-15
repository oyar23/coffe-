import Image from 'next/image';
import { getMenuDisplay } from '@/lib/data/menu-display';
import { listByCategory } from '@/lib/data/products';
import { getBackground, getTheme } from '@/lib/data/settings';
import Background from '@/components/background/Background';
import CategoryTabs from '@/components/menu/CategoryTabs';
import ProductCard from '@/components/menu/ProductCard';
import Reveal from '@/components/menu/Reveal';
import CoffeeMark from '@/components/menu/CoffeeMark';
import styles from '@/components/menu/menu.module.css';

export const dynamic = 'force-dynamic';
export const metadata = { icons: { icon: '/placeholder.svg' } };

export default function MenuPage() {
  const categoryOrder = ['Cafés calientes', 'Cafés fríos', 'Bebidas sin café', 'Desayunos y meriendas', 'Pastelería', 'Salados'];
  const rank = (name: string) => { const index = categoryOrder.indexOf(name); return index < 0 ? categoryOrder.length : index; };
  const categories = listByCategory().filter(group => group.productos.length > 0).sort((a, b) => rank(a.categoria) - rank(b.categoria));
  const theme = getTheme();
  const display = getMenuDisplay();
  const sections = categories.map((group, index) => ({ ...group, id: `categoria-${index + 1}` }));

  return (
    <div className={styles.menu}>
      <Background background={getBackground()} />
      <div className={styles.backdropVeil} aria-hidden="true" />
      <a className={styles.skipLink} href="#carta">Ir a la carta</a>
      <header className={styles.header}>
        <a href="/" className={styles.brand}>
          {theme.logo ? <Image src={theme.logo.startsWith('/') ? theme.logo : `/${theme.logo}`} alt="" width={48} height={48} className={styles.logo} unoptimized /> : <CoffeeMark />}
          <span className={styles.wordmark}>coffe-a</span>
        </a>
      </header>

      <p className={styles.welcome}>
        <span>Bienvenido</span>
        <span className={styles.welcomePromo}>2×1 de 15 a 22 hs</span>
      </p>

      {sections.length > 0 && <CategoryTabs categories={sections.map(({ id, categoria }) => ({ id, nombre: categoria }))} />}

      <main id="carta" className={styles.content}>
        <h1 className={styles.srOnly}>Carta de coffe-a</h1>
        {sections.length === 0 ? (
          <div className={styles.empty}><h2>La carta está vacía.</h2></div>
        ) : sections.map(({ categoria, productos, id }) => (
          <section key={categoria} id={id} aria-labelledby={`${id}-titulo`} className={styles.section}>
            <div className={styles.sectionHeader}><h2 id={`${id}-titulo`}>{categoria}</h2></div>
            <div className={styles.grid}>{productos.map(product => <Reveal key={product.id}><ProductCard product={product} showImage={display.showProductImages} /></Reveal>)}</div>
          </section>
        ))}
      </main>
      <footer className={styles.footer}><span className={styles.footerNote}>Precios en pesos argentinos.</span></footer>
    </div>
  );
}

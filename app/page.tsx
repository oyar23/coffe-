import Image from 'next/image';
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
  const categories = listByCategory().filter(group => group.productos.length > 0);
  const theme = getTheme();
  const sections = categories.map((group, index) => ({ ...group, id: `categoria-${index + 1}` }));

  return (
    <div className={styles.menu}>
      <Background background={getBackground()} />
      <div className={styles.backdropVeil} aria-hidden="true" />
      <a className={styles.skipLink} href="#carta">Ir a la carta</a>
      <header className={styles.header}>
        <a href="/" className={styles.brand}>
          {theme.logo ? <Image src={theme.logo.startsWith('/') ? theme.logo : `/${theme.logo}`} alt="" width={48} height={48} className={styles.logo} unoptimized /> : <CoffeeMark />}
          <span className={styles.wordmark}>coffe-a<span className={styles.brandCaption}>CAFÉ & BUENOS MOMENTOS</span></span>
        </a>
        <span className={styles.headerNote}><span className={styles.dot} /> Nuestra carta digital</span>
      </header>

      <div className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>HECHO PARA DISFRUTAR, SIN PRISA</p>
          <h1>Tu pausa.<br /><span>Un buen café.</span></h1>
          <p className={styles.intro}>Algo rico, tu café favorito y un momento para vos.</p>
        </div>
        <div className={styles.heroStamp} aria-hidden="true"><CoffeeMark /><span>UN POCO DE CAFÉ<br />UN MUCHO DE DISFRUTAR</span></div>
      </div>

      {sections.length > 0 && <CategoryTabs categories={sections.map(({ id, categoria }) => ({ id, nombre: categoria }))} />}

      <main id="carta" className={styles.content}>
        {sections.length === 0 ? (
          <div className={styles.empty}><CoffeeMark /><h2>Estamos preparando algo rico.</h2><p>Pronto vas a encontrar nuestra carta acá. Gracias por esperar.</p></div>
        ) : sections.map(({ categoria, productos, id }, index) => (
          <section key={categoria} id={id} aria-labelledby={`${id}-titulo`} className={styles.section}>
            <div className={styles.sectionHeader}><div className={styles.sectionTitle}><span className={styles.sectionNumber}>{String(index + 1).padStart(2, '0')}</span><h2 id={`${id}-titulo`}>{categoria}</h2></div><span className={styles.sectionCount}>{productos.length} opciones</span></div>
            <div className={styles.grid}>{productos.map(product => <Reveal key={product.id}><ProductCard product={product} /></Reveal>)}</div>
          </section>
        ))}
      </main>
      <footer className={styles.footer}><span className={styles.footerBrand}>coffe-a</span><p>Tu próximo buen momento empieza acá.</p><span className={styles.footerNote}>Precios en pesos argentinos.</span></footer>
    </div>
  );
}

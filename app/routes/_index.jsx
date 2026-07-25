import {Await, Link, useLoaderData} from 'react-router';
import {Suspense} from 'react';
import {Image} from '@shopify/hydrogen';
import {ProductCard} from '~/components/ProductCard';
import {NewsletterForm} from '~/components/NewsletterForm';
import {Icon} from '~/components/Icon';
import {MockShopNotice} from '~/components/MockShopNotice';

export const meta = () => [
  {title: 'SOCKPOP — Color for every step'},
  {name: 'description', content: 'Premium socks made for brighter days. Shop colorful crew, ankle, patterned socks and gift sets.'},
];

export async function loader({context}) {
  const {storefront} = context;
  const featured = await storefront.query(HOME_HERO_QUERY, {
    cache: storefront.CacheShort(),
  });
  const products = storefront.query(HOME_PRODUCTS_QUERY, {
    cache: storefront.CacheShort(),
  }).catch(() => null);

  return {
    isShopLinked: Boolean(context.env.PUBLIC_STORE_DOMAIN),
    collection: featured.collections.nodes[0],
    products,
  };
}

export default function Homepage() {
  const {collection, products, isShopLinked} = useLoaderData();
  const heroImage = collection?.image;

  return (
    <div className="home">
      {!isShopLinked && <MockShopNotice />}
      <section className="hero">
        <div className="hero__copy reveal">
          <p className="eyebrow">PUT SOME JOY ON</p>
          <h1>Happy feet.<br/><em>Better days.</em></h1>
          <p className="hero__lede">
            Seriously soft socks for people who refuse to dress boring.
            Made responsibly, designed to be noticed.
          </p>
          <div className="button-row">
            <Link className="button button--dark" to={collection ? `/collections/${collection.handle}` : '/collections/all'}>
              Shop the drop <Icon name="arrow" />
            </Link>
            <Link className="text-link" to="/collections">Explore all socks</Link>
          </div>
          <div className="hero__proof">
            <span>★★★★★</span> <strong>4.9</strong> from 2,000+ happy feet
          </div>
        </div>
        <Link className="hero__visual" to={collection ? `/collections/${collection.handle}` : '/collections/all'}>
          {heroImage ? (
            <Image alt={heroImage.altText || collection.title} data={heroImage} loading="eager" sizes="(min-width: 60em) 52vw, 100vw" />
          ) : (
            <div className="hero-art" aria-label="Colorful sock collection">
              <span className="hero-art__sun">NEW<br/>DROP!</span>
              <span className="sock sock--one">● ● ●</span>
              <span className="sock sock--two">〰 〰 〰</span>
              <span className="sock sock--three">★ ★ ★</span>
            </div>
          )}
          <span className="hero__sticker">COMFY<br/>BY NATURE</span>
        </Link>
      </section>

      <div className="marquee" aria-label="Product benefits">
        <div>SUPER SOFT <span>✦</span> DESIGNED TO LAST <span>✦</span> EXPRESS YOURSELF <span>✦</span> FREE SHIPPING OVER $50 <span>✦</span></div>
      </div>

      <section className="section">
        <div className="section-heading">
          <div><p className="eyebrow">FAN FAVORITES</p><h2>Socks people <em>love</em></h2></div>
          <Link className="text-link" to="/collections/all">Shop all <Icon name="arrow" /></Link>
        </div>
        <Suspense fallback={<ProductSkeletons />}>
          <Await resolve={products}>
            {(result) => (
              <div className="product-carousel">
                {result?.products.nodes.map((product, index) => (
                  <ProductCard key={product.id} product={product} priority={index < 2} />
                ))}
              </div>
            )}
          </Await>
        </Suspense>
      </section>

      <section className="section category-section">
        <div className="section-heading section-heading--center">
          <div><p className="eyebrow">FIND YOUR PAIR</p><h2>A sock for every <em>mood</em></h2></div>
        </div>
        <div className="category-grid">
          {CATEGORIES.map((category, index) => (
            <Link className={`category-card category-card--${index + 1}`} key={category.title} to={category.to}>
              <span className="category-card__art" aria-hidden="true">{category.art}</span>
              <span><strong>{category.title}</strong><small>{category.subtitle}</small></span>
              <Icon name="chevron" />
            </Link>
          ))}
        </div>
      </section>

      <section className="story-band">
        <div className="story-band__art"><span>GOOD<br/>MOOD<br/>GUARANTEED</span></div>
        <div className="story-band__copy">
          <p className="eyebrow">WHY SOCKPOP?</p>
          <h2>Comfort that doesn’t <em>blend in.</em></h2>
          <p>We obsess over the little things: cloud-soft combed cotton, seamless toes, and stay-put cuffs. The result? Socks you’ll plan outfits around.</p>
          <ul className="benefit-list">
            <li><span>01</span><div><strong>Thoughtfully made</strong><small>Better materials, kinder processes.</small></div></li>
            <li><span>02</span><div><strong>All-day comfort</strong><small>Cushioned where it counts.</small></div></li>
            <li><span>03</span><div><strong>Big personality</strong><small>Original art, zero boring basics.</small></div></li>
          </ul>
        </div>
      </section>

      <section className="ugc section">
        <div className="section-heading">
          <div><p className="eyebrow">@SOCKPOP</p><h2>Spotted in the <em>wild</em></h2></div>
          <a className="text-link" href="https://instagram.com" rel="noreferrer" target="_blank"><Icon name="instagram" /> Follow along</a>
        </div>
        <div className="ugc-grid">
          {['STEP', 'BRIGHT', 'PLAY', 'COZY', 'REPEAT'].map((word, index) => (
            <div className={`ugc-card ugc-card--${index + 1}`} key={word}><span>{word}</span><Icon name="instagram" /></div>
          ))}
        </div>
      </section>

      <section className="newsletter">
        <span className="newsletter__doodle" aria-hidden="true">✿</span>
        <div><p className="eyebrow">JOIN THE SOCK CLUB</p><h2>Good news for your <em>inbox.</em></h2><p>Be first to know about new drops, special collabs, and members-only treats.</p></div>
        <NewsletterForm />
      </section>
    </div>
  );
}

function ProductSkeletons() {
  return <div className="product-carousel">{[1, 2, 3, 4].map((item) => <div className="product-skeleton" key={item} />)}</div>;
}

const CATEGORIES = [
  {title: 'Crew Socks', subtitle: 'The everyday icons', to: '/collections/crew-socks', art: '〰'},
  {title: 'Ankle Socks', subtitle: 'Low profile, high impact', to: '/collections/ankle-socks', art: '●'},
  {title: 'Patterned', subtitle: 'Wear your personality', to: '/collections/patterned', art: '✦'},
  {title: 'Gift Sets', subtitle: 'Instant good gifting', to: '/collections/gift-sets', art: '❋'},
];

const CARD_FRAGMENT = `#graphql
  fragment HomeProductCard on Product {
    id handle title availableForSale
    featuredImage {id url altText width height}
    priceRange {minVariantPrice {amount currencyCode}}
    compareAtPriceRange {minVariantPrice {amount currencyCode}}
    options {name optionValues {name swatch {color}}}
  }
`;

const HOME_HERO_QUERY = `#graphql
  query HomeHero($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    collections(first: 1, sortKey: UPDATED_AT, reverse: true) {
      nodes {id title handle image {id url altText width height}}
    }
  }
`;

const HOME_PRODUCTS_QUERY = `#graphql
  ${CARD_FRAGMENT}
  query HomeProducts($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    products(first: 8, sortKey: BEST_SELLING) {nodes {...HomeProductCard}}
  }
`;

/** @typedef {import('./+types/_index').Route} Route */

import {Await, useLoaderData} from 'react-router';
import {Suspense} from 'react';
import {
  Analytics, getAdjacentAndFirstAvailableVariants, getProductOptions,
  getSelectedProductOptions, useOptimisticVariant, useSelectedOptionInUrlParam,
} from '@shopify/hydrogen';
import {ProductPrice} from '~/components/ProductPrice';
import {ProductGallery} from '~/components/ProductGallery';
import {ProductForm} from '~/components/ProductForm';
import {ProductCard} from '~/components/ProductCard';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';

export const meta = ({data}) => [
  {title: `${data?.product.seo?.title || data?.product.title || 'Socks'} — SOCKPOP`},
  {name: 'description', content: data?.product.seo?.description || data?.product.description},
  {rel: 'canonical', href: `/products/${data?.product.handle}`},
];

export async function loader({context, params, request}) {
  const {handle} = params;
  if (!handle) throw new Error('Expected product handle');

  const {product} = await context.storefront.query(PRODUCT_QUERY, {
    cache: context.storefront.CacheShort(),
    variables: {handle, selectedOptions: getSelectedProductOptions(request)},
  });
  if (!product?.id) throw new Response(null, {status: 404});
  redirectIfHandleIsLocalized(request, {handle, data: product});

  const related = context.storefront.query(RELATED_QUERY, {
    cache: context.storefront.CacheShort(),
    variables: {productId: product.id},
  }).catch(() => null);
  return {product, related, storeDomain: context.env.PUBLIC_STORE_DOMAIN};
}

export default function Product() {
  const {product, related, storeDomain} = useLoaderData();
  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );
  useSelectedOptionInUrlParam(selectedVariant.selectedOptions);
  const productOptions = getProductOptions({...product, selectedOrFirstAvailableVariant: selectedVariant});
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description,
    image: product.images.nodes.map((image) => image.url),
    sku: selectedVariant?.sku,
    brand: {'@type': 'Brand', name: product.vendor || 'SOCKPOP'},
    offers: {
      '@type': 'Offer',
      url: `https://${storeDomain}/products/${product.handle}`,
      priceCurrency: selectedVariant?.price.currencyCode,
      price: selectedVariant?.price.amount,
      availability: selectedVariant?.availableForSale ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
  };

  return (
    <div className="product-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(jsonLd)}} />
      <div className="product-layout section">
        <ProductGallery images={product.images} selectedImage={selectedVariant?.image} />
        <div className="product-details">
          <p className="eyebrow">{product.vendor || 'SOCKPOP ORIGINAL'}</p>
          <h1>{product.title}</h1>
          <div className="product-details__rating"><span>★★★★★</span> <a href="#details">4.9 · 127 reviews</a></div>
          <ProductPrice price={selectedVariant?.price} compareAtPrice={selectedVariant?.compareAtPrice} />
          <p className="product-details__intro">{product.description}</p>
          <ProductForm productOptions={productOptions} selectedVariant={selectedVariant} />
          <div className="product-accordions" id="details">
            <details open><summary>Details & care</summary><div dangerouslySetInnerHTML={{__html: product.descriptionHtml}} /></details>
            <details><summary>Size guide</summary><p>S/M: US 4–8 · L/XL: US 9–13. Our flexible knit is designed to fit comfortably without slipping.</p></details>
            <details><summary>Shipping & returns</summary><p>Free shipping over $50. Easy returns on unworn pairs within 30 days.</p></details>
          </div>
          <div className="product-perks"><span>☁ Soft combed cotton</span><span>↻ 30-day returns</span><span>✦ Made to last</span></div>
        </div>
      </div>

      <section className="section related">
        <div className="section-heading"><div><p className="eyebrow">KEEP THE GOOD TIMES GOING</p><h2>You may also <em>like</em></h2></div></div>
        <Suspense fallback={null}>
          <Await resolve={related}>
            {(result) => <div className="product-carousel">{result?.productRecommendations.slice(0, 4).map((item) => <ProductCard key={item.id} product={item} />)}</div>}
          </Await>
        </Suspense>
      </section>

      <Analytics.ProductView data={{products: [{
        id: product.id, title: product.title, price: selectedVariant?.price.amount || '0',
        vendor: product.vendor, variantId: selectedVariant?.id || '',
        variantTitle: selectedVariant?.title || '', quantity: 1,
      }]}} />
    </div>
  );
}

const VARIANT_FRAGMENT = `#graphql
  fragment ProductVariant on ProductVariant {
    availableForSale id sku title
    compareAtPrice {amount currencyCode}
    price {amount currencyCode}
    image {id url altText width height}
    product {title handle}
    selectedOptions {name value}
  }
`;
const PRODUCT_FRAGMENT = `#graphql
  fragment Product on Product {
    id title vendor handle description descriptionHtml encodedVariantExistence encodedVariantAvailability
    seo {description title}
    images(first: 8) {nodes {id url altText width height}}
    options {name optionValues {name firstSelectableVariant {...ProductVariant} swatch {color image {previewImage {url}}}}}
    selectedOrFirstAvailableVariant(selectedOptions: $selectedOptions, ignoreUnknownOptions: true, caseInsensitiveMatch: true) {...ProductVariant}
    adjacentVariants(selectedOptions: $selectedOptions) {...ProductVariant}
  }
  ${VARIANT_FRAGMENT}
`;
const PRODUCT_QUERY = `#graphql
  query Product($country: CountryCode, $handle: String!, $language: LanguageCode, $selectedOptions: [SelectedOptionInput!]!)
  @inContext(country: $country, language: $language) {product(handle: $handle) {...Product}}
  ${PRODUCT_FRAGMENT}
`;
const RELATED_QUERY = `#graphql
  fragment RelatedProduct on Product {
    id handle title availableForSale
    featuredImage {id url altText width height}
    priceRange {minVariantPrice {amount currencyCode}}
    compareAtPriceRange {minVariantPrice {amount currencyCode}}
    options {name optionValues {name swatch {color}}}
  }
  query Related($productId: ID!, $country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    productRecommendations(productId: $productId) {...RelatedProduct}
  }
`;

/** @typedef {import('./+types/products.$handle').Route} Route */

import {redirect, useLoaderData} from 'react-router';
import {Analytics, getPaginationVariables} from '@shopify/hydrogen';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {CollectionFilters} from '~/components/CollectionFilters';
import {ProductCard} from '~/components/ProductCard';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';

export const meta = ({data}) => [
  {title: `${data?.collection.title ?? 'Shop'} — SOCKPOP`},
  {name: 'description', content: data?.collection.description || 'Find your new favorite pair of premium socks.'},
];

export async function loader({context, params, request}) {
  const {handle} = params;
  if (!handle) throw redirect('/collections');

  const url = new URL(request.url);
  const {sortKey, reverse} = getSort(url.searchParams.get('sort'));
  const filters = getFilters(url.searchParams);
  const pagination = getPaginationVariables(request, {pageBy: 12});
  const {collection} = await context.storefront.query(COLLECTION_QUERY, {
    cache: context.storefront.CacheShort(),
    variables: {handle, ...pagination, filters, sortKey, reverse},
  });

  if (!collection) throw new Response(`Collection ${handle} not found`, {status: 404});
  redirectIfHandleIsLocalized(request, {handle, data: collection});
  return {collection};
}

export default function Collection() {
  const {collection} = useLoaderData();
  return (
    <div className="collection-page">
      <header className="collection-hero">
        <p className="eyebrow">SHOP THE COLLECTION</p>
        <h1>{collection.title}</h1>
        {collection.description && <p>{collection.description}</p>}
        <span>{collection.products.nodes.length}+ colorful reasons to get dressed</span>
      </header>
      <div className="section collection-content">
        <CollectionFilters />
        <PaginatedResourceSection
          ariaLabel={`${collection.title} products`}
          connection={collection.products}
          resourcesClassName="products-grid"
        >
          {({node: product, index}) => (
            <ProductCard key={product.id} product={product} priority={index < 4} />
          )}
        </PaginatedResourceSection>
      </div>
      <Analytics.CollectionView data={{collection: {id: collection.id, handle: collection.handle}}} />
    </div>
  );
}

function getSort(value) {
  const values = {
    bestselling: {sortKey: 'BEST_SELLING', reverse: false},
    newest: {sortKey: 'CREATED', reverse: true},
    'price-low': {sortKey: 'PRICE', reverse: false},
    'price-high': {sortKey: 'PRICE', reverse: true},
    featured: {sortKey: 'COLLECTION_DEFAULT', reverse: false},
  };
  return values[value] || values.featured;
}

function getFilters(params) {
  const filters = [];
  ['size', 'color', 'pattern'].forEach((name) => {
    params.getAll(name).forEach((value) => filters.push({variantOption: {name, value}}));
  });
  const min = Number(params.get('min'));
  const max = Number(params.get('max'));
  if (min > 0 || max > 0) filters.push({price: {min: min || 0, ...(max > 0 ? {max} : {})}});
  return filters;
}

const PRODUCT_CARD_FRAGMENT = `#graphql
  fragment CollectionProductCard on Product {
    id handle title availableForSale
    featuredImage {id url altText width height}
    priceRange {minVariantPrice {amount currencyCode}}
    compareAtPriceRange {minVariantPrice {amount currencyCode}}
    options {name optionValues {name swatch {color}}}
  }
`;

const COLLECTION_QUERY = `#graphql
  ${PRODUCT_CARD_FRAGMENT}
  query Collection(
    $handle: String!, $country: CountryCode, $language: LanguageCode,
    $first: Int, $last: Int, $startCursor: String, $endCursor: String,
    $filters: [ProductFilter!], $sortKey: ProductCollectionSortKeys, $reverse: Boolean
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id handle title description
      products(
        first: $first, last: $last, before: $startCursor, after: $endCursor,
        filters: $filters, sortKey: $sortKey, reverse: $reverse
      ) {
        nodes {...CollectionProductCard}
        pageInfo {hasPreviousPage hasNextPage endCursor startCursor}
      }
    }
  }
`;

/** @typedef {import('./+types/collections.$handle').Route} Route */

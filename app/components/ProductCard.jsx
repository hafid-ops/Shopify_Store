import {Image, Money} from '@shopify/hydrogen';
import {Link} from 'react-router';

export function ProductCard({product, loading = 'lazy', priority = false}) {
  const image = product.featuredImage;
  const compareAt = product.compareAtPriceRange?.minVariantPrice;
  const price = product.priceRange.minVariantPrice;
  const colorOption = product.options?.find((option) =>
    /colou?r/i.test(option.name),
  );

  return (
    <article className="product-card">
      <Link prefetch="intent" to={`/products/${product.handle}`}>
        <div className="product-card__media">
          {image ? (
            <Image
              alt={image.altText || product.title}
              aspectRatio="4/5"
              data={image}
              loading={priority ? 'eager' : loading}
              sizes="(min-width: 70em) 24vw, (min-width: 45em) 33vw, 50vw"
            />
          ) : (
            <div className="product-card__placeholder" aria-hidden="true">SOCKS</div>
          )}
          {!product.availableForSale && <span className="badge">Sold out</span>}
          {compareAt && Number(compareAt.amount) > Number(price.amount) && (
            <span className="badge badge--sale">Sale</span>
          )}
          <span className="product-card__quick">View pair</span>
        </div>
        <div className="product-card__info">
          <div>
            <h3>{product.title}</h3>
            {colorOption?.optionValues?.length > 0 && (
              <div className="swatches" aria-label="Available colors">
                {colorOption.optionValues.slice(0, 5).map((value) => (
                  <span
                    className="swatch"
                    key={value.name}
                    title={value.name}
                    style={{
                      background: value.swatch?.color || colorFallback(value.name),
                    }}
                  />
                ))}
                {colorOption.optionValues.length > 5 && (
                  <small>+{colorOption.optionValues.length - 5}</small>
                )}
              </div>
            )}
          </div>
          <div className="price">
            <Money data={price} />
            {compareAt && Number(compareAt.amount) > Number(price.amount) && (
              <s><Money data={compareAt} /></s>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
}

function colorFallback(name) {
  const colors = {
    black: '#17233b', white: '#f7f2e8', cream: '#eadfca', red: '#f04d4d',
    blue: '#4c76e8', green: '#5d9d72', yellow: '#f4c84a', pink: '#ef8da8',
    purple: '#8d68c4', orange: '#ed7b47', navy: '#17233b', grey: '#aaa',
    gray: '#aaa', brown: '#8a6045',
  };
  return colors[name.toLowerCase()] || '#d9d3c7';
}

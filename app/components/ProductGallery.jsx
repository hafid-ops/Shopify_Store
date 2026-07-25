import {Image} from '@shopify/hydrogen';
import {useState} from 'react';

export function ProductGallery({images, selectedImage}) {
  const initial = selectedImage || images?.nodes?.[0];
  const [active, setActive] = useState(initial);
  const gallery = images?.nodes || [];

  return (
    <div className="product-gallery">
      <div className="product-gallery__main">
        {active ? (
          <Image
            alt={active.altText || 'Product view'}
            aspectRatio="1/1"
            data={active}
            key={active.id}
            loading="eager"
            sizes="(min-width: 60em) 58vw, 100vw"
          />
        ) : <div className="product-card__placeholder">SOCKPOP</div>}
        <span className="zoom-hint">Hover to zoom</span>
      </div>
      {gallery.length > 1 && (
        <div className="product-gallery__thumbs" role="list" aria-label="Product images">
          {gallery.map((image) => (
            <button
              aria-label={`View ${image.altText || 'product image'}`}
              aria-pressed={active?.id === image.id}
              key={image.id}
              onClick={() => setActive(image)}
              type="button"
            >
              <Image alt="" aspectRatio="1/1" data={image} loading="lazy" sizes="90px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

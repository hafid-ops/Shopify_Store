import {useState} from 'react';
import {Form, useSearchParams} from 'react-router';

const FILTERS = [
  {name: 'Size', key: 'size', values: ['S', 'M', 'L', 'One Size']},
  {name: 'Color', key: 'color', values: ['Black', 'Blue', 'Cream', 'Green', 'Pink', 'Red']},
  {name: 'Pattern', key: 'pattern', values: ['Solid', 'Striped', 'Graphic', 'Dots']},
];

export function CollectionFilters() {
  const [open, setOpen] = useState(false);
  const [params] = useSearchParams();

  return (
    <div className="collection-tools">
      <button
        aria-expanded={open}
        className="filter-toggle button button--outline"
        onClick={() => setOpen(!open)}
        type="button"
      >
        Filter products <span aria-hidden="true">+</span>
      </button>
      <Form className={`filters ${open ? 'filters--open' : ''}`} method="get">
        {FILTERS.map((filter) => (
          <fieldset key={filter.key}>
            <legend>{filter.name}</legend>
            {filter.values.map((value) => (
              <label key={value}>
                <input
                  defaultChecked={params.getAll(filter.key).includes(value)}
                  name={filter.key}
                  type="checkbox"
                  value={value}
                />
                <span>{value}</span>
              </label>
            ))}
          </fieldset>
        ))}
        <fieldset>
          <legend>Price</legend>
          <label>Min <input defaultValue={params.get('min') || ''} min="0" name="min" placeholder="$0" type="number" /></label>
          <label>Max <input defaultValue={params.get('max') || ''} min="0" name="max" placeholder="$100" type="number" /></label>
        </fieldset>
        <input name="sort" type="hidden" value={params.get('sort') || 'featured'} />
        <button className="button button--dark" type="submit">Apply filters</button>
        <a className="text-link" href="?">Clear all</a>
      </Form>
      <Form className="sort-form" method="get">
        {[...params.entries()].filter(([key]) => key !== 'sort').map(([key, value]) => (
          <input key={`${key}-${value}`} name={key} type="hidden" value={value} />
        ))}
        <label htmlFor="sort">Sort by</label>
        <select
          defaultValue={params.get('sort') || 'featured'}
          id="sort"
          name="sort"
          onChange={(event) => event.currentTarget.form?.requestSubmit()}
        >
          <option value="featured">Featured</option>
          <option value="bestselling">Best selling</option>
          <option value="newest">Newest</option>
          <option value="price-low">Price: low to high</option>
          <option value="price-high">Price: high to low</option>
        </select>
      </Form>
    </div>
  );
}

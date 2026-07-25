import {Suspense} from 'react';
import {Await, NavLink, useAsyncValue} from 'react-router';
import {useAnalytics, useOptimisticCart} from '@shopify/hydrogen';
import {useAside} from './Aside';
import {Icon} from './Icon';

export function Header({header, isLoggedIn, cart, publicStoreDomain}) {
  const {open} = useAside();
  return (
    <>
      <div className="announcement">Free shipping on orders $50+ <span>✦</span> Happiness guaranteed</div>
      <header className="header">
        <button className="icon-button header-menu-mobile-toggle" onClick={() => open('mobile')} aria-label="Open menu"><Icon name="menu" /></button>
        <NavLink className="wordmark" end to="/" aria-label="SOCKPOP home">SOCK<span>POP</span></NavLink>
        <HeaderMenu menu={header.menu} viewport="desktop" primaryDomainUrl={header.shop.primaryDomain.url} publicStoreDomain={publicStoreDomain} />
        <HeaderCtas isLoggedIn={isLoggedIn} cart={cart} />
      </header>
    </>
  );
}

export function HeaderMenu({menu, primaryDomainUrl, viewport, publicStoreDomain}) {
  const {close} = useAside();
  const items = (menu || FALLBACK_HEADER_MENU).items;
  return (
    <nav className={`header-menu-${viewport}`} aria-label={`${viewport} navigation`}>
      {viewport === 'mobile' && <NavLink end onClick={close} to="/">Home</NavLink>}
      {items.map((item) => {
        if (!item.url) return null;
        const internal = item.url.includes('myshopify.com') || item.url.includes(publicStoreDomain) || item.url.includes(primaryDomainUrl);
        const url = internal ? new URL(item.url).pathname : item.url;
        return <NavLink className="header-menu-item" key={item.id} onClick={close} prefetch="intent" to={url}>{item.title}</NavLink>;
      })}
    </nav>
  );
}

function HeaderCtas({isLoggedIn, cart}) {
  const {open} = useAside();
  return (
    <nav className="header-ctas" aria-label="Utilities">
      <button className="icon-button" onClick={() => open('search')} aria-label="Search"><Icon name="search" /></button>
      <NavLink className="icon-button account-link" to="/account" aria-label="Account">
        <Icon name="user" /><span><Suspense fallback="Sign in"><Await resolve={isLoggedIn}>{(logged) => logged ? 'Account' : 'Sign in'}</Await></Suspense></span>
      </NavLink>
      <CartToggle cart={cart} />
    </nav>
  );
}

function CartToggle({cart}) {
  return <Suspense fallback={<CartBadge count={0} />}><Await resolve={cart}><CartBanner /></Await></Suspense>;
}
function CartBanner() {
  return <CartBadge count={useOptimisticCart(useAsyncValue())?.totalQuantity ?? 0} />;
}
function CartBadge({count}) {
  const {open} = useAside();
  const {publish, shop, cart, prevCart} = useAnalytics();
  return (
    <a className="icon-button cart-button" href="/cart" aria-label={`Cart with ${count} items`} onClick={(event) => {
      event.preventDefault(); open('cart');
      publish('cart_viewed', {cart, prevCart, shop, url: window.location.href || ''});
    }}>
      <Icon name="bag" /><span className="cart-count">{count}</span>
    </a>
  );
}

const FALLBACK_HEADER_MENU = {items: [
  {id: 'shop', title: 'Shop', url: '/collections/all'},
  {id: 'new', title: 'New drops', url: '/collections/all?sort=newest'},
  {id: 'gifts', title: 'Gift sets', url: '/collections/gift-sets'},
  {id: 'about', title: 'Our story', url: '/pages/about'},
]};

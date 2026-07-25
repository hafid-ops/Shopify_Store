import {Await, Link, NavLink} from 'react-router';
import {Suspense} from 'react';
import {NewsletterForm} from './NewsletterForm';
import {Icon} from './Icon';

export function Footer({footer: footerPromise, header, publicStoreDomain}) {
  return (
    <footer className="footer">
      <div className="footer__top">
        <div className="footer__brand"><Link className="wordmark wordmark--light" to="/">SOCK<span>POP</span></Link><p>Color for every step.<br/>Comfort for every day.</p><div className="socials"><a href="https://instagram.com" aria-label="Instagram"><Icon name="instagram" /></a><a href="https://tiktok.com" aria-label="TikTok">♪</a><a href="https://pinterest.com" aria-label="Pinterest">P</a></div></div>
        <div><h2>Shop</h2><Link to="/collections/all">All socks</Link><Link to="/collections/crew-socks">Crew socks</Link><Link to="/collections/ankle-socks">Ankle socks</Link><Link to="/collections/gift-sets">Gift sets</Link></div>
        <div><h2>Help</h2><Link to="/pages/contact">Contact</Link><Link to="/pages/size-guide">Size guide</Link><Link to="/policies/shipping-policy">Shipping & returns</Link><Link to="/policies/refund-policy">Refunds</Link></div>
        <div className="footer__signup"><h2>Get the good stuff</h2><p>New socks, special drops, no boring emails.</p><NewsletterForm compact /></div>
      </div>
      <Suspense fallback={null}><Await resolve={footerPromise}>{(footer) => footer?.menu && <FooterMenu menu={footer.menu} header={header} publicStoreDomain={publicStoreDomain} />}</Await></Suspense>
      <div className="footer__bottom"><span>© {new Date().getFullYear()} SOCKPOP</span><div className="payments" aria-label="Accepted payments"><span>VISA</span><span>MC</span><span>AMEX</span><span>Pay</span></div><span>Made with happy feet.</span></div>
    </footer>
  );
}

function FooterMenu({menu, header, publicStoreDomain}) {
  return <nav className="footer-menu" aria-label="Legal">{menu.items.slice(0, 4).map((item) => {
    if (!item.url) return null;
    const internal = item.url.includes('myshopify.com') || item.url.includes(publicStoreDomain) || item.url.includes(header.shop.primaryDomain.url);
    const url = internal ? new URL(item.url).pathname : item.url;
    return <NavLink key={item.id} to={url}>{item.title}</NavLink>;
  })}</nav>;
}

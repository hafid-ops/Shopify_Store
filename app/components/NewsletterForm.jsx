import {useState} from 'react';

export function NewsletterForm({compact = false}) {
  const [sent, setSent] = useState(false);
  return (
    <form
      className={`newsletter-form ${compact ? 'newsletter-form--compact' : ''}`}
      onSubmit={(event) => {
        event.preventDefault();
        setSent(true);
      }}
    >
      <label className="sr-only" htmlFor={`email-${compact ? 'footer' : 'home'}`}>
        Email address
      </label>
      <input
        autoComplete="email"
        id={`email-${compact ? 'footer' : 'home'}`}
        name="email"
        placeholder="Your email address"
        required
        type="email"
      />
      <button className="button button--dark" type="submit">
        {sent ? 'You’re in!' : 'Join the club'}
      </button>
      <p className="form-note" aria-live="polite">
        {sent ? 'Thanks! Watch your inbox for colorful things.' : 'No spam. Just fresh drops and 10% off your first order.'}
      </p>
    </form>
  );
}

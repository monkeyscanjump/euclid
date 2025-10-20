import { newSpecPage } from '@stencil/core/testing';
import { EuclidButton } from '../euclid-button';

describe('euclid-button', () => {
  it('renders with default props', async () => {
    const page = await newSpecPage({
      components: [EuclidButton],
      html: `<euclid-button>Click me</euclid-button>`,
    });

    expect(page.root).toBeDefined();
    const button = page.root!.shadowRoot!.querySelector('button');

    expect(button).toBeTruthy();
    expect(button!.type).toBe('button');
    expect(button!.classList.contains('euclid-button')).toBe(true);
    expect(button!.classList.contains('euclid-button--primary')).toBe(true);
    expect(button!.classList.contains('euclid-button--md')).toBe(true);
    expect(button!.hasAttribute('disabled')).toBe(false);
    expect(button!.getAttribute('aria-busy')).toBe('false');

    const contentSpan = button!.querySelector('.euclid-button__content');
    expect(contentSpan).toBeTruthy();
    expect(contentSpan!.classList.contains('euclid-button__content--hidden')).toBe(false);
  });  it('renders with loading state', async () => {
    const page = await newSpecPage({
      components: [EuclidButton],
      html: `<euclid-button loading="true">Loading...</euclid-button>`,
    });

    const button = page.root!.shadowRoot!.querySelector('button');
    expect(button!.getAttribute('aria-busy')).toBe('true');
    expect(button!.classList.contains('euclid-button--loading')).toBe(true);
    expect(button!.hasAttribute('disabled')).toBe(true);

    const spinner = button!.querySelector('.euclid-button__spinner');
    expect(spinner).toBeTruthy();

    const content = button!.querySelector('.euclid-button__content');
    expect(content!.classList.contains('euclid-button__content--hidden')).toBe(true);
  });

  it('renders as link when href is provided', async () => {
    const page = await newSpecPage({
      components: [EuclidButton],
      html: `<euclid-button href="/test">Link button</euclid-button>`,
    });

    const link = page.root!.shadowRoot!.querySelector('a');
    expect(link).toBeTruthy();
    expect(link!.getAttribute('href')).toBe('/test');
    expect(link!.getAttribute('role')).toBe('button');
    expect(link!.classList.contains('euclid-button')).toBe(true);

    // Should not render a button element
    const button = page.root!.shadowRoot!.querySelector('button');
    expect(button).toBeFalsy();
  });

  it('does not render as link when disabled', async () => {
    const page = await newSpecPage({
      components: [EuclidButton],
      html: `<euclid-button href="/test" disabled="true">Disabled Link</euclid-button>`,
    });

    // Should render as button when disabled even with href
    const button = page.root!.shadowRoot!.querySelector('button');
    expect(button).toBeTruthy();
    expect(button!.hasAttribute('disabled')).toBe(true);

    const link = page.root!.shadowRoot!.querySelector('a');
    expect(link).toBeFalsy();
  });

  it('does not render as link when loading', async () => {
    const page = await newSpecPage({
      components: [EuclidButton],
      html: `<euclid-button href="/test" loading="true">Loading Link</euclid-button>`,
    });

    // Should render as button when loading even with href
    const button = page.root!.shadowRoot!.querySelector('button');
    expect(button).toBeTruthy();
    expect(button!.hasAttribute('disabled')).toBe(true);

    const link = page.root!.shadowRoot!.querySelector('a');
    expect(link).toBeFalsy();
  });

  it('applies correct variant classes', async () => {
    const page = await newSpecPage({
      components: [EuclidButton],
      html: `<euclid-button variant="danger">Delete</euclid-button>`,
    });

    const button = page.root!.shadowRoot!.querySelector('button');
    expect(button!.classList.contains('euclid-button--danger')).toBe(true);
    expect(button!.classList.contains('euclid-button--primary')).toBe(false);
  });

  it('applies correct size classes', async () => {
    const page = await newSpecPage({
      components: [EuclidButton],
      html: `<euclid-button size="lg">Large button</euclid-button>`,
    });

    const button = page.root!.shadowRoot!.querySelector('button');
    expect(button!.classList.contains('euclid-button--lg')).toBe(true);
    expect(button!.classList.contains('euclid-button--md')).toBe(false);
  });

  it('applies full width class', async () => {
    const page = await newSpecPage({
      components: [EuclidButton],
      html: `<euclid-button full-width="true">Full Width</euclid-button>`,
    });

    const button = page.root!.shadowRoot!.querySelector('button');
    expect(button!.classList.contains('euclid-button--full-width')).toBe(true);
  });

  it('prevents click when disabled', async () => {
    const page = await newSpecPage({
      components: [EuclidButton],
      html: `<euclid-button disabled="true">Disabled</euclid-button>`,
    });

    const button = page.root!.shadowRoot!.querySelector('button');
    expect(button!.hasAttribute('disabled')).toBe(true);
    expect(button!.classList.contains('euclid-button--disabled')).toBe(true);
  });

  it('prevents click when loading', async () => {
    const page = await newSpecPage({
      components: [EuclidButton],
      html: `<euclid-button loading="true">Loading</euclid-button>`,
    });

    const button = page.root!.shadowRoot!.querySelector('button');
    expect(button!.hasAttribute('disabled')).toBe(true);
    expect(button!.classList.contains('euclid-button--loading')).toBe(true);
  });

  it('supports different button types', async () => {
    const page = await newSpecPage({
      components: [EuclidButton],
      html: `<euclid-button type="submit">Submit</euclid-button>`,
    });

    const button = page.root!.shadowRoot!.querySelector('button');
    expect(button!.type).toBe('submit');
  });

  it('supports all variants', async () => {
    const variants = ['primary', 'secondary', 'danger', 'ghost'];

    for (const variant of variants) {
      const page = await newSpecPage({
        components: [EuclidButton],
        html: `<euclid-button variant="${variant}">Test</euclid-button>`,
      });

      const button = page.root!.shadowRoot!.querySelector('button');
      expect(button!.classList.contains(`euclid-button--${variant}`)).toBe(true);
    }
  });

  it('supports all sizes', async () => {
    const sizes = ['sm', 'md', 'lg'];

    for (const size of sizes) {
      const page = await newSpecPage({
        components: [EuclidButton],
        html: `<euclid-button size="${size}">Test</euclid-button>`,
      });

      const button = page.root!.shadowRoot!.querySelector('button');
      expect(button!.classList.contains(`euclid-button--${size}`)).toBe(true);
    }
  });

  it('handles click events', async () => {
    const page = await newSpecPage({
      components: [EuclidButton],
      html: `<euclid-button>Click me</euclid-button>`,
    });

    let clickPrevented = false;

    const mockEvent = {
      preventDefault: () => { clickPrevented = true; },
      stopPropagation: () => {},
    } as MouseEvent;

    // Simulate the handleClick method being called
    const component = page.rootInstance as EuclidButton;
    (component as unknown as { handleClick: (event: MouseEvent) => void })['handleClick'](mockEvent);

    // Should not prevent click for enabled, non-loading button
    expect(clickPrevented).toBe(false);
  });

  it('prevents click events when disabled', async () => {
    const page = await newSpecPage({
      components: [EuclidButton],
      html: `<euclid-button disabled="true">Disabled</euclid-button>`,
    });

    let clickPrevented = false;
    let propagationStopped = false;

    const mockEvent = {
      preventDefault: () => { clickPrevented = true; },
      stopPropagation: () => { propagationStopped = true; },
    } as MouseEvent;

    // Simulate the handleClick method being called
    const component = page.rootInstance as EuclidButton;
    (component as unknown as { handleClick: (event: MouseEvent) => void })['handleClick'](mockEvent);

    expect(clickPrevented).toBe(true);
    expect(propagationStopped).toBe(true);
  });

  it('prevents click events when loading', async () => {
    const page = await newSpecPage({
      components: [EuclidButton],
      html: `<euclid-button loading="true">Loading</euclid-button>`,
    });

    let clickPrevented = false;
    let propagationStopped = false;

    const mockEvent = {
      preventDefault: () => { clickPrevented = true; },
      stopPropagation: () => { propagationStopped = true; },
    } as MouseEvent;

    // Simulate the handleClick method being called
    const component = page.rootInstance as EuclidButton;
    (component as unknown as { handleClick: (event: MouseEvent) => void })['handleClick'](mockEvent);

    expect(clickPrevented).toBe(true);
    expect(propagationStopped).toBe(true);
  });
});

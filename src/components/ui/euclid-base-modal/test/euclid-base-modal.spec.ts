import { newSpecPage } from '@stencil/core/testing';
import { EuclidBaseModal } from '../euclid-base-modal';

describe('euclid-base-modal', () => {
  it('renders with default props', async () => {
    const page = await newSpecPage({
      components: [EuclidBaseModal],
      html: `<euclid-base-modal open="true" modal-title="Test Modal"></euclid-base-modal>`,
    });
    expect(page.root).toEqualHtml(`
      <euclid-base-modal open="true" modal-title="Test Modal">
        <mock:shadow-root>
          <div class="modal-overlay">
            <div class="modal-content">
              <div class="modal-header">
                <h2 class="modal-title">Test Modal</h2>
                <button class="close-button" aria-label="Close modal">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
              <div class="modal-body">
                <slot></slot>
              </div>
            </div>
          </div>
        </mock:shadow-root>
      </euclid-base-modal>
    `);
  });

  it('does not render when closed', async () => {
    const page = await newSpecPage({
      components: [EuclidBaseModal],
      html: `<euclid-base-modal open="false" modal-title="Test Modal"></euclid-base-modal>`,
    });
    expect(page.root?.shadowRoot?.innerHTML).toBe('');
  });

  it('renders search section when showSearch is true', async () => {
    const page = await newSpecPage({
      components: [EuclidBaseModal],
      html: `<euclid-base-modal open="true" modal-title="Test Modal" show-search="true"></euclid-base-modal>`,
    });

    const searchSection = page.root?.shadowRoot?.querySelector('.search-section');
    expect(searchSection).toBeTruthy();

    const searchInput = page.root?.shadowRoot?.querySelector('.search-input');
    expect(searchInput).toBeTruthy();
  });

  it('renders loading state when loading is true', async () => {
    const page = await newSpecPage({
      components: [EuclidBaseModal],
      html: `<euclid-base-modal open="true" modal-title="Test Modal" loading="true"></euclid-base-modal>`,
    });

    const loadingSection = page.root?.shadowRoot?.querySelector('.loading-section');
    expect(loadingSection).toBeTruthy();

    const spinner = page.root?.shadowRoot?.querySelector('.spinner');
    expect(spinner).toBeTruthy();
  });

  it('renders error state when error is provided', async () => {
    const page = await newSpecPage({
      components: [EuclidBaseModal],
      html: `<euclid-base-modal open="true" modal-title="Test Modal" error="Test error"></euclid-base-modal>`,
    });

    const errorSection = page.root?.shadowRoot?.querySelector('.error-section');
    expect(errorSection).toBeTruthy();

    const errorMessage = page.root?.shadowRoot?.querySelector('.error-message');
    expect(errorMessage?.textContent).toBe('Test error');
  });

  it('renders empty state when empty-message is provided', async () => {
    const page = await newSpecPage({
      components: [EuclidBaseModal],
      html: `<euclid-base-modal open="true" modal-title="Test Modal" empty-message="No items found"></euclid-base-modal>`,
    });

    const emptyState = page.root?.shadowRoot?.querySelector('.empty-state');
    expect(emptyState).toBeTruthy();

    const emptyMessage = page.root?.shadowRoot?.querySelector('.empty-message');
    expect(emptyMessage?.textContent).toBe('No items found');
  });

  it('emits close event when close button is clicked', async () => {
    const page = await newSpecPage({
      components: [EuclidBaseModal],
      html: `<euclid-base-modal open="true" modal-title="Test Modal"></euclid-base-modal>`,
    });

    const closeSpy = jest.fn();
    page.root?.addEventListener('euclidModalClose', closeSpy);

    const closeButton = page.root?.shadowRoot?.querySelector('.close-button') as HTMLElement;
    closeButton?.click();

    expect(closeSpy).toHaveBeenCalled();
  });

  it('emits search event when search input changes', async () => {
    const page = await newSpecPage({
      components: [EuclidBaseModal],
      html: `<euclid-base-modal open="true" modal-title="Test Modal" show-search="true"></euclid-base-modal>`,
    });

    const searchSpy = jest.fn();
    page.root?.addEventListener('euclidModalSearch', searchSpy);

    const searchInput = page.root?.shadowRoot?.querySelector('.search-input') as HTMLInputElement;
    searchInput.value = 'test search';
    searchInput.dispatchEvent(new Event('input'));

    expect(searchSpy).toHaveBeenCalledWith(expect.objectContaining({
      detail: 'test search'
    }));
  });

  it('emits listChange event when list selector changes', async () => {
    const listOptions = JSON.stringify([{value: 'list1', label: 'List 1'}, {value: 'list2', label: 'List 2'}]);
    const page = await newSpecPage({
      components: [EuclidBaseModal],
      html: `<euclid-base-modal open="true" modal-title="Test Modal" show-search="true" list-options='${listOptions}'></euclid-base-modal>`,
    });

    const listSpy = jest.fn();
    page.root?.addEventListener('euclidModalListChange', listSpy);

    const listSelector = page.root?.shadowRoot?.querySelector('.list-selector') as HTMLSelectElement;
    listSelector.value = 'list2';
    listSelector.dispatchEvent(new Event('change'));

    expect(listSpy).toHaveBeenCalledWith(expect.objectContaining({
      detail: 'list2'
    }));
  });

  it('applies blur backdrop when enableBlur is true', async () => {
    const page = await newSpecPage({
      components: [EuclidBaseModal],
      html: `<euclid-base-modal open="true" modal-title="Test Modal" enable-blur="true"></euclid-base-modal>`,
    });

    const overlay = page.root?.shadowRoot?.querySelector('.modal-overlay');
    expect(overlay?.classList.contains('modal-overlay--blur')).toBe(true);
  });

  it('applies loading class to content when loading', async () => {
    const page = await newSpecPage({
      components: [EuclidBaseModal],
      html: `<euclid-base-modal open="true" modal-title="Test Modal" loading="true"></euclid-base-modal>`,
    });

    const content = page.root?.shadowRoot?.querySelector('.modal-content');
    expect(content?.classList.contains('modal-content--loading')).toBe(true);
  });

  it('handles keyboard events for escape key', async () => {
    const page = await newSpecPage({
      components: [EuclidBaseModal],
      html: `<euclid-base-modal open="true" modal-title="Test Modal"></euclid-base-modal>`,
    });

    const closeSpy = jest.fn();
    page.root?.addEventListener('euclidModalClose', closeSpy);

    const component = page.rootInstance as EuclidBaseModal;
    const keyEvent = new KeyboardEvent('keydown', { key: 'Escape' });
    component.handleKeyDown(keyEvent);

    expect(closeSpy).toHaveBeenCalled();
  });

  it('handles overlay click to close', async () => {
    const page = await newSpecPage({
      components: [EuclidBaseModal],
      html: `<euclid-base-modal open="true" modal-title="Test Modal"></euclid-base-modal>`,
    });

    const closeSpy = jest.fn();
    page.root?.addEventListener('euclidModalClose', closeSpy);

    const overlay = page.root?.shadowRoot?.querySelector('.modal-overlay') as HTMLElement;
    overlay?.click();

    expect(closeSpy).toHaveBeenCalled();
  });

  it('does not close on content click', async () => {
    const page = await newSpecPage({
      components: [EuclidBaseModal],
      html: `<euclid-base-modal open="true" modal-title="Test Modal"></euclid-base-modal>`,
    });

    const closeSpy = jest.fn();
    page.root?.addEventListener('euclidModalClose', closeSpy);

    const content = page.root?.shadowRoot?.querySelector('.modal-content') as HTMLElement;
    content?.click();

    expect(closeSpy).not.toHaveBeenCalled();
  });  it('renders loading state when loading is true', async () => {
    const page = await newSpecPage({
      components: [EuclidBaseModal],
      html: `<euclid-base-modal open="true" title="Test Modal" loading="true"></euclid-base-modal>`,
    });

    const loadingSection = page.root?.shadowRoot?.querySelector('.loading-section');
    expect(loadingSection).toBeTruthy();

    const spinner = page.root?.shadowRoot?.querySelector('.spinner');
    expect(spinner).toBeTruthy();
  });

  it('renders error state when error is provided', async () => {
    const page = await newSpecPage({
      components: [EuclidBaseModal],
      html: `<euclid-base-modal open="true" title="Test Modal" error="Test error"></euclid-base-modal>`,
    });

    const errorSection = page.root?.shadowRoot?.querySelector('.error-section');
    expect(errorSection).toBeTruthy();

    const errorMessage = page.root?.shadowRoot?.querySelector('.error-message');
    expect(errorMessage?.textContent).toBe('Test error');
  });

  it('renders empty state when empty-message is provided', async () => {
    const page = await newSpecPage({
      components: [EuclidBaseModal],
      html: `<euclid-base-modal open="true" title="Test Modal" empty-message="No items found"></euclid-base-modal>`,
    });

    const emptyState = page.root?.shadowRoot?.querySelector('.empty-state');
    expect(emptyState).toBeTruthy();

    const emptyMessage = page.root?.shadowRoot?.querySelector('.empty-message');
    expect(emptyMessage?.textContent).toBe('No items found');
  });

  it('emits close event when close button is clicked', async () => {
    const page = await newSpecPage({
      components: [EuclidBaseModal],
      html: `<euclid-base-modal open="true" title="Test Modal"></euclid-base-modal>`,
    });

    const closeSpy = jest.fn();
    page.root?.addEventListener('euclidModalClose', closeSpy);

    const closeButton = page.root?.shadowRoot?.querySelector('.close-button') as HTMLElement;
    closeButton?.click();

    expect(closeSpy).toHaveBeenCalled();
  });

  it('emits search event when search input changes', async () => {
    const page = await newSpecPage({
      components: [EuclidBaseModal],
      html: `<euclid-base-modal open="true" title="Test Modal" show-search="true"></euclid-base-modal>`,
    });

    const searchSpy = jest.fn();
    page.root?.addEventListener('euclidModalSearch', searchSpy);

    const searchInput = page.root?.shadowRoot?.querySelector('.search-input') as HTMLInputElement;
    searchInput.value = 'test search';
    searchInput.dispatchEvent(new Event('input'));

    expect(searchSpy).toHaveBeenCalledWith(expect.objectContaining({
      detail: 'test search'
    }));
  });

  it('emits listChange event when list selector changes', async () => {
    const listOptions = JSON.stringify([{value: 'list1', label: 'List 1'}, {value: 'list2', label: 'List 2'}]);
    const page = await newSpecPage({
      components: [EuclidBaseModal],
      html: `<euclid-base-modal open="true" title="Test Modal" show-search="true" list-options='${listOptions}'></euclid-base-modal>`,
    });

    const listSpy = jest.fn();
    page.root?.addEventListener('euclidModalListChange', listSpy);

    const listSelector = page.root?.shadowRoot?.querySelector('.list-selector') as HTMLSelectElement;
    listSelector.value = 'list2';
    listSelector.dispatchEvent(new Event('change'));

    expect(listSpy).toHaveBeenCalledWith(expect.objectContaining({
      detail: 'list2'
    }));
  });  it('applies blur backdrop when enableBlur is true', async () => {
    const page = await newSpecPage({
      components: [EuclidBaseModal],
      html: `<euclid-base-modal open="true" title="Test Modal" enable-blur="true"></euclid-base-modal>`,
    });

    const overlay = page.root?.shadowRoot?.querySelector('.modal-overlay');
    expect(overlay?.classList.contains('modal-overlay--blur')).toBe(true);
  });

  it('applies loading class to content when loading', async () => {
    const page = await newSpecPage({
      components: [EuclidBaseModal],
      html: `<euclid-base-modal open="true" title="Test Modal" loading="true"></euclid-base-modal>`,
    });

    const content = page.root?.shadowRoot?.querySelector('.modal-content');
    expect(content?.classList.contains('modal-content--loading')).toBe(true);
  });

  it('handles keyboard events for escape key', async () => {
    const page = await newSpecPage({
      components: [EuclidBaseModal],
      html: `<euclid-base-modal open="true" title="Test Modal"></euclid-base-modal>`,
    });

    const closeSpy = jest.fn();
    page.root?.addEventListener('euclidModalClose', closeSpy);

    const component = page.rootInstance as EuclidBaseModal;
    const keyEvent = new KeyboardEvent('keydown', { key: 'Escape' });
    component.handleKeyDown(keyEvent);

    expect(closeSpy).toHaveBeenCalled();
  });

  it('handles overlay click to close', async () => {
    const page = await newSpecPage({
      components: [EuclidBaseModal],
      html: `<euclid-base-modal open="true" title="Test Modal"></euclid-base-modal>`,
    });

    const closeSpy = jest.fn();
    page.root?.addEventListener('euclidModalClose', closeSpy);

    const overlay = page.root?.shadowRoot?.querySelector('.modal-overlay') as HTMLElement;
    overlay?.click();

    expect(closeSpy).toHaveBeenCalled();
  });

  it('does not close on content click', async () => {
    const page = await newSpecPage({
      components: [EuclidBaseModal],
      html: `<euclid-base-modal open="true" title="Test Modal"></euclid-base-modal>`,
    });

    const closeSpy = jest.fn();
    page.root?.addEventListener('euclidModalClose', closeSpy);

    const content = page.root?.shadowRoot?.querySelector('.modal-content') as HTMLElement;
    content?.click();

    expect(closeSpy).not.toHaveBeenCalled();
  });
});

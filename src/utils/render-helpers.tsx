/**
 * Consistent rendering utilities - NO MORE INCONSISTENT PATTERNS!
 */

import { h } from '@stencil/core';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type VNode = any;

/**
 * Consistent conditional rendering helper
 */
export function renderIf(condition: boolean, content: () => VNode): VNode {
  return condition ? content() : null;
}

/**
 * Loading state renderer
 */
export function renderLoading(isLoading: boolean, content: VNode): VNode {
  return renderIf(isLoading, () => content);
}

/**
 * Error state renderer
 */
export function renderError(error: string | null, content: (error: string) => VNode): VNode {
  return error ? content(error) : null;
}

/**
 * Empty state renderer
 */
export function renderEmpty(isEmpty: boolean, content: VNode): VNode {
  return renderIf(isEmpty, () => content);
}

/**
 * Standard loading spinner
 */
export function LoadingSpinner({ message }: { message?: string }): VNode {
  return (
    <div class="euclid-loading">
      <div class="loading-spinner"></div>
      {message && <p>{message}</p>}
    </div>
  );
}

/**
 * Standard error display
 */
export function ErrorDisplay({ error, onRetry }: { error: string; onRetry?: () => void }): VNode {
  return (
    <div class="euclid-error">
      <p class="error-message">{error}</p>
      {onRetry && (
        <button onClick={onRetry} class="retry-button">
          Retry
        </button>
      )}
    </div>
  );
}

/**
 * Standard empty state
 */
export function EmptyState({
  title,
  description,
  action
}: {
  title: string;
  description?: string;
  action?: VNode
}): VNode {
  return (
    <div class="euclid-empty">
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {action}
    </div>
  );
}

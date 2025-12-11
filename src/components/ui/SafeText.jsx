/**
 * SafeText Component
 *
 * ✅ SECURITY: Safely displays user-generated content with XSS protection
 * Uses sanitizeHTML to prevent script injection attacks
 */

import { sanitizeHTML } from '@/lib/utils/sanitize';

export function SafeText({ children, className = '', as: Component = 'span', ...props }) {
  if (!children) return null;

  const sanitized = sanitizeHTML(String(children));

  return (
    <Component
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitized }}
      {...props}
    />
  );
}

export default SafeText;

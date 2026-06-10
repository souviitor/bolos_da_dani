// src/middleware.ts
export { default } from 'next-auth/middleware';

export const config = {
  matcher: ['/admin/dashboard', '/admin/orders', '/admin/products', '/admin/settings'],
};

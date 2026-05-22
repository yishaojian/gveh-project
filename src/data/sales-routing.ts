// src/data/sales-routing.ts
// Multi-region intelligent sales routing engine
// Routes incoming BOM inquiries to appropriate salesperson based on email domain/region

import type { Profile } from '../database.types';

// Sales team configuration (hardcoded for now, will move to database later)
const salesTeam: Profile[] = [
  {
    id: 'sales-cn-001',
    email: 'sales-cn@pnds.com',
    role: 'sales',
    wechat_key: process.env.SALES_CN_WECHAT_KEY || 'SCTxxxxxxxxxxxxxx',
    name: '张伟',
    performance_total: 1560000,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'sales-global-001',
    email: 'sales-global@pnds.com',
    role: 'sales',
    wechat_key: process.env.SALES_GLOBAL_WECHAT_KEY || 'SCTyyyyyyyyyyyyyy',
    name: '李明',
    performance_total: 2340000,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'sales-eu-001',
    email: 'sales-eu@pnds.com',
    role: 'sales',
    wechat_key: process.env.SALES_EU_WECHAT_KEY || 'SCTzzzzzzzzzzzzzz',
    name: '王芳',
    performance_total: 1890000,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
];

// Region to salesperson mapping
const regionMapping: Record<string, string> = {
  'cn': 'sales-cn-001',
  'com': 'sales-global-001',
  'de': 'sales-eu-001',
  'uk': 'sales-eu-001',
  'fr': 'sales-eu-001',
  'es': 'sales-eu-001',
  'it': 'sales-eu-001',
  'jp': 'sales-global-001',
  'kr': 'sales-global-001',
  'us': 'sales-global-001',
  'ca': 'sales-global-001',
  'au': 'sales-global-001',
  'nz': 'sales-global-001'
};

// Default salesperson if region not matched
const DEFAULT_SALES_ID = 'sales-global-001';

/**
 * Route incoming BOM inquiry to appropriate salesperson
 * @param customerEmail - Customer's email address
 * @param region - Optional explicit region override
 * @returns The assigned salesperson profile
 */
export function routeIncomingBOM(customerEmail: string, region?: string): Profile {
  console.log('[Sales Routing] Routing BOM from:', customerEmail, 'region:', region);
  
  // Extract domain from email
  const emailDomain = extractDomain(customerEmail);
  
  // Determine region from email domain or explicit region parameter
  let targetRegion = region || mapDomainToRegion(emailDomain);
  console.log('[Sales Routing] Detected region:', targetRegion);
  
  // Find salesperson for this region
  const salesId = regionMapping[targetRegion] || DEFAULT_SALES_ID;
  const salesperson = salesTeam.find(s => s.id === salesId);
  
  if (!salesperson) {
    console.warn('[Sales Routing] No salesperson found for region:', targetRegion, 'using default');
    return salesTeam.find(s => s.id === DEFAULT_SALES_ID)!;
  }
  
  console.log('[Sales Routing] Assigned to:', salesperson.name, '-', salesperson.email);
  return salesperson;
}

/**
 * Get all sales team members
 * @returns Array of all sales profiles
 */
export function getSalesTeam(): Profile[] {
  return salesTeam.filter(s => s.role === 'sales');
}

/**
 * Get salesperson by ID
 * @param salesId - Salesperson ID
 * @returns Salesperson profile or undefined
 */
export function getSalespersonById(salesId: string): Profile | undefined {
  return salesTeam.find(s => s.id === salesId);
}

/**
 * Extract domain from email address
 * @param email - Email address
 * @returns Domain part (e.g., 'qq.com', 'hotmail.com')
 */
function extractDomain(email: string): string {
  const match = email.match(/@(.+)$/);
  return match ? match[1].toLowerCase() : '';
}

/**
 * Map email domain to region code
 * @param domain - Email domain
 * @returns Region code (e.g., 'cn', 'com', 'de')
 */
function mapDomainToRegion(domain: string): string {
  // Chinese domains
  if (domain.includes('.cn')) return 'cn';
  
  // European domains
  if (domain.includes('.de')) return 'de';
  if (domain.includes('.uk')) return 'uk';
  if (domain.includes('.fr')) return 'fr';
  if (domain.includes('.es')) return 'es';
  if (domain.includes('.it')) return 'it';
  
  // Japanese/Korean domains
  if (domain.includes('.jp')) return 'jp';
  if (domain.includes('.kr')) return 'kr';
  
  // North American domains
  if (domain.includes('.us')) return 'us';
  if (domain.includes('.ca')) return 'ca';
  
  // Australian/New Zealand
  if (domain.includes('.au')) return 'au';
  if (domain.includes('.nz')) return 'nz';
  
  // Default to global
  return 'com';
}

/**
 * Get performance ranking of sales team
 * @returns Array of salespersons sorted by performance (descending)
 */
export function getSalesPerformanceRanking(): Profile[] {
  return [...salesTeam]
    .filter(s => s.role === 'sales')
    .sort((a, b) => b.performance_total - a.performance_total);
}

/**
 * Update salesperson performance
 * @param salesId - Salesperson ID
 * @param amount - Amount to add to performance_total
 */
export function updateSalesPerformance(salesId: string, amount: number): void {
  const salesperson = salesTeam.find(s => s.id === salesId);
  if (salesperson) {
    salesperson.performance_total += amount;
    salesperson.updated_at = new Date().toISOString();
    console.log('[Sales Routing] Updated performance for', salesperson.name, ':', salesperson.performance_total);
  }
}
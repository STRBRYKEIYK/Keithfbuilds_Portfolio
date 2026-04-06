// ============================================================================
// forms/index.js
// Export all form components and configurations
// ============================================================================

export { default as CustomerForm } from './CustomerForm'
export { default as MonthlyBillsBulkCreator } from './MonthlyBillsBulkCreator'
export { default as ProvidersBulkCreator, PROVIDER_CATEGORIES, getCategoryIcon, getCategoryLabel } from './ProvidersBulkCreator'
export { validateTIN, formatTIN, validateEmail, validatePhoneNumber } from './customer-config'
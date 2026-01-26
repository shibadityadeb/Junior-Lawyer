import { FileText, Lock, DollarSign, Home, Scale, Shield } from 'lucide-react'

// Template category metadata and loader
export interface TemplateFile {
  name: string
  filename: string
  categoryKey: string
  path: string
}

export interface TemplateCategory {
  key: string
  title: string
  description: string
  icon: string
  color: string
  templates: TemplateFile[]
}

export interface Template {
  id: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  categorySlug: string
  slug: string
}

// This maps the actual folder structure to categories
const TEMPLATE_CATEGORIES = {
  sales: {
    title: 'Sales Documents',
    description: 'Commercial sales and client agreements',
    icon: '📋',
    color: 'from-blue-500 to-blue-600',
    folder: 'sales_Documents',
  },
  nda: {
    title: 'Non-Disclosure Agreements',
    description: 'Confidentiality and NDA templates',
    icon: '🔐',
    color: 'from-purple-500 to-purple-600',
    folder: 'NDA(Non-disclosure-agreement)',
  },
  finance: {
    title: 'Finance Agreements',
    description: 'Loans, investments, and financial contracts',
    icon: '💰',
    color: 'from-green-500 to-green-600',
    folder: 'Finance_Agreements',
  },
  realEstate: {
    title: 'Real Estate',
    description: 'Property deeds and real estate agreements',
    icon: '🏠',
    color: 'from-amber-500 to-amber-600',
    folder: 'Real_Estate_Agreement',
  },
  powerOfAttorney: {
    title: 'Power of Attorney',
    description: 'Legal authority and representation documents',
    icon: '⚖️',
    color: 'from-red-500 to-red-600',
    folder: 'Power_of_attorney',
  },
  compliance: {
    title: 'Policy & Compliance',
    description: 'Privacy, security, and compliance policies',
    icon: '📜',
    color: 'from-slate-500 to-slate-600',
    folder: 'policy_and_compliance',
  },
}

// Converts filename to display name
export function formatDocumentName(filename: string): string {
  // Remove .docx extension
  let name = filename.replace(/\.docx$/i, '')
  // Replace underscores and hyphens with spaces
  name = name.replace(/[_-]/g, ' ')
  // Ensure proper capitalization is maintained
  return name
}

// Builds template file paths using static imports
export function getTemplateCategories(): TemplateCategory[] {
  const categories: TemplateCategory[] = []

  Object.entries(TEMPLATE_CATEGORIES).forEach(([key, categoryMeta]) => {
    const templates: TemplateFile[] = []

    // Map templates based on category
    const templatesByCategory: Record<string, string[]> = {
      sales: [
        'Client Agreement Template.docx',
        'International Sales Agreement.docx',
        'Invoice Template with Payment Terms.docx',
        'Rental Application Form.docx',
      ],
      nda: [
        'Confidentiality Agreement.docx',
        'Employment Non-Disclosure Agreement.docx',
        'Mutual Non-Disclosure Agreement.docx',
      ],
      finance: [
        'Deed of Trust.docx',
        'Escrow Agreement.docx',
        'Investor Rights Agreement.docx',
        'Loan Agreement.docx',
        'Payment Agreement.docx',
        'Personal Guarantee Agreement.docx',
        'Security Agreement.docx',
      ],
      realEstate: [
        'Grant Deed.docx',
        'Mortgage Agreement.docx',
        'Notice of Commencement.docx',
        'Quitclaim Deed.docx',
      ],
      powerOfAttorney: [
        'General Power of Attorney.docx',
        'Medical Power of Attorney (Healthcare Proxy).docx',
        'Revocation of Power of Attorney.docx',
        'Tax Power of Attorney.docx',
      ],
      compliance: [
        'Data Processing Agreement (DPA).docx',
        'Disclaimer Template.docx',
        'Information Security Policy.docx',
        'Privacy Policy Template.docx',
        'Refund Policy.docx',
      ],
    }

    const docNames = templatesByCategory[key] || []

    docNames.forEach((filename) => {
      templates.push({
        name: formatDocumentName(filename),
        filename,
        categoryKey: key,
        path: `${categoryMeta.folder}/${filename}`,
      })
    })

    categories.push({
      key,
      title: categoryMeta.title,
      description: categoryMeta.description,
      icon: categoryMeta.icon,
      color: categoryMeta.color,
      templates,
    })
  })

  return categories
}

// Flat array of all templates for browsing
export const templates: Template[] = [
  {
    id: 'sales-1',
    title: 'Client Agreement Template',
    description: 'Comprehensive client service agreement for professional services',
    icon: FileText,
    categorySlug: 'sales',
    slug: 'client-agreement-template',
  },
  {
    id: 'sales-2',
    title: 'International Sales Agreement',
    description: 'Cross-border sales contract with international standards',
    icon: FileText,
    categorySlug: 'sales',
    slug: 'international-sales-agreement',
  },
  {
    id: 'sales-3',
    title: 'Invoice Template',
    description: 'Professional invoice template with payment terms',
    icon: FileText,
    categorySlug: 'sales',
    slug: 'invoice-template',
  },
  {
    id: 'sales-4',
    title: 'Rental Application Form',
    description: 'Rental property application form with verification checklist',
    icon: FileText,
    categorySlug: 'sales',
    slug: 'rental-application-form',
  },
  {
    id: 'nda-1',
    title: 'Confidentiality Agreement',
    description: 'Standard confidentiality and trade secret protection agreement',
    icon: Lock,
    categorySlug: 'nda',
    slug: 'confidentiality-agreement',
  },
  {
    id: 'nda-2',
    title: 'Employment NDA',
    description: 'Non-disclosure agreement for employee onboarding',
    icon: Lock,
    categorySlug: 'nda',
    slug: 'employment-nda',
  },
  {
    id: 'nda-3',
    title: 'Mutual NDA',
    description: 'Mutual non-disclosure agreement for two parties',
    icon: Lock,
    categorySlug: 'nda',
    slug: 'mutual-nda',
  },
  {
    id: 'finance-1',
    title: 'Deed of Trust',
    description: 'Security instrument transferring real property to trustee',
    icon: DollarSign,
    categorySlug: 'finance',
    slug: 'deed-of-trust',
  },
  {
    id: 'finance-2',
    title: 'Escrow Agreement',
    description: 'Agreement for holding funds in escrow during transactions',
    icon: DollarSign,
    categorySlug: 'finance',
    slug: 'escrow-agreement',
  },
  {
    id: 'finance-3',
    title: 'Investor Rights Agreement',
    description: 'Agreement protecting investor rights and interests',
    icon: DollarSign,
    categorySlug: 'finance',
    slug: 'investor-rights-agreement',
  },
  {
    id: 'finance-4',
    title: 'Loan Agreement',
    description: 'Standard loan agreement with repayment terms',
    icon: DollarSign,
    categorySlug: 'finance',
    slug: 'loan-agreement',
  },
  {
    id: 'finance-5',
    title: 'Payment Agreement',
    description: 'Agreement for scheduled payment arrangements',
    icon: DollarSign,
    categorySlug: 'finance',
    slug: 'payment-agreement',
  },
  {
    id: 'finance-6',
    title: 'Personal Guarantee',
    description: 'Personal guarantee backing up business loan obligations',
    icon: DollarSign,
    categorySlug: 'finance',
    slug: 'personal-guarantee',
  },
  {
    id: 'finance-7',
    title: 'Security Agreement',
    description: 'Agreement granting security interest in assets',
    icon: DollarSign,
    categorySlug: 'finance',
    slug: 'security-agreement',
  },
  {
    id: 'realestate-1',
    title: 'Grant Deed',
    description: 'Real property transfer with grantor warranty',
    icon: Home,
    categorySlug: 'realestate',
    slug: 'grant-deed',
  },
  {
    id: 'realestate-2',
    title: 'Mortgage Agreement',
    description: 'Mortgage loan agreement secured by real property',
    icon: Home,
    categorySlug: 'realestate',
    slug: 'mortgage-agreement',
  },
  {
    id: 'realestate-3',
    title: 'Notice of Commencement',
    description: 'Notice of construction project commencement on property',
    icon: Home,
    categorySlug: 'realestate',
    slug: 'notice-of-commencement',
  },
  {
    id: 'realestate-4',
    title: 'Quitclaim Deed',
    description: 'Property transfer without warranty of title',
    icon: Home,
    categorySlug: 'realestate',
    slug: 'quitclaim-deed',
  },
  {
    id: 'poa-1',
    title: 'General Power of Attorney',
    description: 'Grant broad authority to agent for financial matters',
    icon: Scale,
    categorySlug: 'powerOfAttorney',
    slug: 'general-power-of-attorney',
  },
  {
    id: 'poa-2',
    title: 'Medical Power of Attorney',
    description: 'Healthcare proxy granting medical decision authority',
    icon: Scale,
    categorySlug: 'powerOfAttorney',
    slug: 'medical-power-of-attorney',
  },
  {
    id: 'poa-3',
    title: 'Revocation of POA',
    description: 'Document to revoke previously granted power of attorney',
    icon: Scale,
    categorySlug: 'powerOfAttorney',
    slug: 'revocation-of-poa',
  },
  {
    id: 'poa-4',
    title: 'Tax Power of Attorney',
    description: 'Authority to represent taxpayer before IRS',
    icon: Scale,
    categorySlug: 'powerOfAttorney',
    slug: 'tax-power-of-attorney',
  },
  {
    id: 'compliance-1',
    title: 'Data Processing Agreement',
    description: 'GDPR-compliant data processing terms and conditions',
    icon: Shield,
    categorySlug: 'compliance',
    slug: 'data-processing-agreement',
  },
  {
    id: 'compliance-2',
    title: 'Disclaimer Template',
    description: 'General liability and service disclaimer',
    icon: Shield,
    categorySlug: 'compliance',
    slug: 'disclaimer-template',
  },
  {
    id: 'compliance-3',
    title: 'Information Security Policy',
    description: 'Comprehensive information security policy framework',
    icon: Shield,
    categorySlug: 'compliance',
    slug: 'information-security-policy',
  },
  {
    id: 'compliance-4',
    title: 'Privacy Policy Template',
    description: 'GDPR and CCPA compliant privacy policy',
    icon: Shield,
    categorySlug: 'compliance',
    slug: 'privacy-policy-template',
  },
  {
    id: 'compliance-5',
    title: 'Refund Policy',
    description: 'Clear refund and return policy for business',
    icon: Shield,
    categorySlug: 'compliance',
    slug: 'refund-policy',
  },
]

// Handles downloading a template file using direct URL

export function downloadTemplate(
  templatePath: string,
  templateName: string
): void {
  // Files are in /public, so we can reference them directly
  const fileUrl = `/${templatePath}`
  
  console.log('[DEBUG] Downloading template:', { fileUrl, templateName })

  // Create an anchor element and trigger native browser download
  const link = document.createElement('a')
  link.href = fileUrl
  link.download = `${templateName}.docx`
  
  // Append to DOM, click, and remove
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  console.log('[DEBUG] Download triggered successfully')
}

// Get a template by its category slug and template slug
export function getTemplateBySlug(categorySlug: string, templateSlug: string) {
  const template = templates.find(
    (t) => t.categorySlug === categorySlug && t.slug === templateSlug
  )
  
  if (!template) return null
  
  // Return template with download URL
  return {
    ...template,
    downloadUrl: '', // Will be set based on the actual file path
  }
}

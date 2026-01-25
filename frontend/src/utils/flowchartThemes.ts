/**
 * Flowchart themes and incident detection for context-aware responses
 */

export type IncidentType = 
  | 'school-bullying'
  | 'workplace-harassment'
  | 'cyberbullying'
  | 'threats'
  | 'discrimination'
  | 'general'

export interface FlowchartTheme {
  name: string
  incidentTypes: IncidentType[]
  title: string
  empathyOpener: string
  clarifyingQuestions: string[]
  flowchartDef: string
  immediateOptions: string[]
}

/**
 * Detect incident type from user message
 */
export function detectIncidentType(message: string): IncidentType {
  const lower = message.toLowerCase()

  // School bullying indicators
  if (/(school|student|class|teacher|peer|classmate|grade)/i.test(lower)) {
    if (/(bully|bullying|mock|laugh|exclude|tease|cruel)/i.test(lower)) {
      return 'school-bullying'
    }
  }

  // Workplace harassment
  if (/(workplace|work|boss|manager|colleague|coworker|employer|office)/i.test(lower)) {
    if (/(harass|harassment|hostile|discrimination|unfair|mistreat)/i.test(lower)) {
      return 'workplace-harassment'
    }
  }

  // Cyberbullying
  if (/(online|social media|twitter|facebook|instagram|tiktok|message|text|digital)/i.test(lower)) {
    if (/(bully|bullying|harass|threaten|defam|post|comment)/i.test(lower)) {
      return 'cyberbullying'
    }
  }

  // Threats
  if (/(threaten|threat|danger|harm|violence|afraid|scared|fear)/i.test(lower)) {
    return 'threats'
  }

  // Discrimination
  if (/(discriminat|bias|prejudice|racist|sexist|gender|caste|religion)/i.test(lower)) {
    return 'discrimination'
  }

  return 'general'
}

/**
 * Get themed flowchart configuration by incident type
 */
export const flowchartThemes: Record<IncidentType, FlowchartTheme> = {
  'school-bullying': {
    name: 'School Bullying',
    incidentTypes: ['school-bullying'],
    title: 'Legal Process for a School Bullying Incident',
    empathyOpener:
      'School bullying can be distressing and affects your well-being. The law provides protections and remedies. Let\'s walk through what typically happens next and your options.',
    clarifyingQuestions: [
      'Is this bullying physical, verbal, or online?',
      'Have you reported this to school administration or a teacher yet?'
    ],
    immediateOptions: [
      'Document all incidents (dates, times, witnesses)',
      'Report to school principal or anti-bullying officer immediately',
      'Inform your parents/guardians',
      'Request the school\'s anti-bullying policy and complaint process',
      'Consider counseling support through school or independently'
    ],
    flowchartDef: `flowchart TD
      A["Bullying Incident Occurs"] --> B["Document Everything:<br/>Dates, times, witnesses,<br/>evidence"]
      B --> C["Inform Parent/<br/>Guardian"]
      C --> D["Report to School<br/>Administration"]
      D --> E{"School Takes<br/>Action?"}
      E -->|Yes| F["Incident Resolved"]
      E -->|No| G["File Formal Complaint<br/>with School Board"]
      G --> H["Request Mediation/<br/>Anti-Bullying Review"]
      H --> I{"Resolved?"}
      I -->|Yes| F
      I -->|No| J["Consult Lawyer for<br/>Legal Action"]
      J --> K["Potential Remedies:<br/>Injunction, Damages"]
      K --> L["Resolution"]
      F --> L
      style A fill:#ff9500,stroke:#333,color:#fff
      style B fill:#334155,stroke:#666
      style L fill:#22c55e,stroke:#666
      style J fill:#f97316,stroke:#666`
  },

  'workplace-harassment': {
    name: 'Workplace Harassment',
    incidentTypes: ['workplace-harassment'],
    title: 'Legal Process for Workplace Harassment',
    empathyOpener:
      'Workplace harassment creates a hostile environment and impacts your professional life. Employment law protects you. Here\'s what typically happens and your options.',
    clarifyingQuestions: [
      'Is this harassment based on protected characteristics (gender, caste, religion)?',
      'Have you reported this to HR or management?'
    ],
    immediateOptions: [
      'Document all incidents with specific dates and details',
      'Report in writing to HR with copies',
      'Request investigation within the organization',
      'Review your company\'s harassment policy',
      'Consider reporting to labor authority if internal remedies fail'
    ],
    flowchartDef: `flowchart TD
      A["Harassment Occurs<br/>at Workplace"] --> B["Record Details:<br/>Date, time, witnesses,<br/>nature of harassment"]
      B --> C["File Written Complaint<br/>with HR"]
      C --> D["Company Initiates<br/>Investigation"]
      D --> E{"Investigation<br/>Outcome?"}
      E -->|Substantiated| F["Corrective Action Taken"]
      E -->|Not Substantiated| G["Appeal to Senior<br/>Management"]
      F --> H["Harassment Stops<br/>Resolution"]
      G --> I{"Appeal<br/>Successful?"}
      I -->|Yes| H
      I -->|No| J["File Complaint with<br/>Labor Authority"]
      J --> K["Government Investigation"]
      K --> L["Penalties / Remedies"]
      L --> H
      style A fill:#f97316,stroke:#333,color:#fff
      style B fill:#334155,stroke:#666
      style F fill:#22c55e,stroke:#666
      style L fill:#f97316,stroke:#666`
  },

  'cyberbullying': {
    name: 'Cyberbullying',
    incidentTypes: ['cyberbullying'],
    title: 'Legal Process for Cyberbullying',
    empathyOpener:
      'Online harassment can feel inescapable. Digital evidence is traceable, and laws protect you. Here\'s the process and immediate steps you can take.',
    clarifyingQuestions: [
      'What platform is the harassment happening on (social media, messaging, etc.)?',
      'Have you blocked the person or reported to the platform?'
    ],
    immediateOptions: [
      'Take screenshots/save evidence of all harmful content',
      'Report content to the platform immediately',
      'Block the harasser on all platforms',
      'Adjust privacy settings to limit exposure',
      'Inform parents/guardians or employer if applicable'
    ],
    flowchartDef: `flowchart TD
      A["Cyberbullying Begins"] --> B["Screenshot/Save<br/>All Evidence"]
      B --> C["Report to Platform"]
      C --> D{"Platform<br/>Removes Content?"}
      D -->|Yes| E["Block Harasser"]
      E --> F["Monitor for More<br/>Incidents"]
      D -->|No| G["Report to Local Police<br/>with Evidence"]
      F --> H{"More<br/>Harassment?"}
      H -->|Yes| I["File Cyber Crime<br/>Complaint"]
      H -->|No| J["Case Closed"]
      G --> K["Police Investigation"]
      I --> K
      K --> L["Legal Action:<br/>Criminal / Civil"]
      L --> M["Restraining Order /<br/>Damages"]
      M --> J
      style A fill:#f97316,stroke:#333,color:#fff
      style B fill:#334155,stroke:#666
      style J fill:#22c55e,stroke:#666
      style L fill:#f97316,stroke:#666`
  },

  'threats': {
    name: 'Threats & Danger',
    incidentTypes: ['threats'],
    title: 'Legal Process When Facing Threats',
    empathyOpener:
      'Threats create fear and uncertainty. The law takes threats seriously and provides emergency protections. If you\'re in immediate danger, contact police first. Here\'s what comes next.',
    clarifyingQuestions: [
      'Are you in immediate danger? If yes, contact police/emergency services first.',
      'What type of threat (physical violence, property damage, online)?'
    ],
    immediateOptions: [
      'Call emergency services (100 in India) if in danger',
      'Save all evidence of threats (messages, recordings, etc.)',
      'Report to police with evidence',
      'Request police protection if threats are credible',
      'Inform trusted people about the situation'
    ],
    flowchartDef: `flowchart TD
      A["Threat Received"] --> B{"Immediate<br/>Danger?"}
      B -->|Yes| C["Call Emergency<br/>Services 100"]
      B -->|No| D["Save All Evidence"]
      C --> E["Police Response/<br/>Protection"]
      D --> F["File FIR with Police"]
      E --> G["Police Investigation"]
      F --> G
      G --> H{"Threat<br/>Substantiated?"}
      H -->|Yes| I["Arrest of Accused"]
      H -->|No| J["Case Monitoring"]
      I --> K["Criminal Prosecution"]
      J --> L{"More<br/>Threats?"}
      L -->|Yes| M["Restraining Order"]
      L -->|No| N["Case Closure"]
      K --> M
      M --> O["Legal Protection:<br/>Jail / Fine"]
      O --> N
      style A fill:#f97316,stroke:#333,color:#fff
      style C fill:#ff0000,stroke:#333,color:#fff
      style K fill:#f97316,stroke:#666
      style N fill:#22c55e,stroke:#666`
  },

  'discrimination': {
    name: 'Discrimination',
    incidentTypes: ['discrimination'],
    title: 'Legal Process for Discrimination',
    empathyOpener:
      'Discrimination based on protected characteristics is illegal. You have strong legal protections. The process ensures your case is heard and remedied.',
    clarifyingQuestions: [
      'What characteristic (caste, gender, religion, disability)?',
      'Is this in education, employment, services, or housing?'
    ],
    immediateOptions: [
      'Document all discriminatory incidents with details',
      'Report to HR (workplace) or administration (school)',
      'File complaint with appropriate authority (SCST Act, Equal Pay Act, etc.)',
      'Request written explanation from the organization',
      'Preserve all evidence of discrimination'
    ],
    flowchartDef: `flowchart TD
      A["Discrimination Occurs"] --> B["Gather Evidence:<br/>Documents, witnesses,<br/>communications"]
      B --> C["File Internal Complaint"]
      C --> D["Organization Investigates"]
      D --> E{"Investigation<br/>Finds Merit?"}
      E -->|Yes| F["Corrective Action"]
      E -->|No| G["Appeal / Escalate"]
      F --> H["Remedies:<br/>Compensation, Policy Change"]
      G --> I["File with Anti-Discrimination<br/>Authority"]
      I --> J["Government Investigation"]
      J --> K["Hearing & Decision"]
      K --> L["Damages & Remedies"]
      H --> M["Case Resolved"]
      L --> M
      style A fill:#f97316,stroke:#333,color:#fff
      style B fill:#334155,stroke:#666
      style H fill:#f97316,stroke:#666
      style M fill:#22c55e,stroke:#666`
  },

  general: {
    name: 'General Legal Issue',
    incidentTypes: ['general'],
    title: 'Legal Overview',
    empathyOpener:
      'Understanding your legal situation is the first step. Let\'s break down what typically happens and your available options.',
    clarifyingQuestions: [
      'What jurisdiction does this fall under (school, workplace, civil)?',
      'Have you already taken any steps?'
    ],
    immediateOptions: [
      'Gather all relevant documents and evidence',
      'Understand applicable laws and regulations',
      'Consult with relevant authorities',
      'Explore settlement or resolution options',
      'Prepare for formal legal proceedings if needed'
    ],
    flowchartDef: `flowchart TD
      A["Legal Issue Arises"] --> B["Assess Situation<br/>& Gather Facts"]
      B --> C["Understand Applicable<br/>Laws"]
      C --> D["Determine Jurisdiction<br/>& Authority"]
      D --> E["Explore Options:<br/>Settlement, Mediation,<br/>Legal Action"]
      E --> F{"Option<br/>Chosen?"}
      F -->|Settlement| G["Negotiate & Resolve"]
      F -->|Mediation| H["Third-party Mediation"]
      F -->|Legal Action| I["File Formal Case"]
      G --> J["Agreement Finalized"]
      H --> K{"Mediation<br/>Successful?"}
      K -->|Yes| J
      K -->|No| I
      I --> L["Court Proceedings"]
      L --> M["Judgment & Remedy"]
      M --> N["Case Resolved"]
      J --> N
      style A fill:#f97316,stroke:#333,color:#fff
      style B fill:#334155,stroke:#666
      style N fill:#22c55e,stroke:#666`
  }
}

/**
 * Get theme by incident type
 */
export function getThemeByIncidentType(incidentType: IncidentType): FlowchartTheme {
  return flowchartThemes[incidentType]
}

/**
 * Mermaid theme configuration for dark mode
 */
export const mermaidDarkThemeConfig = {
  primaryColor: '#1e293b',
  primaryTextColor: '#f1f5f9',
  primaryBorderColor: '#475569',
  lineColor: '#64748b',
  secondBkgColor: '#334155',
  tertiaryColor: '#0f172a',
  tertiaryTextColor: '#f1f5f9',
  tertiaryBorderColor: '#475569',
  background: '#0f172a',
  mainBkg: '#1e293b',
  secondBkg: '#334155',
  textColor: '#f1f5f9',
  border: '#475569'
}

/**
 * Generate Mermaid theme config string for Mermaid initialization
 */
export function getMermaidThemeConfig(): string {
  return `
    %%{init{
      'theme': 'dark',
      'themeVariables': {
        'primaryColor': '#1e293b',
        'primaryTextColor': '#f1f5f9',
        'primaryBorderColor': '#475569',
        'lineColor': '#64748b',
        'secondBkgColor': '#334155',
        'tertiaryColor': '#0f172a',
        'tertiaryTextColor': '#f1f5f9',
        'tertiaryBorderColor': '#475569',
        'fontSize': '14px',
        'fontFamily': 'inherit'
      }
    }}%%
  `
}

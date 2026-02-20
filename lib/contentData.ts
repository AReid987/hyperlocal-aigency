// Content data for Void Reactor scrollytelling sections

export interface SectionContent {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  stats?: { value: string; label: string }[];
  cta?: { text: string; href: string; variant: 'primary' | 'secondary' | 'ghost' };
}

export const CONTENT_SECTIONS: SectionContent[] = [
  {
    id: 'hero',
    title: 'The Void Reactor',
    subtitle: 'Autonomous Infrastructure Discovery',
    description: 'Navigate the digital void. We scan, analyze, and validate autonomous systems across the infrastructure landscape—identifying anomalies, verifying operational integrity, and mapping the hidden networks that power the next generation of AI-driven services.',
    stats: [
      { value: '500+', label: 'Systems Scanned' },
      { value: '99.9%', label: 'Detection Rate' },
      { value: '<50ms', label: 'Response Time' },
    ],
    cta: { text: 'Begin Scan', href: '#hunt', variant: 'primary' },
  },
  {
    id: 'hunt',
    title: 'The Hunt',
    subtitle: 'Target Acquisition & Classification',
    description: 'In the vast digital landscape, identifying autonomous systems requires precision and speed. Our scanners penetrate the noise, isolating high-value targets based on behavioral signatures, API patterns, and operational fingerprints. Every scan reveals the architecture of intelligent systems operating in the wild.',
    stats: [
      { value: '12ms', label: 'Avg. Discovery' },
      { value: '98.5%', label: 'Accuracy' },
      { value: '∞', label: 'Coverage' },
    ],
    cta: { text: 'View Capabilities', href: '#audit', variant: 'secondary' },
  },
  {
    id: 'audit',
    title: 'The Audit',
    subtitle: 'Real-Time Verification Protocol',
    description: 'Validation is not a checkpoint—it\'s a continuous process. Our audit systems flow through every detected entity, cross-referencing operational patterns, security compliance, and behavioral baselines. False positives dissolve under scrutiny. Only the legitimate autonomous systems remain.',
    stats: [
      { value: '7-Layer', label: 'Verification' },
      { value: '0.01%', label: 'False Positive' },
      { value: '24/7', label: 'Monitoring' },
    ],
    cta: { text: 'See Process', href: '#ghost', variant: 'secondary' },
  },
  {
    id: 'ghost',
    title: 'The Ghost',
    subtitle: 'Disqualification Cascade',
    description: 'Not every system survives the audit. Anomalous patterns, security vulnerabilities, and behavioral inconsistencies trigger cascading disqualification. These ghosts—shadows of false positives and compromised entities—fade into the void, leaving only verified autonomous infrastructure visible.',
    stats: [
      { value: '-67%', label: 'Noise Reduction' },
      { value: '100%', label: 'Compliance' },
      { value: 'Auto', label: 'Filtering' },
    ],
    cta: { text: 'Explore Results', href: '#infrastructure', variant: 'secondary' },
  },
  {
    id: 'infrastructure',
    title: 'The Infrastructure',
    subtitle: 'Operational Architecture',
    description: 'What remains is a map of verified autonomous systems—a network of intelligent infrastructure ready for integration, analysis, and deployment. This is the foundation: validated, secure, and operating at the edge of what\'s possible.',
    cta: { text: 'Get Started', href: '#contact', variant: 'primary' },
  },
];

export const THEME = {
  colors: {
    void: '#09090b',
    neon: '#00f0ff',
    danger: '#f43f5e',
    zinc: {
      50: '#fafafa',
      100: '#f4f4f5',
      200: '#e4e4e7',
      300: '#d4d4d8',
      400: '#a1a1aa',
      500: '#71717a',
      600: '#52525b',
      700: '#3f3f46',
      800: '#27272a',
      900: '#18181b',
      950: '#09090b',
    },
  },
  fonts: {
    mono: 'var(--font-jetbrains-mono)',
    sans: 'var(--font-inter)',
  },
};

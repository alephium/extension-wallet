export const supportedLanguages = ["en", "de", "vi", "pt"] as const;

export type Language = (typeof supportedLanguages)[number];

export const languageOptions: Array<{ label: string; value: Language }> = [
  { label: 'English', value: 'en' },
  { label: 'Deutsch', value: 'de' },
  { label: 'Português', value: 'pt' },
  { label: 'Tiếng Việt', value: 'vi' },
]

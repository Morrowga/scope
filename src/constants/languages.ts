export interface Language {
  code: string;
  name: string;
  flag: string;
}

export const LANGUAGES: Language[] = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'my', name: 'Burmese', flag: '🇲🇲' },
  { code: 'th', name: 'Thai', flag: '🇹🇭' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'ms', name: 'Malay', flag: '🇲🇾' },        
  { code: 'tl', name: 'Filipino', flag: '🇵🇭' },     
  { code: 'km', name: 'Khmer', flag: '🇰🇭' },        
  { code: 'lo', name: 'Lao', flag: '🇱🇦' }, 
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'zh-cn', name: 'Chinese (Simplified)', flag: '🇨🇳' },
  { code: 'zh-tw', name: 'Chinese (Traditional)', flag: '🇹🇼' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
  { code: 'id', name: 'Indonesian', flag: '🇮🇩' },
  { code: 'vi', name: 'Vietnamese', flag: '🇻🇳' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'tr', name: 'Turkish', flag: '🇹🇷' },
  { code: 'nl', name: 'Dutch', flag: '🇳🇱' },
  { code: 'pl', name: 'Polish', flag: '🇵🇱' },
  { code: 'sv', name: 'Swedish', flag: '🇸🇪' }
];

export const getLanguageByCode = (code: string): Language =>
  LANGUAGES.find((l) => l.code === code) ?? LANGUAGES[0];

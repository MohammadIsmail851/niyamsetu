import { useAppStore } from '@/store';
import { useTranslation } from '@/i18n';

export const useI18n = () => {
  const language = useAppStore((s) => s.language);
  return useTranslation(language);
};

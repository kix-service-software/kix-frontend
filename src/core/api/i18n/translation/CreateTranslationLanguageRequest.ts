import { CreateTranslationLanguage } from './CreateTranslationLanguage';

export class CreateTranslationLanguageRequest {

  public TranslationLanguage: CreateTranslationLanguage;

  public constructor(translationLanguage: CreateTranslationLanguage) {
    this.TranslationLanguage = translationLanguage;
  }

}

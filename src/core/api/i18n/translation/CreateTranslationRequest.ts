import { CreateTranslation } from './CreateTranslation';

export class CreateTranslationRequest {
  public Translation: CreateTranslation;

  public constructor(translation: CreateTranslation) {
    this.Translation = translation;
  }
}

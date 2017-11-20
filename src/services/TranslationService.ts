import { injectable, inject } from 'inversify';
import { ITranslationService, IConfigurationService } from '@kix/core/dist/services';
import { TranslationConfiguration } from '@kix/core/dist/model';

@injectable()
export class TranslationService implements ITranslationService {

    private configurationService: IConfigurationService;

    private translationConfiguration: TranslationConfiguration;

    public constructor( @inject("IConfigurationService") configurationService: IConfigurationService) {
        this.configurationService = configurationService;
        this.translationConfiguration = this.configurationService.getTranslationConfiguration();
    }

    public getTranslation(id: string, languageShortCut: string): string {
        let value = id;
        const translationConfig = this.translationConfiguration.translations.find((t) => t.id === id);
        if (translationConfig) {
            const translation = translationConfig.translationValues[languageShortCut];
            if (translation) {
                value = translation;
            } else {
                value = translationConfig.defaultValue;
            }
        }
        return value;
    }

    public getTranslations(ids: string[], languageShortCut: string): any {
        const userTranslation = {};

        for (const id of ids) {
            userTranslation[id] = this.getTranslation(id, languageShortCut);
        }

        return userTranslation;
    }

    public getAllTranslations(languageShortCut: string): any {
        const result = {};

        for (const translationConfig of this.translationConfiguration.translations) {
            const translation = translationConfig.translationValues[languageShortCut];
            if (translation) {
                result[translationConfig.id] = translation;
            } else {
                result[translationConfig.id] = translationConfig.defaultValue;
            }
        }

        return result;
    }

}

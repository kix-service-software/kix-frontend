import {
    KIXObjectType, KIXObjectLoadingOptions, KIXObjectSpecificLoadingOptions,
    KIXObjectSpecificCreateOptions, Error
} from '../../../model';

import { KIXObjectService } from './KIXObjectService';
import { KIXObjectServiceRegistry } from '../../KIXObjectServiceRegistry';
import { LoggingService } from '../LoggingService';
import {
    Translation, TranslationLanguageLoadingOptions, TranslationLanguage, TranslationProperty,
    TranslationLanguageProperty, PODefinition
} from '../../../model/kix/i18n';

export class TranslationService extends KIXObjectService {

    protected RESOURCE_URI: string = this.buildUri('i18n', 'translations');

    private static INSTANCE: TranslationService;

    public static getInstance(): TranslationService {
        if (!TranslationService.INSTANCE) {
            TranslationService.INSTANCE = new TranslationService();
        }
        return TranslationService.INSTANCE;
    }

    public objectType: KIXObjectType = KIXObjectType.TRANSLATION;

    private constructor() {
        super();
        KIXObjectServiceRegistry.registerServiceInstance(this);
    }

    public isServiceFor(kixObjectType: KIXObjectType): boolean {
        return kixObjectType === KIXObjectType.TRANSLATION;
    }

    public async loadObjects<T>(
        token: string, clientRequestId: string, objectType: KIXObjectType, objectIds: Array<number | string>,
        loadingOptions: KIXObjectLoadingOptions, objectLoadingOptions: KIXObjectSpecificLoadingOptions
    ): Promise<T[]> {

        let objects = [];
        if (objectType === KIXObjectType.TRANSLATION) {
            const translations = await this.getTranslations(token, loadingOptions);
            if (objectIds && objectIds.length) {
                objects = translations.filter((t) => objectIds.some((oid) => oid === t.ObjectId));
            } else {
                objects = translations;
            }
        } else if (objectType === KIXObjectType.TRANSLATION_LANGUAGE) {
            const options = objectLoadingOptions as TranslationLanguageLoadingOptions;
            objects = await this.getLanguages(token, objectIds, options);
        }

        return objects;
    }

    public async createObject(
        token: string, clientRequestId: string, objectType: KIXObjectType, parameter: Array<[string, any]>,
        createOptions?: KIXObjectSpecificCreateOptions
    ): Promise<number> {
        const pattern = parameter.find((p) => p[0] === TranslationProperty.PATTERN);

        const createParameter: Array<[string, any]> = [pattern];

        const languages: TranslationLanguage[] = [];
        const languageParameter = parameter.filter((p) => p[0] !== TranslationProperty.PATTERN);
        languageParameter.forEach((lp) => {
            if (typeof lp[1] !== 'undefined' && lp[1] !== null && lp[1] !== '') {
                const translationLanguage = new TranslationLanguage();
                translationLanguage.Language = lp[0];
                translationLanguage.Value = lp[1];
                languages.push(translationLanguage);
            }
        });

        if (languages.length > 0) {
            createParameter.push([TranslationProperty.LANGUAGES, languages]);
        }

        const uri = this.buildUri('system', 'i18n', 'translations');
        const id = await super.executeUpdateOrCreateRequest(
            token, clientRequestId, createParameter, uri, KIXObjectType.TRANSLATION, 'TranslationID', true
        ).catch((error: Error) => {
            LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
            throw new Error(error.Code, error.Message);
        });

        return id;
    }

    public async updateObject(
        token: string, clientRequestId: string, objectType: KIXObjectType,
        parameter: Array<[string, any]>, objectId: number | string
    ): Promise<string | number> {
        const pattern = parameter.find((p) => p[0] === TranslationProperty.PATTERN);

        const uri = this.buildUri('system', 'i18n', 'translations', objectId);
        const id = await super.executeUpdateOrCreateRequest(
            token, clientRequestId, [pattern], uri, this.objectType, 'TranslationID'
        );

        const translations = await this.getTranslations(token);
        const translation = translations.find((t) => t.ID === objectId);
        if (translation) {
            const languageParameter = parameter.filter((p) => p[0] !== TranslationProperty.PATTERN);
            this.createOrUpdateLanguages(
                token, clientRequestId, translation.ID, translation.Languages, languageParameter
            );
        }

        return id;
    }

    private async createOrUpdateLanguages(
        token: string, clientRequestId: string, translationId: number,
        languages: TranslationLanguage[], parameter: Array<[string, any]>
    ): Promise<void> {
        for (const param of parameter) {
            const existingLanguage = languages.find((l) => l.Language === param[0]);
            if (existingLanguage) {

                if (this.hasValue(param[1])) {
                    const translationParameter: Array<[string, string]> =
                        [[TranslationLanguageProperty.VALUE, param[1].trim()]];

                    const uri = this.buildUri('system', 'i18n', 'translations', translationId, 'languages', param[0]);
                    await super.executeUpdateOrCreateRequest(
                        token, clientRequestId, translationParameter, uri,
                        KIXObjectType.TRANSLATION_LANGUAGE, 'TranslationLanguageID'
                    );
                } else {
                    const uri = this.buildUri('system', 'i18n', 'translations', translationId, 'languages', param[0]);
                    await this.sendDeleteRequest(token, clientRequestId, uri, KIXObjectType.TRANSLATION)
                        .catch((error: Error) => {
                            LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
                            throw new Error(error.Code, error.Message);
                        });
                }

            } else if (this.hasValue(param[1])) {
                const createParameter: Array<[string, any]> = [
                    [TranslationLanguageProperty.LANGUAGE, param[0]],
                    [TranslationLanguageProperty.VALUE, param[1].trim()]
                ];

                const uri = this.buildUri('system', 'i18n', 'translations', translationId, 'languages');

                await super.executeUpdateOrCreateRequest(
                    token, clientRequestId, createParameter, uri, KIXObjectType.TRANSLATION_LANGUAGE,
                    'TranslationLanguageID', true
                ).catch((error: Error) => {
                    LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
                    throw new Error(error.Code, error.Message);
                });

            }
        }
    }

    private hasValue(value: string): boolean {
        return typeof value !== 'undefined' && value !== null && value.trim() !== '';
    }

    public async getTranslations(token: string, loadingOptions?: KIXObjectLoadingOptions): Promise<Translation[]> {
        const uri = this.buildUri('system', 'i18n', 'translations');

        if (!loadingOptions) {
            loadingOptions = new KIXObjectLoadingOptions(
                null, null, 'Translation.' + TranslationProperty.PATTERN,
                null, [TranslationProperty.LANGUAGES]
            );
        }

        const translations = await super.load<Translation>(
            token, KIXObjectType.TRANSLATION, uri, loadingOptions, null, 'Translation'
        );
        return translations;
    }

    private async getLanguages(
        token: string, objectIds: Array<string | number>, loadingOptions: TranslationLanguageLoadingOptions
    ): Promise<TranslationLanguage[]> {
        let languages: TranslationLanguage[] = [];
        if (loadingOptions) {
            const translations = await this.getTranslations(token);
            const translation = translations.find((t) => t.ID === loadingOptions.translationId);
            if (translation) {
                if (objectIds && objectIds.length) {
                    languages = translation.Languages.filter(
                        (l) => objectIds.some((oid) => oid.toString() === l.Language.toString())
                    );
                } else {
                    languages = translation.Languages;
                }
            }
        } else {
            throw new Error('getLanguages', 'No loading options given (translationId).');
        }

        return languages;
    }

    public async getPODefinitions(): Promise<PODefinition[]> {
        const localeFolder = './locale';
        const fs = require('fs');

        const poDefinitions: PODefinition[] = [];

        const files: string[] = fs.readdirSync(localeFolder);
        if (files) {
            files
                .filter((f) => f.endsWith('.po'))
                .forEach((file: string) => {
                    const content = fs.readFileSync(`${localeFolder}/${file}`, 'utf8');
                    const base64 = new Buffer(content).toString('base64');
                    poDefinitions.push(new PODefinition(base64, file.replace('.po', '')));
                });
        }

        return poDefinitions;
    }

}

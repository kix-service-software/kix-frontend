import {
    KIXObjectType, KIXObjectLoadingOptions, KIXObjectSpecificLoadingOptions,
    KIXObjectSpecificCreateOptions, Error
} from '../../../model';

import { KIXObjectService } from './KIXObjectService';
import { KIXObjectServiceRegistry } from '../../KIXObjectServiceRegistry';
import { LoggingService } from '../LoggingService';
import {
    TranslationPattern, TranslationLanguageLoadingOptions, TranslationLanguage, TranslationPatternProperty,
    TranslationLanguageProperty, PODefinition
} from '../../../model/kix/i18n';
import { Translation } from '../../../model/kix/i18n/Translation';

export class TranslationService extends KIXObjectService {

    private static INSTANCE: TranslationService;

    public static getInstance(): TranslationService {
        if (!TranslationService.INSTANCE) {
            TranslationService.INSTANCE = new TranslationService();
        }
        return TranslationService.INSTANCE;
    }

    protected RESOURCE_URI: string = this.buildUri('i18n', 'translations');

    public objectType: KIXObjectType = KIXObjectType.TRANSLATION;

    private constructor() {
        super();
        KIXObjectServiceRegistry.registerServiceInstance(this);
    }

    public isServiceFor(kixObjectType: KIXObjectType): boolean {
        return kixObjectType === KIXObjectType.TRANSLATION_PATTERN || kixObjectType === KIXObjectType.TRANSLATION;
    }

    public async loadObjects<T>(
        token: string, clientRequestId: string, objectType: KIXObjectType, objectIds: Array<number | string>,
        loadingOptions: KIXObjectLoadingOptions, objectLoadingOptions: KIXObjectSpecificLoadingOptions
    ): Promise<T[]> {

        let objects = [];
        if (objectType === KIXObjectType.TRANSLATION_PATTERN) {
            const uri = this.buildUri('system', this.RESOURCE_URI);
            objects = await super.load<TranslationPattern>(
                token, objectType, uri, loadingOptions, objectIds, 'TranslationPattern'
            );
        } else if (objectType === KIXObjectType.TRANSLATION) {
            objects = await super.load<Translation>(
                token, objectType, this.RESOURCE_URI, loadingOptions, objectIds, 'Translation'
            );
        }

        return objects;
    }

    public async createObject(
        token: string, clientRequestId: string, objectType: KIXObjectType, parameter: Array<[string, any]>,
        createOptions?: KIXObjectSpecificCreateOptions
    ): Promise<number> {
        if (objectType === KIXObjectType.TRANSLATION_PATTERN) {
            const pattern = parameter.find((p) => p[0] === TranslationPatternProperty.VALUE);

            const createParameter: Array<[string, any]> = [pattern];

            const languages: TranslationLanguage[] = [];
            const languageParameter = parameter.filter((p) => p[0] !== TranslationPatternProperty.VALUE);
            languageParameter.forEach((lp) => {
                if (typeof lp[1] !== 'undefined' && lp[1] !== null && lp[1] !== '') {
                    const translationLanguage = new TranslationLanguage();
                    translationLanguage.Language = lp[0];
                    translationLanguage.Value = lp[1];
                    languages.push(translationLanguage);
                }
            });

            if (languages.length > 0) {
                createParameter.push([TranslationPatternProperty.LANGUAGES, languages]);
            }

            const uri = this.buildUri('system', this.RESOURCE_URI);
            const id = await super.executeUpdateOrCreateRequest(
                token, clientRequestId, createParameter, uri, KIXObjectType.TRANSLATION_PATTERN,
                'PatternID', true
            ).catch((error: Error) => {
                LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
                throw new Error(error.Code, error.Message);
            });

            return id;
        }

        throw new Error('0', 'Unsupported object type ' + objectType);
    }

    public async updateObject(
        token: string, clientRequestId: string, objectType: KIXObjectType,
        parameter: Array<[string, any]>, objectId: number | string
    ): Promise<string | number> {
        if (objectType === KIXObjectType.TRANSLATION_PATTERN) {
            const pattern = parameter.find((p) => p[0] === TranslationPatternProperty.VALUE);

            const uri = this.buildUri('system', this.RESOURCE_URI, objectId);
            const id = await super.executeUpdateOrCreateRequest(
                token, clientRequestId, [pattern], uri, KIXObjectType.TRANSLATION_PATTERN, 'PatternID'
            );

            const loadingOptions = new KIXObjectLoadingOptions(
                null, null, null, null, [TranslationPatternProperty.LANGUAGES]
            );
            const translations = await super.load<TranslationPattern>(
                token, KIXObjectType.TRANSLATION_PATTERN, uri, loadingOptions, null, 'TranslationPattern'
            );
            if (translations && translations.length) {
                const languageParameter = parameter.filter((p) => p[0] !== TranslationPatternProperty.VALUE);
                await this.createOrUpdateLanguages(
                    token, clientRequestId, translations[0].ID, translations[0].Languages, languageParameter
                );
            }
            return id;
        }

        throw new Error('0', 'Unsupported object type ' + objectType);
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

                    const uri = this.buildUri('system', this.RESOURCE_URI, translationId, 'languages', param[0]);
                    await super.executeUpdateOrCreateRequest(
                        token, clientRequestId, translationParameter, uri,
                        KIXObjectType.TRANSLATION_LANGUAGE, 'TranslationLanguageID'
                    );
                } else {
                    const uri = this.buildUri('system', this.RESOURCE_URI, translationId, 'languages', param[0]);
                    await this.sendDeleteRequest(token, clientRequestId, uri, KIXObjectType.TRANSLATION_PATTERN)
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

                const uri = this.buildUri('system', this.RESOURCE_URI, translationId, 'languages');

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

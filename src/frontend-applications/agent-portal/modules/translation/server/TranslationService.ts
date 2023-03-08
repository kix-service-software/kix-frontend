/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectAPIService } from '../../../server/services/KIXObjectAPIService';
import { KIXObjectType } from '../../../model/kix/KIXObjectType';
import { KIXObjectServiceRegistry } from '../../../server/services/KIXObjectServiceRegistry';
import { KIXObjectLoadingOptions } from '../../../model/KIXObjectLoadingOptions';
import { KIXObjectSpecificLoadingOptions } from '../../../model/KIXObjectSpecificLoadingOptions';
import { TranslationPattern } from '../model/TranslationPattern';
import { Translation } from '../model/Translation';
import { KIXObjectSpecificCreateOptions } from '../../../model/KIXObjectSpecificCreateOptions';
import { TranslationPatternProperty } from '../model/TranslationPatternProperty';
import { TranslationLanguage } from '../model/TranslationLanguage';
import { LoggingService } from '../../../../../server/services/LoggingService';
import { TranslationLanguageProperty } from '../model/TranslationLanguageProperty';
import { PODefinition } from '../../../server/model/PODefinition';
import { ConfigurationService } from '../../../../../server/services/ConfigurationService';
import { IdService } from '../../../model/IdService';
import { Error } from '../../../../../server/model/Error';
import { UserService } from '../../user/server/UserService';
import { PluginService } from '../../../../../server/services/PluginService';
import { AgentPortalExtensions } from '../../../server/extensions/AgentPortalExtensions';
import { ILocaleExtension } from '../../../model/ILocaleExtension';

export class TranslationAPIService extends KIXObjectAPIService {

    protected RESOURCE_URI: string = this.buildUri('i18n', 'translations');

    private static INSTANCE: TranslationAPIService;

    public static getInstance(): TranslationAPIService {
        if (!TranslationAPIService.INSTANCE) {
            TranslationAPIService.INSTANCE = new TranslationAPIService();
        }
        return TranslationAPIService.INSTANCE;
    }

    public objectType: KIXObjectType | string = KIXObjectType.TRANSLATION;

    private constructor() {
        super();
        KIXObjectServiceRegistry.registerServiceInstance(this);
    }

    public isServiceFor(kixObjectType: KIXObjectType | string): boolean {
        return kixObjectType === KIXObjectType.TRANSLATION_PATTERN || kixObjectType === KIXObjectType.TRANSLATION;
    }

    public async loadObjects<T>(
        token: string, clientRequestId: string, objectType: KIXObjectType | string, objectIds: Array<number | string>,
        loadingOptions: KIXObjectLoadingOptions, objectLoadingOptions: KIXObjectSpecificLoadingOptions
    ): Promise<T[]> {

        let objects = [];
        if (objectType === KIXObjectType.TRANSLATION_PATTERN) {
            const uri = this.buildUri('system', this.RESOURCE_URI);
            objects = await super.load<TranslationPattern>(
                token, objectType, uri, loadingOptions, objectIds, 'TranslationPattern',
                clientRequestId, TranslationPattern
            );
        } else if (objectType === KIXObjectType.TRANSLATION) {
            objects = await super.load<Translation>(
                token, objectType, this.RESOURCE_URI, loadingOptions, objectIds, 'Translation',
                clientRequestId, Translation
            );
        }

        return objects;
    }

    public async createObject(
        token: string, clientRequestId: string, objectType: KIXObjectType | string, parameter: Array<[string, any]>,
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
        token: string, clientRequestId: string, objectType: KIXObjectType | string,
        parameter: Array<[string, any]>, objectId: number | string
    ): Promise<string | number> {
        if (objectType === KIXObjectType.TRANSLATION_PATTERN) {
            const pattern = parameter.find((p) => p[0] === TranslationPatternProperty.VALUE);

            const uri = this.buildUri('system', this.RESOURCE_URI, objectId);
            const id = await super.executeUpdateOrCreateRequest(
                token, clientRequestId, [pattern], uri, KIXObjectType.TRANSLATION_PATTERN, 'PatternID'
            );

            const loadingOptions = new KIXObjectLoadingOptions(
                null, null, null, [TranslationPatternProperty.LANGUAGES]
            );
            const translations = await super.load<TranslationPattern>(
                token, KIXObjectType.TRANSLATION_PATTERN, uri, loadingOptions, null, 'TranslationPattern',
                clientRequestId, TranslationPattern
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
                    await this.sendDeleteRequest(token, clientRequestId, [uri], KIXObjectType.TRANSLATION_PATTERN)
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

        let poDefinitions: PODefinition[] = [];

        const files: string[] = fs.readdirSync(localeFolder);
        if (files) {
            files
                .filter((f) => f.endsWith('.po'))
                .forEach((file: string) => {
                    const content = fs.readFileSync(`${localeFolder}/${file}`, 'utf8');
                    const base64 = Buffer.from(content, 'utf8').toString('base64');
                    poDefinitions.push(new PODefinition(base64, file.replace('.po', '')));
                });
        }

        const localeExtensions = await PluginService.getInstance().getExtensions<ILocaleExtension>(
            AgentPortalExtensions.LOCALE_EXTENSION
        );

        for (const extension of localeExtensions) {
            const definitions = await extension.getPODefinitions();
            poDefinitions = [
                ...poDefinitions,
                ...definitions
            ];
        }

        return poDefinitions;
    }

    // copied from TranslationService (browser), but with small modifiactions
    private prepareValue(pattern: string = ''): string {
        if (pattern && pattern.startsWith('Translatable' + '#')) {
            pattern = pattern.replace('Translatable' + '#', '');
        }
        return pattern;
    }
    public async translate(
        pattern: string = '', placeholderValues: Array<string | number> = [],
        language: string = 'en', // language?: string,
        getOnlyPattern: boolean = false
    ): Promise<string> {
        let translationValue = pattern;
        if (translationValue !== null) {

            translationValue = this.prepareValue(translationValue);

            if (!getOnlyPattern) {
                const config = ConfigurationService.getInstance().getServerConfiguration();
                if (config && config.BACKEND_API_TOKEN) {
                    // const translations = await KIXObjectService.loadObjects<Translation>(KIXObjectType.TRANSLATION);
                    const translations = await TranslationAPIService.getInstance().loadObjects<Translation>(
                        config.BACKEND_API_TOKEN, IdService.generateDateBasedId('translation-service-'),
                        KIXObjectType.TRANSLATION, null, null, null
                    ).catch(() => [] as Translation[]);
                    const translation = translations.find((t) => t.Pattern === translationValue);

                    if (translation) {
                        // language = language ? language : await this.getUserLanguage();
                        if (language) {
                            const translationLanguageValue = translation.Languages[language];
                            if (translationLanguageValue) {
                                translationValue = translationLanguageValue;
                            }
                        }
                    }

                    translationValue = this.format(translationValue, placeholderValues.map(
                        (p) => (typeof p !== 'undefined' && p !== null ? p : '').toString()
                    ));
                }
            }
        }

        return translationValue;
    }
    private format(format: string, args: string[]): string {
        return format.replace(/{(\d+)}/g, (match, number) => {
            return args && typeof args[number] !== 'undefined'
                ? args[number]
                : '';
        });
    }

    public static async getUserLanguage(token: string): Promise<string> {
        const currentUser = await UserService.getInstance().getUserByToken(token);
        let language = 'en';
        if (currentUser) {
            const preference = currentUser.Preferences.find((p) => p.ID === 'UserLanguage');
            language = preference ? preference.Value : null;
        }
        return language;
    }
}

import { KIXObjectService } from "../kix/KIXObjectService";
import {
    Translation, KIXObjectType, SysConfigOption, SysConfigKey,
    TranslationPattern, TableFilterCriteria, TranslationPatternProperty
} from "../../model";
import { SearchOperator } from "../SearchOperator";
import { ClientStorageService } from "../ClientStorageService";
import { AgentService } from "../application/AgentService";

export class TranslationService extends KIXObjectService<TranslationPattern> {

    private static INSTANCE: TranslationService = null;

    public static getInstance(): TranslationService {
        if (!TranslationService.INSTANCE) {
            TranslationService.INSTANCE = new TranslationService();
        }

        return TranslationService.INSTANCE;
    }

    public isServiceFor(kixObjectType: KIXObjectType) {
        return kixObjectType === KIXObjectType.TRANSLATION_PATTERN || kixObjectType === KIXObjectType.TRANSLATION;
    }

    public getLinkObjectName(): string {
        return 'Translation';
    }

    public async getLanguageName(lang: string): Promise<string> {
        const languagesConfig = await KIXObjectService.loadObjects<SysConfigOption>(
            KIXObjectType.SYS_CONFIG_OPTION, [SysConfigKey.DEFAULT_USED_LANGUAGES]
        );

        if (languagesConfig && languagesConfig.length && languagesConfig[0].Value[lang]) {
            return languagesConfig[0].Value[lang];
        }

        return lang;
    }

    public async getLanguages(): Promise<Array<[string, string]>> {
        const languagesConfig = await KIXObjectService.loadObjects<SysConfigOption>(
            KIXObjectType.SYS_CONFIG_OPTION, [SysConfigKey.DEFAULT_USED_LANGUAGES]
        );

        const languages: Array<[string, string]> = [];
        if (languagesConfig && languagesConfig.length) {
            for (const lang in languagesConfig[0].Value) {
                if (languagesConfig[0].Value[lang]) {
                    languages.push([lang, languagesConfig[0].Value[lang]]);
                }
            }
        }
        return languages;
    }

    public static async getSystemDefaultLanguage(): Promise<string> {
        const defaultLanguageConfig = await KIXObjectService.loadObjects<SysConfigOption>(
            KIXObjectType.SYS_CONFIG_OPTION, [SysConfigKey.DEFAULT_LANGUAGE]
        );

        return defaultLanguageConfig && defaultLanguageConfig.length ? defaultLanguageConfig[0].Value : null;
    }

    public async checkFilterValue(translation: TranslationPattern, criteria: TableFilterCriteria): Promise<boolean> {
        if (translation) {
            switch (criteria.property) {
                case TranslationPatternProperty.LANGUAGES:
                    if (criteria.operator === SearchOperator.EQUALS) {
                        return translation.Languages.some((l) => l.Language === criteria.value);
                    } else if (criteria.operator === SearchOperator.NOT_EQUALS) {
                        return !translation.Languages.some((l) => l.Language === criteria.value);
                    }
                default:
            }
        }
        return true;
    }

    public static prepareValue(pattern: string = ''): string {
        if (pattern && pattern.startsWith('Translatable' + '#')) {
            pattern = pattern.replace('Translatable' + '#', '');
        }
        return pattern;
    }

    public static async translate(
        pattern: string = '', placeholderValues: Array<string | number> = [], language?: string,
        getOnlyPattern: boolean = false
    ): Promise<string> {
        let translationValue = pattern;
        if (translationValue !== null) {

            translationValue = this.prepareValue(translationValue);

            if (!getOnlyPattern) {

                const translations = await KIXObjectService.loadObjects<Translation>(KIXObjectType.TRANSLATION);
                const translation = translations.find((t) => t.Pattern === translationValue);

                if (translation) {
                    language = language ? language : await this.getUserLanguage();
                    if (language) {
                        const translationLanguageValue = translation.Languages[language];
                        if (translationLanguageValue) {
                            translationValue = translationLanguageValue;
                        }
                    }
                }

                translationValue = this.format(translationValue, placeholderValues.map((p) => (p ? p : '').toString()));
            }
        }
        const debug = ClientStorageService.getOption('i18n-debug');

        if (debug && debug !== 'false' && debug !== '0') {
            translationValue = 'TR-' + pattern;
        }

        return translationValue;
    }

    private static format(format: string, args: string[]): string {
        return format.replace(/{(\d+)}/g, (match, number) => {
            return args && typeof args[number] !== 'undefined'
                ? args[number]
                : '';
        });
    }

    public static async getUserLanguage(systemDefaultFallback: boolean = true): Promise<string> {
        let language: string;
        const currentUser = await AgentService.getInstance().getCurrentUser();
        if (currentUser) {
            const preference = currentUser.Preferences.find((p) => p.ID === 'UserLanguage');
            language = preference ? preference.Value : null;
        }

        if (!language && systemDefaultFallback) {
            language = await this.getSystemDefaultLanguage();
        }

        return language;
    }

    public static async createTranslationObject(patterns: string[]): Promise<any> {
        const translationObject = {};
        for (const pattern of patterns) {
            const text = await TranslationService.translate(pattern);
            translationObject[pattern] = text;
        }
        return translationObject;
    }

    public static async createTranslationArray(patterns: string[]): Promise<any> {
        const translatePromises = [];
        patterns.forEach(
            (p) => translatePromises.push(TranslationService.translate(p))
        );
        const translationList = await Promise.all<boolean>(translatePromises);

        return translationList;
    }

}

import { KIXObjectService } from "../kix/KIXObjectService";
import {
    Translation, KIXObjectType, SysConfigItem, SysConfigKey, TranslationProperty,
    TableFilterCriteria, KIXObjectLoadingOptions, KIXObject, KIXObjectSpecificLoadingOptions
} from "../../model";
import { SearchOperator } from "../SearchOperator";
import { ClientStorageService } from "../ClientStorageService";
import { AgentService } from "../application/AgentService";

export class TranslationService extends KIXObjectService<Translation> {

    private static INSTANCE: TranslationService = null;

    public static getInstance(): TranslationService {
        if (!TranslationService.INSTANCE) {
            TranslationService.INSTANCE = new TranslationService();
        }

        return TranslationService.INSTANCE;
    }

    public isServiceFor(kixObjectType: KIXObjectType) {
        return kixObjectType === KIXObjectType.TRANSLATION;
    }

    public getLinkObjectName(): string {
        return 'Translation';
    }

    public async init(): Promise<void> {
        await this.loadObjects(KIXObjectType.TRANSLATION, null);
    }

    public async loadObjects<O extends KIXObject>(
        objectType: KIXObjectType, objectIds: Array<string | number>,
        loadingOptions?: KIXObjectLoadingOptions, objectLoadingOptions?: KIXObjectSpecificLoadingOptions
    ): Promise<O[]> {
        let objects: O[];
        let superLoad = false;
        if (objectType === KIXObjectType.TRANSLATION) {
            objects = await super.loadObjects<O>(KIXObjectType.TRANSLATION, null, loadingOptions);
        } else {
            superLoad = true;
            objects = await super.loadObjects<O>(objectType, objectIds, loadingOptions, objectLoadingOptions);
        }

        if (objectIds && !superLoad) {
            objects = objects.filter((c) => objectIds.some((oid) => c.ObjectId === oid));
        }

        return objects;
    }

    public async getLanguageName(lang: string): Promise<string> {
        const languagesConfig = await KIXObjectService.loadObjects<SysConfigItem>(
            KIXObjectType.SYS_CONFIG_ITEM, [SysConfigKey.DEFAULT_USED_LANGUAGES]
        );

        if (languagesConfig && languagesConfig.length && languagesConfig[0].Data[lang]) {
            return languagesConfig[0].Data[lang];
        }

        return lang;
    }

    public async getLanguages(): Promise<Array<[string, string]>> {
        const languagesConfig = await KIXObjectService.loadObjects<SysConfigItem>(
            KIXObjectType.SYS_CONFIG_ITEM, [SysConfigKey.DEFAULT_USED_LANGUAGES]
        );

        const languages: Array<[string, string]> = [];
        if (languagesConfig && languagesConfig.length) {
            for (const lang in languagesConfig[0].Data) {
                if (languagesConfig[0].Data[lang]) {
                    languages.push([lang, languagesConfig[0].Data[lang]]);
                }
            }
        }
        return languages;
    }

    public static async getSystemDefaultLanguage(): Promise<string> {
        const defaultLanguageConfig = await KIXObjectService.loadObjects<SysConfigItem>(
            KIXObjectType.SYS_CONFIG_ITEM, [SysConfigKey.DEFAULT_LANGUAGE]
        );

        return defaultLanguageConfig && defaultLanguageConfig.length ? defaultLanguageConfig[0].Data : null;
    }

    public async checkFilterValue(translation: Translation, criteria: TableFilterCriteria): Promise<boolean> {
        if (translation) {
            switch (criteria.property) {
                case TranslationProperty.LANGUAGES:
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

    public static async translate(
        pattern: string = '', placeholderValues: Array<string | number> = []
    ): Promise<string> {
        let translationValue = pattern;
        if (translationValue !== null) {

            if (translationValue.startsWith('Translatable' + '#')) {
                translationValue = translationValue.replace('Translatable' + '#', '');
            }

            const loadingOptions = new KIXObjectLoadingOptions(
                null, null, null, null, [TranslationProperty.LANGUAGES]
            );

            const translations = await KIXObjectService.loadObjects<Translation>(
                KIXObjectType.TRANSLATION, null, loadingOptions
            );

            const translation = translations.find((t) => t.Pattern === translationValue);

            if (translation) {
                const language = await this.getUserLanguage();
                if (language) {
                    const translationLanguage = translation.Languages.find((l) => l.Language === language);
                    if (translationLanguage) {
                        translationValue = translationLanguage.Value;
                    }
                }
            }

            translationValue = this.format(translationValue, placeholderValues.map((p) => (p ? p : '').toString()));
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

}

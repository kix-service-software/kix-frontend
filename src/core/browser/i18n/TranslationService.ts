import { KIXObjectService } from "../kix/KIXObjectService";
import {
    Translation, KIXObjectType, KIXObject, KIXObjectLoadingOptions,
    KIXObjectSpecificLoadingOptions, KIXObjectCache, SysConfigItem, SysConfigKey,
    TranslationProperty, TableFilterCriteria
} from "../../model";
import { SearchOperator } from "../SearchOperator";
import { ClientStorageService } from "../ClientStorageService";
import { ObjectDataService } from "../ObjectDataService";
import { AgentService } from "../application";

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
        loadingOptions?: KIXObjectLoadingOptions, objectLoadingOptions?: KIXObjectSpecificLoadingOptions,
        cache: boolean = true
    ): Promise<O[]> {

        if (objectType === KIXObjectType.TRANSLATION) {
            if (!KIXObjectCache.hasObjectCache(objectType)) {
                const objects = await super.loadObjects(objectType, null, null, null, false);
                objects.forEach((q) => KIXObjectCache.addObject(objectType, q));
            }

            if (!objectIds) {
                return KIXObjectCache.getObjectCache(objectType);
            }
        }

        return await super.loadObjects<O>(objectType, objectIds, loadingOptions, objectLoadingOptions, cache);
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

    public checkFilterValue(translation: Translation, criteria: TableFilterCriteria): boolean {
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

        if (translationValue.startsWith('Translatable#')) {
            translationValue = translationValue.replace('Translatable#', '');
        }

        const debug = ClientStorageService.getOption('i18n-debug');

        const translation = KIXObjectCache.getObjectCache<Translation>(
            KIXObjectType.TRANSLATION
        ).find((t) => t.Pattern === translationValue);

        if (translation) {
            const language = await this.getUserLanguage();
            if (language) {
                const translationLanguage = translation.Languages.find((l) => l.Language === language);
                if (translationLanguage) {
                    translationValue = translationLanguage.Value;
                }
            }
        }

        translationValue = this.format(translationValue, placeholderValues.map((p) => p.toString()));

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

    private static async getUserLanguage(): Promise<string> {
        let language: string;
        const currentUser = await AgentService.getInstance().getCurrentUser();
        if (currentUser) {
            const preference = currentUser.Preferences.find((p) => p.ID === 'UserLanguage');
            language = preference ? preference.Value : null;
        }
        return language;
    }

}

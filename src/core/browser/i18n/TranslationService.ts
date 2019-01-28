import { KIXObjectService } from "../kix";
import {
    Translation, KIXObjectType, KIXObject, KIXObjectLoadingOptions,
    KIXObjectSpecificLoadingOptions, KIXObjectCache, SysConfigItem, SysConfigKey,
    TranslationProperty, TableFilterCriteria
} from "../../model";
import { SearchOperator } from "../SearchOperator";

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
        this.loadObjects(KIXObjectType.TRANSLATION, null);
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

}

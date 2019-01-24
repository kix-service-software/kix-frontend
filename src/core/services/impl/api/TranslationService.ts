import {
    KIXObjectType, KIXObjectLoadingOptions, KIXObjectSpecificLoadingOptions,
    KIXObjectSpecificCreateOptions, KIXObjectCache, Error, SortUtil, DataType, SortOrder
} from '../../../model';

import { KIXObjectService } from './KIXObjectService';
import { KIXObjectServiceRegistry } from '../../KIXObjectServiceRegistry';
import { ConfigurationService } from '../ConfigurationService';
import { LoggingService } from '../LoggingService';
import {
    CreateTranslation, CreateTranslationResponse, CreateTranslationRequest, UpdateTranslation,
    UpdateTranslationResponse, UpdateTranslationRequest, TranslationsResponse
} from '../../../api';
import {
    TranslationCacheHandler, Translation, TranslationLanguageLoadingOptions,
    TranslationLanguage, TranslationLanguageProperty, TranslationProperty
} from '../../../model/kix/i18n';

export class TranslationService extends KIXObjectService {

    private static INSTANCE: TranslationService;

    public static getInstance(): TranslationService {
        if (!TranslationService.INSTANCE) {
            TranslationService.INSTANCE = new TranslationService();
        }
        return TranslationService.INSTANCE;
    }

    protected RESOURCE_URI: string = 'i18n/translations';

    public kixObjectType: KIXObjectType = KIXObjectType.TRANSLATION;

    private constructor() {
        super();
        KIXObjectServiceRegistry.registerServiceInstance(this);
    }

    public isServiceFor(kixObjectType: KIXObjectType): boolean {
        return kixObjectType === KIXObjectType.TRANSLATION;
    }

    public async initCache(): Promise<void> {
        const serverConfig = ConfigurationService.getInstance().getServerConfiguration();
        const token = serverConfig.BACKEND_API_TOKEN;

        KIXObjectCache.registerCacheHandler(new TranslationCacheHandler());

        await this.getTranslations(token);
    }

    public async loadObjects<T>(
        token: string, objectType: KIXObjectType, objectIds: Array<number | string>,
        loadingOptions: KIXObjectLoadingOptions, objectLoadingOptions: KIXObjectSpecificLoadingOptions
    ): Promise<T[]> {

        let objects = [];
        if (objectType === KIXObjectType.TRANSLATION) {
            const translations = await this.getTranslations(token);
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
        token: string, objectType: KIXObjectType, parameter: Array<[string, any]>,
        createOptions?: KIXObjectSpecificCreateOptions
    ): Promise<number> {
        const createTranslation = new CreateTranslation(parameter);

        const response = await this.sendCreateRequest<CreateTranslationResponse, CreateTranslationRequest>(
            token, this.RESOURCE_URI, new CreateTranslationRequest(createTranslation)
        ).catch((error: Error) => {
            LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
            throw new Error(error.Code, error.Message);
        });

        return response.TranslationID;
    }

    public async updateObject(
        token: string, objectType: KIXObjectType, parameter: Array<[string, any]>, objectId: number | string
    ): Promise<string | number> {
        const updateTranslation = new UpdateTranslation(parameter);

        const response = await this.sendUpdateRequest<UpdateTranslationResponse, UpdateTranslationRequest>(
            token, this.buildUri(this.RESOURCE_URI, objectId), new UpdateTranslationRequest(updateTranslation)
        ).catch((error: Error) => {
            LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
            throw new Error(error.Code, error.Message);
        });

        return response.TranslationID;
    }

    public async getTranslations(token: string): Promise<Translation[]> {
        if (!KIXObjectCache.hasObjectCache(KIXObjectType.TRANSLATION)) {
            const uri = this.buildUri(this.RESOURCE_URI);

            const loadingOptions = new KIXObjectLoadingOptions(
                null, null, null, null, null, [TranslationProperty.LANGUAGES]
            );
            const query = this.prepareQuery(loadingOptions);

            const response = await this.getObjectByUri<TranslationsResponse>(token, uri, query);
            response.Translation
                .map((t) => new Translation(t))
                .forEach((t) => KIXObjectCache.addObject(KIXObjectType.TRANSLATION, t));
        }
        return KIXObjectCache.getObjectCache(KIXObjectType.TRANSLATION);
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

}

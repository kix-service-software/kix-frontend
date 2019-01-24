import { KIXObjectService } from "./KIXObjectService";
import {
    KIXObjectType, KIXObjectLoadingOptions, KIXObjectSpecificLoadingOptions,
    KIXObjectSpecificCreateOptions, ConfigItemClass, ConfigItemClassFactory,
    FilterCriteria, ConfigItemClassProperty, FilterType, FilterDataType,
    ConfigItemProperty, ConfigItem, ConfigItemFactory, ImagesLoadingOptions,
    ConfigItemImage, ConfigItemImageFactory, ConfigItemAttachment, CreateConfigItemVersionOptions, Error
} from "../../../model";
import {
    ConfigItemClassesResponse, ConfigItemClassResponse, CreateConfigItem,
    CreateConfigItemResponse, CreateConfigItemRequest, ConfigItemResponse,
    ConfigItemsResponse, ConfigItemImagesResponse, ConfigItemImageResponse,
    ConfigItemAttachmentResponse, ConfigItemAttachmentsResponse,
    CreateConfigItemVersionResponse, CreateConfigItemVersionRequest, CreateConfigItemVersion
} from "../../../api";
import { KIXObjectServiceRegistry } from "../../KIXObjectServiceRegistry";
import { SearchOperator } from "../../../browser";
import { LoggingService } from "../LoggingService";

export class CMDBService extends KIXObjectService {

    private static INSTANCE: CMDBService;

    public static getInstance(): CMDBService {
        if (!CMDBService.INSTANCE) {
            CMDBService.INSTANCE = new CMDBService();
        }
        return CMDBService.INSTANCE;
    }

    protected RESOURCE_URI: string = 'cmdb';
    protected SUB_RESOURCE_URI: string = 'versions';

    private constructor() {
        super();
        KIXObjectServiceRegistry.registerServiceInstance(this);
    }

    public isServiceFor(kixObjectType: KIXObjectType): boolean {
        return kixObjectType === KIXObjectType.CONFIG_ITEM
            || kixObjectType === KIXObjectType.CONFIG_ITEM_VERSION
            || kixObjectType === KIXObjectType.CONFIG_ITEM_IMAGE
            || kixObjectType === KIXObjectType.CONFIG_ITEM_ATTACHMENT;
    }

    public async loadObjects<T>(
        token: string, objectType: KIXObjectType, objectIds: Array<number | string>,
        loadingOptions: KIXObjectLoadingOptions, objectLoadingOptions: KIXObjectSpecificLoadingOptions
    ): Promise<T[]> {
        let objects = [];

        switch (objectType) {
            case KIXObjectType.CONFIG_ITEM:
                objects = await this.getConfigItems(token, objectIds, loadingOptions);
                break;
            case KIXObjectType.CONFIG_ITEM_IMAGE:
                objects = await this.getImages(
                    token, objectIds, loadingOptions,
                    objectLoadingOptions as ImagesLoadingOptions
                );
                break;
            case KIXObjectType.CONFIG_ITEM_ATTACHMENT:
                objects = await this.getAttachments(token, objectIds, loadingOptions);
                break;
            default:
        }
        return objects;
    }

    private async getConfigItems(
        token: string, configItemIds: Array<number | string>, loadingOptions: KIXObjectLoadingOptions
    ): Promise<ConfigItem[]> {
        const subResource = 'configitems';

        loadingOptions = loadingOptions || new KIXObjectLoadingOptions();
        if (loadingOptions.includes && !!loadingOptions.includes.length) {
            if (!loadingOptions.includes.some((i) => i === ConfigItemProperty.CURRENT_VERSION)) {
                loadingOptions.includes = [...loadingOptions.includes, ConfigItemProperty.CURRENT_VERSION];
            }
        } else {
            loadingOptions.includes = [ConfigItemProperty.CURRENT_VERSION];
        }

        const query = this.prepareQuery(loadingOptions);

        let configItems: ConfigItem[] = [];

        if (configItemIds && configItemIds.length) {
            configItemIds = configItemIds.filter(
                (id) => typeof id !== 'undefined' && id.toString() !== '' && id !== null
            );

            const uri = this.buildUri(this.RESOURCE_URI, subResource, configItemIds.join(','));
            const response = await this.getObjectByUri<ConfigItemResponse | ConfigItemsResponse>(
                token, uri, query
            );

            if (configItemIds.length === 1) {
                configItems = [(response as ConfigItemResponse).ConfigItem];
            } else {
                configItems = (response as ConfigItemsResponse).ConfigItem;
            }

        } else if (loadingOptions.filter) {
            await this.buildFilter(loadingOptions.filter, 'ConfigItem', token, query);
            const uri = this.buildUri(this.RESOURCE_URI, subResource);
            const response = await this.getObjectByUri<ConfigItemsResponse>(token, uri, query);
            configItems = response.ConfigItem;
        } else {
            const uri = this.buildUri(this.RESOURCE_URI, subResource);
            const response = await this.getObjectByUri<ConfigItemsResponse>(token, uri, query);
            configItems = response.ConfigItem;
        }

        return configItems.map((ci) => ConfigItemFactory.create(ci));
    }

    private async getImages(
        token: string, imageIds: Array<number | string>,
        loadingOptions: KIXObjectLoadingOptions, objectLoadingOptions: ImagesLoadingOptions
    ): Promise<ConfigItemImage[]> {
        if (objectLoadingOptions.configItemId) {
            const subResource = 'configitems/' + objectLoadingOptions.configItemId + '/images';

            loadingOptions = loadingOptions || new KIXObjectLoadingOptions();
            if (
                loadingOptions.includes
                && !!loadingOptions.includes.length
                && !loadingOptions.includes.some((i) => i === 'Content')
            ) {
                loadingOptions.includes = [...loadingOptions.includes, 'Content'];
            } else {
                loadingOptions.includes = ['Content'];
            }
            const query = this.prepareQuery(loadingOptions);

            let images: ConfigItemImage[] = [];

            if (imageIds && imageIds.length) {
                imageIds = imageIds.filter(
                    (id) => typeof id !== 'undefined' && id.toString() !== '' && id !== null
                );

                const uri = this.buildUri(this.RESOURCE_URI, subResource, imageIds.join(','));
                const response = await this.getObjectByUri<ConfigItemImageResponse | ConfigItemImagesResponse>(
                    token, uri, query
                );

                if (imageIds.length === 1) {
                    images = [(response as ConfigItemImageResponse).Image];
                } else {
                    images = (response as ConfigItemImagesResponse).Image;
                }

            } else if (loadingOptions.filter) {
                await this.buildFilter(loadingOptions.filter, 'Image', token, query);
                const uri = this.buildUri(this.RESOURCE_URI, subResource);
                const response = await this.getObjectByUri<ConfigItemImagesResponse>(token, uri, query);
                images = response.Image;
            } else {
                const uri = this.buildUri(this.RESOURCE_URI, subResource);
                const response = await this.getObjectByUri<ConfigItemImagesResponse>(token, uri, query);
                images = response.Image;
            }

            return images.map((cii) => ConfigItemImageFactory.create(cii));
        } else {
            throw new Error('', 'No config item id given!');
        }
    }


    private async getAttachments(
        token: string, attachmentIds: Array<number | string>, loadingOptions: KIXObjectLoadingOptions
    ): Promise<ConfigItemAttachment[]> {
        const subResource = 'configitems/attachments';

        loadingOptions = loadingOptions || new KIXObjectLoadingOptions();

        const query = this.prepareQuery(loadingOptions);

        let attachments: ConfigItemAttachment[] = [];

        if (attachmentIds && attachmentIds.length) {
            attachmentIds = attachmentIds.filter(
                (id) => typeof id !== 'undefined' && id.toString() !== '' && id !== null
            );

            const uri = this.buildUri(this.RESOURCE_URI, subResource, attachmentIds.join(','));
            const response = await this.getObjectByUri<ConfigItemAttachmentResponse | ConfigItemAttachmentsResponse>(
                token, uri, query
            );

            if (attachmentIds.length === 1) {
                attachments = [(response as ConfigItemAttachmentResponse).Attachment];
            } else {
                attachments = (response as ConfigItemAttachmentsResponse).Attachment;
            }
        }

        return attachments.map((a) => new ConfigItemAttachment(a));
    }

    public async createObject(
        token: string, objectType: KIXObjectType, parameter: Array<[string, string]>,
        createOptions: KIXObjectSpecificCreateOptions
    ): Promise<string | number> {
        if (objectType === KIXObjectType.CONFIG_ITEM_VERSION) {
            const options = createOptions as CreateConfigItemVersionOptions;
            const createConfigItemVersion = new CreateConfigItemVersion(parameter);
            const uri = this.buildUri(this.RESOURCE_URI, 'configitems', options.configItemId, this.SUB_RESOURCE_URI);
            const response
                = await this.sendCreateRequest<CreateConfigItemVersionResponse, CreateConfigItemVersionRequest>(
                    token, uri, new CreateConfigItemVersionRequest(createConfigItemVersion)
                );
            return response.VersionID;
        } else {
            const createConfigItem = new CreateConfigItem(parameter.filter((p) => p[0] !== ConfigItemProperty.LINKS));
            const uri = this.buildUri(this.RESOURCE_URI, 'configitems');
            const response = await this.sendCreateRequest<CreateConfigItemResponse, CreateConfigItemRequest>(
                token, uri, new CreateConfigItemRequest(createConfigItem)
            ).catch((error: Error) => {
                LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
                throw new Error(error.Code, error.Message);
            });

            const configItemId = response.ConfigItemID;

            await this.createLinks(
                token, Number(configItemId),
                this.getParameterValue(parameter, ConfigItemProperty.LINKS)
            );

            return configItemId;
        }
    }

    public async updateObject(
        token: string, objectType: KIXObjectType, parameter: Array<[string, any]>, objectId: number | string
    ): Promise<string | number> {
        throw new Error('', "Method not implemented.");
    }
}

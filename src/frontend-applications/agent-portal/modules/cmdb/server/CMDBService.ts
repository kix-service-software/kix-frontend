/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectAPIService } from '../../../server/services/KIXObjectAPIService';
import { KIXObjectType } from '../../../model/kix/KIXObjectType';
import { KIXObjectServiceRegistry } from '../../../server/services/KIXObjectServiceRegistry';
import { GeneralCatalogItem } from '../../general-catalog/model/GeneralCatalogItem';
import { KIXObjectLoadingOptions } from '../../../model/KIXObjectLoadingOptions';
import { FilterCriteria } from '../../../model/FilterCriteria';
import { SearchOperator } from '../../search/model/SearchOperator';
import { FilterDataType } from '../../../model/FilterDataType';
import { FilterType } from '../../../model/FilterType';
import { KIXObjectSpecificLoadingOptions } from '../../../model/KIXObjectSpecificLoadingOptions';
import { ConfigItemProperty } from '../model/ConfigItemProperty';
import { ConfigItemVersionLoadingOptions } from '../model/ConfigItemVersionLoadingOptions';
import { ImagesLoadingOptions } from '../model/ImagesLoadingOptions';
import { ConfigItem } from '../model/ConfigItem';
import { ConfigItemResponse } from './api/ConfigItemResponse';
import { ConfigItemsResponse } from './api/ConfigItemsResponse';
import { ConfigItemImage } from '../model/ConfigItemImage';
import { ConfigItemImageResponse } from './api/ConfigItemImageResponse';
import { ConfigItemImagesResponse } from './api/ConfigItemImagesResponse';
import { ConfigItemAttachment } from '../model/ConfigItemAttachment';
import { ConfigItemAttachmentResponse } from './api/ConfigItemAttachmentResponse';
import { ConfigItemAttachmentsResponse } from './api/ConfigItemAttachmentsResponse';
import { KIXObjectSpecificCreateOptions } from '../../../model/KIXObjectSpecificCreateOptions';
import { CreateConfigItemVersionOptions } from '../model/CreateConfigItemVersionOptions';
import { CreateConfigItemVersion } from './api/CreateConfigItemVersion';
import { CreateConfigItemVersionResponse } from './api/CreateConfigItemVersionResponse';
import { CreateConfigItemVersionRequest } from './api/CreateConfigItemVersionRequest';
import { CreateConfigItem } from './api/CreateConfigItem';
import { CreateConfigItemResponse } from './api/CreateConfigItemResponse';
import { CreateConfigItemRequest } from './api/CreateConfigItemRequest';
import { LoggingService } from '../../../../../server/services/LoggingService';
import { Error } from '../../../../../server/model/Error';
import { AttachmentLoadingOptions } from '../model/AttachmentLoadingOptions';
import { Version } from '../model/Version';
import { SearchProperty } from '../../search/model/SearchProperty';
import { GeneralCatalogItemProperty } from '../../general-catalog/model/GeneralCatalogItemProperty';
import { ConfigItemClass } from '../model/ConfigItemClass';
import { KIXObjectProperty } from '../../../model/kix/KIXObjectProperty';
import { ObjectResponse } from '../../../server/services/ObjectResponse';
import { HTTPResponse } from '../../../server/services/HTTPResponse';
import { GeneralCatalogService } from '../../general-catalog/server/GeneralCatalogService';
import { FileService } from '../../file/server/FileService';
import { Attachment } from '../../../model/kix/Attachment';
import { UserService } from '../../user/server/UserService';


export class CMDBAPIService extends KIXObjectAPIService {

    protected RESOURCE_URI: string = 'cmdb';

    protected objectType: KIXObjectType = KIXObjectType.CONFIG_ITEM;

    private static INSTANCE: CMDBAPIService;

    public static getInstance(): CMDBAPIService {
        if (!CMDBAPIService.INSTANCE) {
            CMDBAPIService.INSTANCE = new CMDBAPIService();
        }
        return CMDBAPIService.INSTANCE;
    }

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

    public async getDeploymentStates(token: string): Promise<GeneralCatalogItem[]> {
        const loadingOptions = new KIXObjectLoadingOptions([
            new FilterCriteria('Class', SearchOperator.EQUALS, FilterDataType.STRING,
                FilterType.AND, 'ITSM::ConfigItem::DeploymentState'),
            new FilterCriteria(`${GeneralCatalogItemProperty.PREFERENCES}.Name`, SearchOperator.EQUALS, FilterDataType.STRING,
                FilterType.AND, 'Functionality'),
            new FilterCriteria(`${GeneralCatalogItemProperty.PREFERENCES}.Value`, SearchOperator.NOT_EQUALS, FilterDataType.STRING,
                FilterType.AND, 'postproductive')
        ], undefined, undefined, [GeneralCatalogItemProperty.PREFERENCES]);

        const objectResponse = await GeneralCatalogService.getInstance().loadObjects<GeneralCatalogItem>(
            token, null, KIXObjectType.GENERAL_CATALOG_ITEM, null, loadingOptions, null
        );

        return objectResponse.objects || [];
    }

    public async loadObjects<T>(
        token: string, clientRequestId: string, objectType: KIXObjectType, objectIds: Array<number | string>,
        loadingOptions: KIXObjectLoadingOptions, objectLoadingOptions: KIXObjectSpecificLoadingOptions
    ): Promise<ObjectResponse<T>> {
        let objectResponse = new ObjectResponse();

        switch (objectType) {
            case KIXObjectType.CONFIG_ITEM:
                objectResponse = await this.getConfigItems(token, objectIds, loadingOptions, clientRequestId);
                break;
            case KIXObjectType.CONFIG_ITEM_VERSION:
                if (objectLoadingOptions) {
                    const uri = this.buildUri(
                        this.RESOURCE_URI,
                        'configitems',
                        (objectLoadingOptions as ConfigItemVersionLoadingOptions).configItemId,
                        'versions'
                    );
                    objectResponse = await super.load(
                        token, KIXObjectType.CONFIG_ITEM_VERSION, uri, loadingOptions, objectIds, 'ConfigItemVersion',
                        clientRequestId, Version
                    );
                }
                break;
            case KIXObjectType.CONFIG_ITEM_IMAGE:
                const images = await this.getImages(
                    token, objectIds, loadingOptions,
                    objectLoadingOptions as ImagesLoadingOptions,
                    clientRequestId
                );
                objectResponse = new ObjectResponse(images, images.length);
                break;
            case KIXObjectType.CONFIG_ITEM_ATTACHMENT:
                const attachments = await this.getAttachments(
                    token, objectIds, loadingOptions,
                    objectLoadingOptions as AttachmentLoadingOptions
                );
                objectResponse = new ObjectResponse(attachments, attachments.length);
                break;
            default:
        }
        return objectResponse as ObjectResponse<T>;
    }

    private async getConfigItems(
        token: string, configItemIds: Array<number | string>, loadingOptions: KIXObjectLoadingOptions,
        clientRequestId: string
    ): Promise<ObjectResponse<ConfigItem>> {
        loadingOptions = loadingOptions || new KIXObjectLoadingOptions();

        const query = await this.prepareQuery(loadingOptions, KIXObjectType.CONFIG_ITEM);

        let httpResponse: HTTPResponse;

        if (configItemIds?.length) {
            configItemIds = configItemIds.filter(
                (id) => typeof id !== 'undefined' && id.toString() !== '' && id !== null
            );

            const uri = this.buildUri('cmdb', 'configitems', configItemIds.join(','));
            httpResponse = await this.getObjectByUri<ConfigItemResponse | ConfigItemsResponse>(
                token, uri, clientRequestId, query
            );
        } else if (loadingOptions.filter) {
            const success = await this.buildFilter(loadingOptions.filter, 'ConfigItem', query, token, this.objectType);
            if (!success) {
                LoggingService.getInstance().warning('Invalid api filter.', JSON.stringify(loadingOptions.filter));
                return new ObjectResponse([], 0);
            }
            const uri = this.buildUri('cmdb', 'configitems');
            httpResponse = await this.getObjectByUri<ConfigItemsResponse>(token, uri, clientRequestId, query);
        } else {
            const uri = this.buildUri('cmdb', 'configitems');
            httpResponse = await this.getObjectByUri<ConfigItemsResponse>(token, uri, clientRequestId, query);
        }

        const response = httpResponse.responseData;
        const totalCount = httpResponse.objectCounts[KIXObjectType.CONFIG_ITEM?.toLocaleLowerCase()] || 0;
        let configItems: ConfigItem[] = [];

        if (configItemIds?.length === 1) {
            configItems = [(response as ConfigItemResponse).ConfigItem];
        } else {
            configItems = (response as ConfigItemsResponse).ConfigItem;
        }
        return new ObjectResponse(configItems, totalCount);
    }

    private async getImages(
        token: string, imageIds: Array<number | string>,
        loadingOptions: KIXObjectLoadingOptions, objectLoadingOptions: ImagesLoadingOptions,
        clientRequestId: string
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
            const query = await this.prepareQuery(loadingOptions, KIXObjectType.CONFIG_ITEM_IMAGE);

            let images: ConfigItemImage[] = [];

            if (imageIds && imageIds.length) {
                imageIds = imageIds.filter(
                    (id) => typeof id !== 'undefined' && id.toString() !== '' && id !== null
                );

                const uri = this.buildUri('cmdb', subResource, imageIds.join(','));
                const httpResponse = await this.getObjectByUri<ConfigItemImageResponse | ConfigItemImagesResponse>(
                    token, uri, clientRequestId, query
                );

                const response = httpResponse.responseData;
                if (imageIds.length === 1) {
                    images = [(response as ConfigItemImageResponse).Image];
                } else {
                    images = (response as ConfigItemImagesResponse).Image;
                }

            } else if (loadingOptions.filter) {
                const success = await this.buildFilter(loadingOptions.filter, 'Image', query, token, this.objectType);
                if (!success) {
                    LoggingService.getInstance().warning('Invalid api filter.', JSON.stringify(loadingOptions.filter));
                    return [];
                }
                const uri = this.buildUri('cmdb', subResource);
                const response = await this.getObjectByUri<ConfigItemImagesResponse>(
                    token, uri, clientRequestId, query
                );
                images = response.responseData?.Image;
            } else {
                const uri = this.buildUri('cmdb', subResource);
                const response = await this.getObjectByUri<ConfigItemImagesResponse>(
                    token, uri, clientRequestId, query
                );
                images = response.responseData?.Image;
            }

            return images.map((cii) => new ConfigItemImage(cii));
        } else {
            throw new Error('', 'No config item id given!');
        }
    }

    private async getAttachments(
        token: string, attachmentIds: Array<number | string>, loadingOptions: KIXObjectLoadingOptions,
        objectLoadingOptions: AttachmentLoadingOptions
    ): Promise<ConfigItemAttachment[]> {

        let attachments: ConfigItemAttachment[] = [];

        if (attachmentIds?.length && objectLoadingOptions.configItemId && objectLoadingOptions.versionId) {
            const subResource = this.buildUri(
                'configitems', objectLoadingOptions.configItemId,
                'versions', objectLoadingOptions.versionId,
                'attachments'
            );

            loadingOptions = loadingOptions || new KIXObjectLoadingOptions();

            const query = await this.prepareQuery(loadingOptions, KIXObjectType.CONFIG_ITEM_ATTACHMENT);
            attachmentIds = attachmentIds.filter(
                (id) => typeof id !== 'undefined' && id.toString() !== '' && id !== null
            );

            const uri = this.buildUri('cmdb', subResource, attachmentIds.join(','));
            const httpResponse = await this.getObjectByUri(token, uri, query);

            const response = httpResponse.responseData;
            if (attachmentIds.length === 1) {
                attachments = [(response as ConfigItemAttachmentResponse).Attachment];
            } else {
                attachments = (response as ConfigItemAttachmentsResponse).Attachment;
            }
        }

        if (objectLoadingOptions.asDownload) {
            const preparedAttachments: ConfigItemAttachment[] = [];
            const user = await UserService.getInstance().getUserByToken(token);
            for (const a of attachments) {
                const attachment = new ConfigItemAttachment(a);
                FileService.prepareFileForDownload(user?.UserID, attachment);
                preparedAttachments.push(attachment);
            }
            attachments = preparedAttachments;
        }

        return attachments;
    }

    public async createObject(
        token: string, clientRequestId: string, objectType: KIXObjectType, parameter: Array<[string, string]>,
        createOptions: KIXObjectSpecificCreateOptions
    ): Promise<string | number> {
        if (objectType === KIXObjectType.CONFIG_ITEM_VERSION) {
            const options = createOptions as CreateConfigItemVersionOptions;
            const createConfigItemVersion = new CreateConfigItemVersion(parameter);
            const uri = this.buildUri('cmdb', 'configitems', options.configItemId, 'versions');
            const response
                = await this.sendCreateRequest<CreateConfigItemVersionResponse, CreateConfigItemVersionRequest>(
                    token, clientRequestId, uri, new CreateConfigItemVersionRequest(createConfigItemVersion),
                    KIXObjectType.CONFIG_ITEM_VERSION
                );

            const links = this.getParameterValue(parameter, KIXObjectProperty.LINKS);
            if (links && links.length) {
                await this.createLinks(token, clientRequestId, Number(options.configItemId), links);
            }

            return response.VersionID;
        } else {
            const createConfigItem = new CreateConfigItem(parameter.filter((p) => p[0] !== KIXObjectProperty.LINKS));
            const uri = this.buildUri('cmdb', 'configitems');
            const response = await this.sendCreateRequest<CreateConfigItemResponse, CreateConfigItemRequest>(
                token, clientRequestId, uri, new CreateConfigItemRequest(createConfigItem), this.objectType
            ).catch((error: Error) => {
                LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
                throw new Error(error.Code, error.Message);
            });

            const configItemId = response.ConfigItemID;

            const links = this.getParameterValue(parameter, KIXObjectProperty.LINKS);
            if (links && links.length) {
                await this.createLinks(token, clientRequestId, Number(configItemId), links);
            }

            return configItemId;
        }
    }

    public async updateObject(
        token: string, clientRequestId: string, objectType: KIXObjectType,
        parameter: Array<[string, any]>, objectId: number | string
    ): Promise<string | number> {
        throw new Error('', 'Method not implemented.');
    }

    public async prepareAPIFilter(criteria: FilterCriteria[], token: string): Promise<FilterCriteria[]> {
        return criteria.filter((c) => {
            if (c.property === ConfigItemProperty.CONFIG_ITEM_ID && c.operator === SearchOperator.NOT_EQUALS) {
                return true;
            }

            return c.property !== ConfigItemProperty.NUMBER &&
                c.property !== ConfigItemProperty.NAME &&
                c.property !== ConfigItemProperty.CLASS_ID &&
                c.property !== ConfigItemProperty.CLASS &&
                c.property !== 'InciStateIDs' &&
                c.property !== 'DeplStateIDs' &&
                c.property !== ConfigItemProperty.CUR_DEPL_STATE_ID &&
                c.property !== ConfigItemProperty.CUR_INCI_STATE_ID &&
                c.property !== 'ClassIDs' &&
                !c.property.startsWith('Data') &&
                !c.property.startsWith('CurrentVersion') &&
                c.property !== ConfigItemProperty.ASSIGNED_CONTACT &&
                c.property !== ConfigItemProperty.ASSIGNED_ORGANISATION &&
                c.property !== ConfigItemProperty.PREVIOUS_VERSION_SEARCH &&
                c.property !== 'ID' &&
                c.property !== KIXObjectProperty.CHANGE_BY &&
                c.property !== KIXObjectProperty.CREATE_BY;
        });
    }

    public async prepareAPISearch(criteria: FilterCriteria[], token: string): Promise<FilterCriteria[]> {
        const primary = criteria.filter((f) => f.property === SearchProperty.PRIMARY);
        if (primary?.length) {
            primary.forEach((c) => {
                const primarySearch = [
                    new FilterCriteria(
                        ConfigItemProperty.NUMBER, SearchOperator.LIKE,
                        FilterDataType.STRING, FilterType.OR, `${c.value}`
                    ),
                ];
                criteria = [...criteria, ...primarySearch];
            });
        }

        const fulltext = criteria.filter((f) => f.property === SearchProperty.FULLTEXT);
        if (fulltext?.length) {
            fulltext.forEach((c) => {
                const fulltextSearch = [
                    new FilterCriteria(
                        ConfigItemProperty.NUMBER, SearchOperator.LIKE,
                        FilterDataType.STRING, FilterType.OR, `*${c.value}*`
                    ),
                    new FilterCriteria(
                        ConfigItemProperty.NAME, SearchOperator.LIKE,
                        FilterDataType.STRING, FilterType.OR, `*${c.value}*`
                    )
                ];
                criteria = [...criteria, ...fulltextSearch];
            });
        }

        const newCriteria = criteria.filter((c) =>
            (c.property === ConfigItemProperty.CONFIG_ITEM_ID && c.operator !== SearchOperator.NOT_EQUALS) ||
            c.property === ConfigItemProperty.NUMBER ||
            c.property === ConfigItemProperty.NAME ||
            c.property === 'InciStateIDs' ||
            c.property === 'DeplStateIDs' ||
            c.property === ConfigItemProperty.CUR_DEPL_STATE_ID ||
            c.property === ConfigItemProperty.CUR_INCI_STATE_ID ||
            c.property === ConfigItemProperty.CLASS_ID ||
            c.property === ConfigItemProperty.CLASS ||
            c.property === 'ClassIDs' ||
            c.property.startsWith('Data') ||
            c.property.startsWith('CurrentVersion') ||
            c.property === ConfigItemProperty.ASSIGNED_CONTACT ||
            c.property === ConfigItemProperty.ASSIGNED_ORGANISATION ||
            c.property === ConfigItemProperty.PREVIOUS_VERSION_SEARCH ||
            c.property === 'ID' ||
            c.property === KIXObjectProperty.CHANGE_BY ||
            c.property === KIXObjectProperty.CREATE_BY
        );

        for (const searchCriteria of newCriteria) {
            switch (searchCriteria.property) {
                case ConfigItemProperty.CLASS_ID:
                    searchCriteria.property = 'ClassIDs';
                    searchCriteria.operator = SearchOperator.IN;
                    searchCriteria.value = Array.isArray(searchCriteria.value)
                        ? searchCriteria.value : [searchCriteria.value as number];
                    break;
                case ConfigItemProperty.CUR_DEPL_STATE_ID:
                    searchCriteria.property = 'DeplStateIDs';
                    searchCriteria.operator = SearchOperator.IN;
                    searchCriteria.value = Array.isArray(searchCriteria.value)
                        ? searchCriteria.value : [searchCriteria.value as number];
                    break;
                case ConfigItemProperty.CUR_INCI_STATE_ID:
                    searchCriteria.property = 'InciStateIDs';
                    searchCriteria.operator = SearchOperator.IN;
                    searchCriteria.value = Array.isArray(searchCriteria.value)
                        ? searchCriteria.value : [searchCriteria.value as number];
                    break;
                case ConfigItemProperty.PREVIOUS_VERSION_SEARCH:
                    searchCriteria.operator = SearchOperator.EQUALS;
                    searchCriteria.value = Array.isArray(searchCriteria.value)
                        ? searchCriteria.value[0] : searchCriteria.value;
                    break;
                default:
            }
        }
        return newCriteria;
    }
}

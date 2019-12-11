/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IKIXObjectService } from "./IKIXObjectService";
import { HttpService } from "./HttpService";
import { KIXObjectType } from "../../model/kix/KIXObjectType";
import { IObjectFactory } from "../model/IObjectFactory";
import { ObjectFactoryService } from "./ObjectFactoryService";
import { KIXObject } from "../../model/kix/KIXObject";
import { KIXObjectLoadingOptions } from "../../model/KIXObjectLoadingOptions";
import { KIXObjectSpecificLoadingOptions } from "../../model/KIXObjectSpecificLoadingOptions";
import { Error } from "../../../../server/model/Error";
import { KIXObjectSpecificDeleteOptions } from "../../model/KIXObjectSpecificDeleteOptions";
import { LoggingService } from "../../../../server/services/LoggingService";
import { SortOrder } from "../../model/SortOrder";
import { FilterCriteria } from "../../model/FilterCriteria";
import { FilterType } from "../../model/FilterType";
import { RequestObject } from "../../../../server/model/rest/RequestObject";
import { KIXObjectSpecificCreateOptions } from "../../model/KIXObjectSpecificCreateOptions";
import { Query } from "../../../../server/model/rest/Query";
import { KIXObjectServiceRegistry } from "./KIXObjectServiceRegistry";
import { ObjectIconLoadingOptions } from "../model/ObjectIconLoadingOptions";
import { ObjectIcon } from "../../modules/icon/model/ObjectIcon";
import { CreateLinkDescription } from "../../modules/links/server/api/CreateLinkDescription";
import { CreateLink } from "../../modules/links/server/api/CreateLink";
import { CreateLinkRequest } from "../../modules/links/server/api/CreateLinkRequest";

export abstract class KIXObjectAPIService implements IKIXObjectService {

    protected httpService: HttpService = HttpService.getInstance();

    protected abstract objectType: KIXObjectType | string;

    protected abstract RESOURCE_URI: string;

    protected enableSearchQuery: boolean = true;

    public constructor(factories: IObjectFactory[] = []) {
        factories.forEach((f) => ObjectFactoryService.registerFactory(f));
    }

    public abstract isServiceFor(kixObjectType: KIXObjectType | string): boolean;

    public async loadObjects<O extends KIXObject = any>(
        token: string, clientRequestId: string, objectType: KIXObjectType | string, objectIds: Array<number | string>,
        loadingOptions: KIXObjectLoadingOptions, objectLoadingOptions: KIXObjectSpecificLoadingOptions
    ): Promise<O[]> {
        throw new Error('-1', `Method loadObjects not implemented (${objectType})`);
    }

    protected async load<O extends KIXObject | string = any>(
        token: string, objectType: KIXObjectType | string, baseUri: string, loadingOptions: KIXObjectLoadingOptions,
        objectIds: Array<number | string>, responseProperty: string, useCache?: boolean
    ): Promise<O[]> {
        const query = this.prepareQuery(loadingOptions);
        if (loadingOptions && loadingOptions.filter && loadingOptions.filter.length) {
            await this.buildFilter(loadingOptions.filter, responseProperty, query, token);
        }

        let objects: O[] = [];

        const emptyResult = objectIds && objectIds.length === 0;
        if (emptyResult) {
            return objects;
        }

        objectIds = objectIds
            ? objectIds.filter((id) => typeof id !== 'undefined' && id !== null && id.toString() !== '')
            : [];

        const uri = objectIds.length
            ? this.buildUri(baseUri, objectIds.join(','))
            : baseUri;

        const response = await this.getObjectByUri(token, uri, query, objectType, useCache);

        const responseObject = response[responseProperty];

        // TODO:: Logausgabe bei falscher ResponseProperty
        objects = Array.isArray(responseObject)
            ? responseObject
            : [responseObject];

        const result = [];
        for (const o of objects) {
            const object = await ObjectFactoryService.createObject(token, objectType, o);
            result.push(object);
        }

        return result;
    }

    protected async executeUpdateOrCreateRequest<R = number>(
        token: string, clientRequestId: string, parameter: Array<[string, any]>, uri: string,
        objectType: KIXObjectType | string, responseProperty: string, create: boolean = false
    ): Promise<R> {
        const object = {};
        object[objectType] = new RequestObject(parameter.filter((p) => p[0] !== 'ICON'));

        const response = await this.sendRequest(token, clientRequestId, uri, object, objectType, create);

        const icon: ObjectIcon = this.getParameterValue(parameter, 'ICON');
        if (icon) {
            icon.Object = objectType;
            icon.ObjectID = response[responseProperty];
            if (create) {
                await this.createIcons(token, clientRequestId, icon)
                    .catch(() => {
                        // be silent
                    });
            } else {
                await this.updateIcon(token, clientRequestId, icon)
                    .catch(() => {
                        // be silent
                    });
            }
        }

        return responseProperty ? response[responseProperty] : response;
    }

    public createObject(
        token: string, clientRequestId: string, objectType: KIXObjectType | string, parameter: Array<[string, string]>,
        createOptions: KIXObjectSpecificCreateOptions, cacheKeyPrefix: string
    ): Promise<string | number> {
        throw new Error('', "Method not implemented.");
    }

    public async updateObject(
        token: string, clientRequestId: string, objectType: KIXObjectType | string, parameter: Array<[string, string]>,
        objectId: number | string, updateOptions: KIXObjectSpecificCreateOptions, cacheKeyPrefix: string
    ): Promise<string | number> {
        throw new Error('', "Method not implemented.");
    }

    protected prepareQuery(loadingOptions: KIXObjectLoadingOptions): any {
        let query = {};

        if (loadingOptions) {
            if (loadingOptions.limit) {
                query = { ...query, limit: loadingOptions.limit };
            }

            if (loadingOptions.sortOrder) {
                query = { ...query, sort: loadingOptions.sortOrder };
            }

            if (loadingOptions.includes) {
                query = { ...query, include: loadingOptions.includes.join(',') };
            }

            if (loadingOptions.expands) {
                query = { ...query, expand: loadingOptions.expands.join(',') };
            }

            if (loadingOptions.query) {
                loadingOptions.query.forEach((q) => query[q[0]] = q[1]);
            }
        }

        return query;
    }

    protected async getObjects<R>(
        token: string, limit?: number, order?: SortOrder, changedAfter?: string, query?: any
    ): Promise<R> {
        if (!query) {
            query = {};
        }

        if (limit) {
            query[Query.LIMIT] = limit;
        }

        if (order) {
            query[Query.ORDER] = order;
        }

        if (changedAfter) {
            query[Query.CHANGED_AFTER] = changedAfter;
        }

        return await this.httpService.get<R>(this.RESOURCE_URI, query, token, null, this.objectType);
    }

    protected getObject<R>(token: string, objectId: number | string, query?: any): Promise<R> {
        const uri = this.buildUri(this.RESOURCE_URI, objectId);
        return this.getObjectByUri(token, uri, query);
    }

    protected async getObjectByUri<R>(
        token: string, uri: string, query?: any, cacheKeyPrefix: string = this.objectType, useCache?: boolean
    ): Promise<R> {
        if (!query) {
            query = {};
        }

        return await this.httpService.get<R>(uri, query, token, null, cacheKeyPrefix, useCache);
    }

    protected async sendRequest(
        token: string, clientRequestId: string, uri: string, content: any,
        cacheKeyPrefix: string, create: boolean = false
    ): Promise<any> {
        if (create) {
            return await this.httpService.post(uri, content, token, clientRequestId, cacheKeyPrefix);
        } else {
            return await this.httpService.patch(uri, content, token, clientRequestId, cacheKeyPrefix);
        }
    }

    protected async sendCreateRequest<R, C>(
        token: string, clientRequestId: string, uri: string, content: C, cacheKeyPrefix: string
    ): Promise<R> {
        return await this.httpService.post<R>(uri, content, token, clientRequestId, cacheKeyPrefix);
    }

    protected async sendUpdateRequest<R, C>(
        token: string, clientRequestId: string, uri: string, content: C, cacheKeyPrefix: string
    ): Promise<R> {
        return await this.httpService.patch<R>(uri, content, token, clientRequestId, cacheKeyPrefix);
    }

    protected async sendDeleteRequest<R>(
        token: string, clientRequestId: string, uri: string[], cacheKeyPrefix: string
    ): Promise<Error[]> {
        return await this.httpService.delete<R>(uri, token, clientRequestId, cacheKeyPrefix);
    }

    protected buildUri(...args): string {
        return args.join("/");
    }

    public async deleteObject(
        token: string, clientRequestId: string, objectType: KIXObjectType | string, objectId: string | number,
        deleteOptions: KIXObjectSpecificDeleteOptions, cacheKeyPrefix: string, ressourceUri: string = this.RESOURCE_URI
    ): Promise<Error[]> {
        const uri = [this.buildUri(ressourceUri, objectId)];

        return await this.sendDeleteRequest<void>(token, clientRequestId, uri, cacheKeyPrefix)
            .catch((error: Error) => {
                LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
                throw new Error(error.Code, error.Message);
            });
    }

    protected async createLinks(
        token: string, clientRequestId: string, objectId: number,
        linkDescriptions: Array<CreateLinkDescription<KIXObject>>
    ): Promise<void> {
        if (linkDescriptions) {
            for (const ld of linkDescriptions) {

                const isSource = ld.linkTypeDescription.asSource;

                const source = isSource
                    ? ld.linkTypeDescription.linkType.Target
                    : ld.linkTypeDescription.linkType.Source;

                const sourceKey = isSource
                    ? ld.linkableObject.ObjectId.toString()
                    : objectId.toString();

                const target = isSource
                    ? ld.linkTypeDescription.linkType.Source
                    : ld.linkTypeDescription.linkType.Target;

                const targetKey = ld.linkTypeDescription.asSource
                    ? objectId.toString()
                    : ld.linkableObject.ObjectId.toString();

                const link = new CreateLink(source, sourceKey, target, targetKey, ld.linkTypeDescription.linkType.Name);

                await this.sendCreateRequest(
                    token, clientRequestId, 'links', new CreateLinkRequest(link), KIXObjectType.LINK
                ).catch((error: Error) => {
                    LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
                    throw new Error(error.Code, error.Message);
                });
            }
        }
    }

    protected async createIcons(token: string, clientRequestId: string, icon: ObjectIcon): Promise<void> {
        if (icon) {
            const iconService = KIXObjectServiceRegistry.getServiceInstance(
                KIXObjectType.OBJECT_ICON
            );
            if (iconService) {
                await iconService.createObject(token, clientRequestId, KIXObjectType.OBJECT_ICON, [
                    ['Object', icon.Object],
                    ['ObjectID', icon.ObjectID.toString()],
                    ['ContentType', icon.ContentType],
                    ['Content', icon.Content]
                ], null, KIXObjectType.OBJECT_ICON
                ).catch((error: Error) => {
                    throw new Error(error.Code, error.Message);
                });
            }
        }
    }

    protected async updateIcon(token: string, clientRequestId: string, icon: ObjectIcon): Promise<void> {
        if (icon) {
            const iconService = KIXObjectServiceRegistry.getServiceInstance(
                KIXObjectType.OBJECT_ICON
            );
            const icons = await iconService.loadObjects<ObjectIcon>(
                token, clientRequestId, KIXObjectType.OBJECT_ICON, null, null,
                new ObjectIconLoadingOptions(icon.Object, icon.ObjectID)
            );
            if (icons && icons.length) {
                await iconService.updateObject(
                    token, clientRequestId,
                    KIXObjectType.OBJECT_ICON, [
                    ['Object', icon.Object],
                    ['ObjectID', icon.ObjectID.toString()],
                    ['ContentType', icon.ContentType],
                    ['Content', icon.Content]
                ],
                    icons[0].ID, null, KIXObjectType.OBJECT_ICON
                ).catch((error: Error) => {
                    throw new Error(error.Code, error.Message);
                });
            } else {
                this.createIcons(token, clientRequestId, icon)
                    .catch((error) => {
                        throw error;
                    });
            }
        }
    }

    protected getParameterValue(parameter: Array<[string, any]>, property: string): any {
        const value = parameter.find((p) => p[0] === property);
        return value ? value[1] : undefined;
    }

    protected async buildFilter(
        filter: FilterCriteria[], objectProperty: string, query: any, token?: string
    ): Promise<void> {
        let objectFilter = {};

        const filterCriteria = this.prepareAPIFilter(filter);
        let hasAPIFilter = false;
        if (filterCriteria && filterCriteria.length) {
            hasAPIFilter = true;
            objectFilter = this.prepareObjectFilter(filterCriteria, objectFilter);
        }

        const searchCriteria = this.prepareAPISearch(filter);
        let hasAPISearch = false;
        if (searchCriteria && searchCriteria.length) {
            hasAPISearch = true;
            objectFilter = this.prepareObjectFilter(filterCriteria, objectFilter);
        }

        if (hasAPIFilter) {
            const apiFilter = {};
            apiFilter[objectProperty] = objectFilter;
            query.filter = JSON.stringify(apiFilter);
        }

        if (hasAPISearch) {
            const apiSearch = {};
            apiSearch[objectProperty] = objectFilter;
            query.search = JSON.stringify(apiSearch);
        }
    }

    protected prepareAPIFilter(criteria: FilterCriteria[]): FilterCriteria[] {
        return criteria;
    }

    protected prepareAPISearch(criteria: FilterCriteria[]): FilterCriteria[] {
        return criteria;
    }

    private prepareObjectFilter(filterCriteria: FilterCriteria[], objectFilter: any): any {
        const andFilter = filterCriteria.filter((f) => f.filterType === FilterType.AND).map((f) => {
            return { Field: f.property, Operator: f.operator, Type: f.type, Value: f.value };
        });

        if (andFilter && andFilter.length) {
            objectFilter = { ...objectFilter, AND: andFilter };
        }

        const orFilter = filterCriteria.filter((f) => f.filterType === FilterType.OR).map((f) => {
            return { Field: f.property, Operator: f.operator, Type: f.type, Value: f.value };
        });

        if (orFilter && orFilter.length) {
            objectFilter = { ...objectFilter, OR: orFilter };
        }

        return objectFilter;
    }
}
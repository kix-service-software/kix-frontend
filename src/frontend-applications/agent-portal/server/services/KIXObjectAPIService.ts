/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IKIXObjectService } from './IKIXObjectService';
import { HttpService } from './HttpService';
import { KIXObjectType } from '../../model/kix/KIXObjectType';
import { KIXObject } from '../../model/kix/KIXObject';
import { KIXObjectLoadingOptions } from '../../model/KIXObjectLoadingOptions';
import { KIXObjectSpecificLoadingOptions } from '../../model/KIXObjectSpecificLoadingOptions';
import { Error } from '../../../../server/model/Error';
import { KIXObjectSpecificDeleteOptions } from '../../model/KIXObjectSpecificDeleteOptions';
import { LoggingService } from '../../../../server/services/LoggingService';
import { SortOrder } from '../../model/SortOrder';
import { FilterCriteria } from '../../model/FilterCriteria';
import { FilterType } from '../../model/FilterType';
import { RequestObject } from '../../../../server/model/rest/RequestObject';
import { KIXObjectSpecificCreateOptions } from '../../model/KIXObjectSpecificCreateOptions';
import { Query } from '../../../../server/model/rest/Query';
import { KIXObjectServiceRegistry } from './KIXObjectServiceRegistry';
import { ObjectIconLoadingOptions } from '../model/ObjectIconLoadingOptions';
import { ObjectIcon } from '../../modules/icon/model/ObjectIcon';
import { CreateLinkDescription } from '../../modules/links/server/api/CreateLinkDescription';
import { CreateLink } from '../../modules/links/server/api/CreateLink';
import { CreateLinkRequest } from '../../modules/links/server/api/CreateLinkRequest';
import { KIXObjectProperty } from '../../model/kix/KIXObjectProperty';
import { ExtendedKIXObjectAPIService } from './ExtendedKIXObjectAPIService';
import { CacheService } from './cache';
import { SearchProperty } from '../../modules/search/model/SearchProperty';
import { SearchOperator } from '../../modules/search/model/SearchOperator';
import { SortUtil } from '../../model/SortUtil';
import { ConfigurationService } from '../../../../server/services/ConfigurationService';

export abstract class KIXObjectAPIService implements IKIXObjectService {

    protected httpService: HttpService = HttpService.getInstance();

    protected abstract objectType: KIXObjectType | string;

    protected abstract RESOURCE_URI: string;

    protected enableSearchQuery: boolean = true;

    protected extendedServices: ExtendedKIXObjectAPIService[] = [];

    public abstract isServiceFor(kixObjectType: KIXObjectType | string): boolean;

    public addExtendedService(service: ExtendedKIXObjectAPIService): void {
        this.extendedServices.push(service);
    }

    protected getObjectClass(objectType: KIXObjectType | string): new (object: KIXObject) => KIXObject {
        return null;
    }

    public async loadDisplayValue(objectType: KIXObjectType | string, objectId: string | number): Promise<string> {
        let displayValue = '';

        if (objectType && objectId) {
            const cacheKey = `${objectType}-${objectId}-displayvalue`;
            displayValue = await CacheService.getInstance().get(cacheKey, objectType);
            if (!displayValue && objectId) {

                const config = ConfigurationService.getInstance().getServerConfiguration();
                const objects = await this.loadObjects(
                    config?.BACKEND_API_TOKEN, 'KIXObjectAPIService', objectType, [objectId], null, null
                );

                if (objects?.length) {
                    let object = objects[0];
                    const objectClass = this.getObjectClass(objectType);
                    if (objectClass) {
                        object = new objectClass(object);
                    }
                    displayValue = object.toString();
                    await CacheService.getInstance().set(cacheKey, displayValue, objectType);
                }
            }
        }

        return displayValue;
    }

    public async loadObjects<O extends KIXObject = any>(
        token: string, clientRequestId: string, objectType: KIXObjectType | string, objectIds: Array<number | string>,
        loadingOptions: KIXObjectLoadingOptions, objectLoadingOptions: KIXObjectSpecificLoadingOptions
    ): Promise<O[]> {
        throw new Error('-1', `Method loadObjects not implemented (${objectType})`);
    }

    protected async load<O extends KIXObject | string | number = any>(
        token: string, objectType: KIXObjectType | string, baseUri: string, loadingOptions: KIXObjectLoadingOptions,
        objectIds: Array<number | string>, responseProperty: string, clientRequestId: string,
        objectConstructor?: new (object?: KIXObject) => O,
        useCache?: boolean
    ): Promise<O[]> {
        const query = this.prepareQuery(loadingOptions, objectType);
        if (loadingOptions && loadingOptions.filter && loadingOptions.filter.length) {
            const success = await this.buildFilter(loadingOptions.filter, responseProperty, query, token);

            if (!success) {
                LoggingService.getInstance().warning('Invalid api filter.', loadingOptions.filter);
                return [];
            }

        }

        let objects: O[] = [];
        let uri = baseUri;
        if (objectIds) {
            objectIds = objectIds.filter((id) => typeof id !== 'undefined' && id !== null && id.toString() !== '');
            if (objectIds.length === 0) {
                return [];
            }
            uri = this.buildUri(baseUri, objectIds.join(','));
        }

        const response = await this.getObjectByUri(token, uri, clientRequestId, query, objectType, useCache);

        const responseObject = response[responseProperty];

        objects = Array.isArray(responseObject)
            ? responseObject
            : [responseObject];

        objects = objects.filter((o) => o !== null && typeof o !== 'undefined');
        // objects = objectConstructor ? objects.map((o) => new objectConstructor(o as KIXObject)) : objects;

        return objects;
    }

    protected async executeUpdateOrCreateRequest<R = number>(
        token: string, clientRequestId: string, parameter: Array<[string, any]>, uri: string,
        objectType: KIXObjectType | string, responseProperty: string, create: boolean = false,
        cacheKeyPrefix: string = objectType
    ): Promise<R> {
        for (const service of this.extendedServices) {
            service.postPrepareParameter(parameter);
        }

        const object = {};
        object[objectType] = new RequestObject(parameter.filter((p) => p[0] !== 'ICON'));

        const response = await this.sendRequest(token, clientRequestId, uri, object, cacheKeyPrefix, create);

        const icon: ObjectIcon = this.getParameterValue(parameter, 'ICON');
        if (icon && icon.Content) {
            icon.Object = objectType;
            icon.ObjectID = response[responseProperty];
            if (create) {
                await this.createIcon(token, clientRequestId, icon)
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
        throw new Error('', 'Method createObject not implemented.');
    }

    public async updateObject(
        token: string, clientRequestId: string, objectType: KIXObjectType | string, parameter: Array<[string, string]>,
        objectId: number | string, updateOptions: KIXObjectSpecificCreateOptions, cacheKeyPrefix: string
    ): Promise<string | number> {
        throw new Error('', 'Method updateObject not implemented.');
    }

    public async commitObject(token: string, clientRequestId: string, object: KIXObject): Promise<number | string> {
        throw new Error('', 'Method commitObject not implemented.');
    }

    protected prepareQuery(loadingOptions: KIXObjectLoadingOptions, objectType: KIXObjectType | string): any {
        let query = {};

        if (loadingOptions) {
            if (loadingOptions.limit || loadingOptions.limit === 0) {
                query = { ...query, limit: loadingOptions.limit, searchlimit: loadingOptions.limit };
            }

            if (loadingOptions.sortOrder) {
                query = { ...query, sort: loadingOptions.sortOrder };
            }

            let additionalIncludes = [];
            this.extendedServices.forEach(
                (s) => additionalIncludes = [...additionalIncludes, ...s.getAdditionalIncludes(objectType)]
            );

            if (loadingOptions.includes) {
                loadingOptions.includes = [...loadingOptions.includes, ...additionalIncludes];
                query = { ...query, include: loadingOptions.includes.join(',') };
            } else {
                loadingOptions.includes = additionalIncludes;
            }

            if (loadingOptions.expands) {
                query = { ...query, expand: loadingOptions.expands.join(',') };
            }

            if (loadingOptions.query) {
                loadingOptions.query.forEach((q) => query[q[0]] = Array.isArray(q[1]) ? JSON.stringify(q[1]) : q[1]);
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

    protected getObject<R>(token: string, objectId: number | string, clientRequestId: string, query?: any): Promise<R> {
        const uri = this.buildUri(this.RESOURCE_URI, objectId);
        return this.getObjectByUri(token, uri, clientRequestId, query);
    }

    protected getObjectByUri<R>(
        token: string, uri: string, clientRequestId: string, query?: any, cacheKeyPrefix: string = this.objectType,
        useCache?: boolean
    ): Promise<R> {
        if (!query) {
            query = {};
        }

        return this.httpService.get<R>(uri, query, token, clientRequestId, cacheKeyPrefix, useCache);
    }

    protected sendRequest(
        token: string, clientRequestId: string, uri: string, content: any,
        cacheKeyPrefix: string, create: boolean = false
    ): Promise<any> {
        if (create) {
            return this.httpService.post(uri, content, token, clientRequestId, cacheKeyPrefix);
        } else {
            return this.httpService.patch(uri, content, token, clientRequestId, cacheKeyPrefix);
        }
    }

    protected sendCreateRequest<R, C>(
        token: string, clientRequestId: string, uri: string, content: C, cacheKeyPrefix: string
    ): Promise<R> {
        return this.httpService.post<R>(uri, content, token, clientRequestId, cacheKeyPrefix);
    }

    protected sendUpdateRequest<R, C>(
        token: string, clientRequestId: string, uri: string, content: C, cacheKeyPrefix: string
    ): Promise<R> {
        return this.httpService.patch<R>(uri, content, token, clientRequestId, cacheKeyPrefix);
    }

    protected sendDeleteRequest<R>(
        token: string, clientRequestId: string, uri: string[], cacheKeyPrefix: string, logError: boolean = true
    ): Promise<Error[]> {
        return this.httpService.delete<R>(uri, token, clientRequestId, cacheKeyPrefix, logError);
    }

    protected buildUri(...args): string {
        return args.join('/');
    }

    public async deleteObject(
        token: string, clientRequestId: string, objectType: KIXObjectType | string, objectId: string | number,
        deleteOptions: KIXObjectSpecificDeleteOptions, cacheKeyPrefix: string, ressourceUri: string = this.RESOURCE_URI
    ): Promise<Error[]> {
        const uri = [this.buildUri(ressourceUri, objectId)];

        const errors = await this.sendDeleteRequest<void>(token, clientRequestId, uri, cacheKeyPrefix)
            .catch((error: Error) => {
                LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
                throw new Error(error.Code, error.Message);
            });

        if (errors && errors.length) {
            LoggingService.getInstance().error(`${errors[0].Code}: ${errors[0].Message}`, errors[0]);
            throw new Error(errors[0].Code, errors[0].Message);
        }

        return [];
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

    public async createIcon(token: string, clientRequestId: string, icon: ObjectIcon): Promise<void> {
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
            CacheService.getInstance().deleteKeys(KIXObjectType.OBJECT_ICON);
        }
    }

    public async updateIcon(token: string, clientRequestId: string, icon: ObjectIcon): Promise<void> {
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
                this.createIcon(token, clientRequestId, icon)
                    .catch((error) => {
                        throw error;
                    });
            }

            CacheService.getInstance().deleteKeys(KIXObjectType.OBJECT_ICON);
        }
    }

    protected getParameterValue(parameter: Array<[string, any]>, property: string): any {
        const value = parameter.find((p) => p[0] === property);
        return value ? value[1] : undefined;
    }

    public async buildFilter(
        criteria: FilterCriteria[], objectProperty: string, query: any, token: string
    ): Promise<boolean> {
        criteria = criteria.filter((c) => c?.property);

        const nonDynamicFieldCriteria = criteria.filter(
            // eslint-disable-next-line no-useless-escape
            (c) => !c.property.match(new RegExp(`${KIXObjectProperty.DYNAMIC_FIELDS}?\.(.+)`))
        );

        let filterCriteria = await this.prepareAPIFilter(nonDynamicFieldCriteria, token);
        for (const service of this.extendedServices) {
            const extendedCriteria = await service.prepareAPIFilter(nonDynamicFieldCriteria, token);
            if (extendedCriteria) {
                filterCriteria = [...filterCriteria, ...extendedCriteria];
            }
        }

        // ignore fulltext and primary property
        filterCriteria = filterCriteria
            ? filterCriteria.filter((c) => {
                if (c.property === SearchProperty.FULLTEXT || c.property === SearchProperty.PRIMARY) {
                    return false;
                }
                return true;
            })
            : [];

        if (filterCriteria && filterCriteria.length) {
            const apiFilter = {};
            apiFilter[objectProperty] = this.prepareObjectFilter(filterCriteria);
            query.filter = encodeURIComponent(JSON.stringify(apiFilter));
        }

        let searchCriteria = await this.prepareAPISearch(nonDynamicFieldCriteria, token);
        for (const service of this.extendedServices) {
            const extendedCriteria = await service.prepareAPISearch(nonDynamicFieldCriteria, token);
            if (extendedCriteria) {
                searchCriteria = [...searchCriteria, ...extendedCriteria];
            }
        }
        const dynamicFieldCriteria = criteria.filter(
            // eslint-disable-next-line no-useless-escape
            (c) => c.property.match(new RegExp(`${KIXObjectProperty.DYNAMIC_FIELDS}?\.(.+)`))
        );

        searchCriteria = [...searchCriteria, ...dynamicFieldCriteria];

        // check for "invalid" (not satisfiable) AND criteria (IN criteria with empty values)
        if (searchCriteria.length) {
            const hasEmptyINSearch = searchCriteria.some(
                (c) => c.operator === SearchOperator.IN && c.filterType === FilterType.AND
                    && (Array.isArray(c.value) && !c.value.length)
            );

            if (hasEmptyINSearch) {
                return false;
            }
        }

        // filter IN criteria with empty values
        searchCriteria = searchCriteria.filter(
            (c) => c.operator !== SearchOperator.IN || (Array.isArray(c.value) && c.value.length)
        );

        if (searchCriteria.length) {

            // use correct property name
            const fulltextCriterion = searchCriteria.find((c) => c.property === SearchProperty.FULLTEXT);
            if (fulltextCriterion) {
                fulltextCriterion.property = 'Fulltext';
            }

            const apiSearch = {};
            apiSearch[objectProperty] = this.prepareObjectFilter(searchCriteria);
            query.search = encodeURIComponent(JSON.stringify(apiSearch));
        }

        return true;
    }

    public async prepareAPIFilter(criteria: FilterCriteria[], token: string): Promise<FilterCriteria[]> {
        return criteria;
    }

    public async prepareAPISearch(criteria: FilterCriteria[], token: string): Promise<FilterCriteria[]> {
        return criteria;
    }

    public prepareObjectFilter(filterCriteria: FilterCriteria[]): any {
        let objectFilter = {};

        const prepareCriteria: FilterCriteria[] = [];
        filterCriteria.forEach((c) => {
            if (c?.property) {
                c.property = c.property.replace(KIXObjectProperty.DYNAMIC_FIELDS + '.', 'DynamicField_');
                switch (c.operator) {
                    case SearchOperator.BETWEEN:
                        if (Array.isArray(c.value) && c.value[0] && c.value[1]) {
                            // switch if necessary
                            if (SortUtil.compareDate(c.value[0].toString(), c.value[1].toString()) > 0) {
                                const oldStartDate = c.value[0];
                                c.value[0] = c.value[1];
                                c.value[1] = oldStartDate;
                            }
                            prepareCriteria.push(new FilterCriteria(
                                c.property, SearchOperator.GREATER_THAN_OR_EQUAL, c.type, c.filterType, c.value[0]
                            ));
                            prepareCriteria.push(new FilterCriteria(
                                c.property, SearchOperator.LESS_THAN_OR_EQUAL, c.type, c.filterType, c.value[1]
                            ));
                        }
                        break;
                    case SearchOperator.WITHIN_THE_LAST:
                        if (c.value) {
                            prepareCriteria.push(new FilterCriteria(
                                c.property, SearchOperator.GREATER_THAN_OR_EQUAL, c.type, c.filterType, '-' +
                                c.value[0] + c.value[1]
                            ));
                            prepareCriteria.push(new FilterCriteria(
                                c.property, SearchOperator.LESS_THAN_OR_EQUAL, c.type, c.filterType, '+0s' // now
                            ));
                        }
                        break;
                    case SearchOperator.WITHIN_THE_NEXT:
                        if (c.value) {
                            prepareCriteria.push(new FilterCriteria(
                                c.property, SearchOperator.GREATER_THAN_OR_EQUAL, c.type, c.filterType, '+0s' // now
                            ));
                            prepareCriteria.push(new FilterCriteria(
                                c.property, SearchOperator.LESS_THAN_OR_EQUAL, c.type, c.filterType, '+' +
                                c.value[0] + c.value[1]
                            ));
                        }
                        break;
                    case SearchOperator.WITHIN:
                        if (Array.isArray(c.value)) {
                            if (c.value.length === 2) {
                                const preparedValues = [];
                                const partsFrom = c.value[0].toString().split(/(\d+)/);
                                if (partsFrom.length === 3) {
                                    preparedValues[0] = partsFrom[0];
                                    preparedValues[1] = partsFrom[1];
                                    preparedValues[2] = partsFrom[2];
                                }
                                const partsTo = c.value[1].toString().split(/(\d+)/);
                                if (partsTo.length === 3) {
                                    preparedValues[3] = partsTo[0];
                                    preparedValues[4] = partsTo[1];
                                    preparedValues[5] = partsTo[2];
                                }
                                c.value = preparedValues;
                            }
                            if (
                                c.value.length === 6 &&
                                c.value[0] && c.value[1] && c.value[2] && c.value[3] && c.value[4] && c.value[5] &&
                                !isNaN(Number(c.value[1])) && !isNaN(Number(c.value[4]))
                            ) {
                                // switch if necessary
                                let switchWithin = false;
                                if (c.value[0] !== c.value[3]) {
                                    switchWithin = c.value[3] === '-';
                                } else if (
                                    (
                                        c.value[0] === '+' &&
                                        this.getSeconds(Number(c.value[1]), c.value[2].toString()) >
                                        this.getSeconds(Number(c.value[4]), c.value[5].toString())
                                    ) || (
                                        c.value[0] === '-' &&
                                        this.getSeconds(Number(c.value[1]), c.value[2].toString()) <
                                        this.getSeconds(Number(c.value[4]), c.value[5].toString())
                                    )
                                ) {
                                    switchWithin = true;
                                }
                                if (switchWithin) {
                                    const oldStartType = c.value[0];
                                    const oldStartValue = c.value[1];
                                    const oldStartUnit = c.value[2];
                                    c.value[0] = c.value[3];
                                    c.value[1] = c.value[4];
                                    c.value[2] = c.value[5];
                                    c.value[3] = oldStartType;
                                    c.value[4] = oldStartValue;
                                    c.value[5] = oldStartUnit;
                                }
                                prepareCriteria.push(new FilterCriteria(
                                    c.property, SearchOperator.GREATER_THAN_OR_EQUAL, c.type, c.filterType,
                                    `${c.value[0]}${c.value[1]}${c.value[2]}`
                                ));
                                prepareCriteria.push(new FilterCriteria(
                                    c.property, SearchOperator.LESS_THAN_OR_EQUAL, c.type, c.filterType,
                                    `${c.value[3]}${c.value[4]}${c.value[5]}`
                                ));
                            }
                        }
                        break;
                    case SearchOperator.LESS_THAN_AGO:
                        if (c.value) {
                            prepareCriteria.push(new FilterCriteria(
                                c.property, SearchOperator.GREATER_THAN, c.type, c.filterType, '-' +
                                c.value[0] + c.value[1]
                            ));
                        }
                        break;
                    case SearchOperator.MORE_THAN_AGO:
                        if (c.value) {
                            prepareCriteria.push(new FilterCriteria(
                                c.property, SearchOperator.LESS_THAN, c.type, c.filterType, '-' +
                                c.value[0] + c.value[1]
                            ));
                        }
                        break;
                    case SearchOperator.IN_LESS_THAN:
                        if (c.value) {
                            prepareCriteria.push(new FilterCriteria(
                                c.property, SearchOperator.LESS_THAN, c.type, c.filterType, '+' +
                                c.value[0] + c.value[1]
                            ));
                        }
                        break;
                    case SearchOperator.IN_MORE_THAN:
                        if (c.value) {
                            prepareCriteria.push(new FilterCriteria(
                                c.property, SearchOperator.GREATER_THAN, c.type, c.filterType, '+' +
                                c.value[0] + c.value[1]
                            ));
                        }
                        break;
                    default:
                        prepareCriteria.push(c);
                }
            }
        });

        const andFilter = prepareCriteria.filter((f) => f.filterType === FilterType.AND).map((f) => {
            return { Field: f.property, Operator: f.operator, Type: f.type, Value: f.value };
        });

        if (andFilter && andFilter.length) {
            objectFilter = { ...objectFilter, AND: andFilter };
        }

        const orFilter = prepareCriteria.filter((f) => f.filterType === FilterType.OR).map((f) => {
            return { Field: f.property, Operator: f.operator, Type: f.type, Value: f.value };
        });

        if (orFilter && orFilter.length) {
            objectFilter = { ...objectFilter, OR: orFilter };
        }

        return objectFilter;
    }

    private getSeconds(value: number, unit: string): number {
        switch (unit) {
            case 'm':
                return value * 60;
            case 'h':
                return value * 60 * 60;
            case 'd':
                return value * 60 * 60 * 24;
            case 'w':
                return value * 60 * 60 * 24 * 7;
            case 'M':
                return value * 60 * 60 * 24 * 30;
            case 'Y':
                return value * 60 * 60 * 24 * 365;
            default:
                return value;
        }
    }

    public static getDynamicFieldName(property: string): string {
        let name: string;
        if (KIXObjectAPIService.isDynamicFieldProperty(property)) {
            name = property.replace(/^DynamicFields?\.(.+)/, '$1');
        }
        return name;
    }

    public static isDynamicFieldProperty(property: string): boolean {
        return Boolean(property.match(/^DynamicFields?\..+/));
    }

    public async getPropertyValue(token: string, object: KIXObject, property: string): Promise<string> {
        return null;
    }

    public async getPropertyIcons(
        token: string, object: KIXObject, property: string
    ): Promise<Array<ObjectIcon | string>> {
        return null;
    }

    public async shouldPreload(token: string, objectType: KIXObjectType | string): Promise<boolean> {
        let preload = false;

        const service = await KIXObjectServiceRegistry.getServiceInstance(KIXObjectType.SYS_CONFIG_OPTION);
        if (service) {
            const agentPortalConfig = await (service as any).getAgentPortalConfiguration(token);
            preload = agentPortalConfig?.preloadObjects?.some((o) => o === objectType);
        }
        return preload;
    }
}

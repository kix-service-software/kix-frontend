import {
    SortOrder, KIXObjectType, KIXObject, FilterCriteria, FilterType,
    KIXObjectLoadingOptions, KIXObjectSpecificLoadingOptions, CreateLinkDescription,
    KIXObjectSpecificCreateOptions, KIXObjectSpecificDeleteOptions, ObjectIcon, ObjectIconLoadingOptions,
    KIXObjectCache, Error
} from '../../../model';
import { Query, CreateLink, CreateLinkRequest } from '../../../api';
import { IKIXObjectService } from '../../IKIXObjectService';
import { HttpService } from './HttpService';
import { LoggingService } from '../LoggingService';
import { KIXObjectServiceRegistry } from '../../KIXObjectServiceRegistry';

/**
 * Generic abstract class for all ObjectServices.
 *
 * <T> is the type of object which is handled by the service.
 *
 * The class provides generic methods to make get, update, create and delete requests against the REST-API.
 */
export abstract class KIXObjectService implements IKIXObjectService {

    protected httpService: HttpService = HttpService.getInstance();

    public abstract isServiceFor(kixObjectType: KIXObjectType): boolean;

    public initCache(): Promise<void> {
        return;
    }

    public updateCache(objectId: string | number): void {
        return;
    }

    public async loadObjects<O>(
        token: string, objectType: KIXObjectType, objectIds: Array<number | string>,
        loadingOptions: KIXObjectLoadingOptions, objectLoadingOptions: KIXObjectSpecificLoadingOptions
    ): Promise<O[]> {
        return [];
    }

    public abstract async createObject(
        token: string, objectType: KIXObjectType, parameter: Array<[string, string]>,
        createOptions?: KIXObjectSpecificCreateOptions
    ): Promise<string | number>;

    public abstract async updateObject(
        token: string, objectType: KIXObjectType, parameter: Array<[string, string]>,
        objectId: number | string, updateOptions?: KIXObjectSpecificCreateOptions
    ): Promise<string | number>;

    /**
     * The base uri to reach the object in the REST-API. Have to be implemented by each service
     */
    protected abstract RESOURCE_URI: string;

    protected prepareQuery(loadingOptions: KIXObjectLoadingOptions): any {
        let query = {};

        if (loadingOptions) {
            if (loadingOptions.limit) {
                query = { ...query, limit: loadingOptions.limit };
            }

            if (loadingOptions.properties && loadingOptions.properties.length) {
                query = { ...query, fields: loadingOptions.properties.join(',') };
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

        return await this.httpService.get<R>(this.RESOURCE_URI, query, token);
    }

    protected getObject<R>(token: string, objectId: number | string, query?: any): Promise<R> {
        const uri = this.buildUri(this.RESOURCE_URI, objectId);
        return this.getObjectByUri(token, uri, query);
    }

    protected async getObjectByUri<R>(token: string, uri: string, query?: any): Promise<R> {
        if (!query) {
            query = {};
        }

        return await this.httpService.get<R>(uri, query, token);
    }

    protected async sendCreateRequest<R, C>(token: string, uri: string, content: C): Promise<R> {
        return await this.httpService.post<R>(uri, content, token);
    }

    protected async sendUpdateRequest<R, C>(token: string, uri: string, content: C): Promise<R> {
        return await this.httpService.patch<R>(uri, content, token);
    }

    protected async sendDeleteRequest<R>(token: string, uri: string): Promise<R> {
        return await this.httpService.delete<R>(uri, token);
    }

    protected buildUri(...args): string {
        return args.join("/");
    }

    public async deleteObject(
        token: string, objectType: KIXObjectType, objectId: string | number,
        deleteOptions: KIXObjectSpecificDeleteOptions
    ): Promise<void> {
        return await this.sendDeleteRequest<void>(token, this.buildUri(this.RESOURCE_URI, objectId))
            .catch((error: Error) => {
                LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
                throw new Error(error.Code, error.Message);
            });
    }

    protected async createLinks(
        token: string, objectId: number, linkDescriptions: Array<CreateLinkDescription<KIXObject>>
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

                await this.sendCreateRequest(token, 'links', new CreateLinkRequest(link))
                    .catch((error: Error) => {
                        LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
                        throw new Error(error.Code, error.Message);
                    });
            }
        }
    }

    protected async createIcons(token: string, icon: ObjectIcon): Promise<void> {
        if (icon) {
            const iconService = KIXObjectServiceRegistry.getServiceInstance(
                KIXObjectType.OBJECT_ICON
            );
            if (iconService) {
                await iconService.createObject(token, KIXObjectType.OBJECT_ICON, [
                    ['Object', icon.Object],
                    ['ObjectID', icon.ObjectID.toString()],
                    ['ContentType', icon.ContentType],
                    ['Content', icon.Content]
                ]).catch((error: Error) => {
                    LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
                    throw new Error(error.Code, error.Message);
                });
                // TODO: cache-Handling überarbeiten
                KIXObjectCache.clearCache(KIXObjectType.OBJECT_ICON);
            }
        }
    }

    protected async updateIcon(token: string, icon: ObjectIcon): Promise<void> {
        if (icon) {
            const iconService = KIXObjectServiceRegistry.getServiceInstance(
                KIXObjectType.OBJECT_ICON
            );
            const icons = await iconService.loadObjects<ObjectIcon>(
                token, KIXObjectType.OBJECT_ICON, null, null, new ObjectIconLoadingOptions(icon.Object, icon.ObjectID)
            );
            if (icons && icons.length) {
                await iconService.updateObject(
                    token,
                    KIXObjectType.OBJECT_ICON, [
                        ['Object', icon.Object],
                        ['ObjectID', icon.ObjectID.toString()],
                        ['ContentType', icon.ContentType],
                        ['Content', icon.Content]
                    ],
                    icons[0].ID
                ).catch((error: Error) => {
                    LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
                    throw new Error(error.Code, error.Message);
                });
                // TODO: cache-Handling überarbeiten
                KIXObjectCache.clearCache(KIXObjectType.OBJECT_ICON);
            } else {
                this.createIcons(token, icon);
            }
        }
    }

    protected getParameterValue(parameter: Array<[string, any]>, property: string): any {
        const value = parameter.find((p) => p[0] === property);
        return value ? value[1] : undefined;
    }

    protected async buildFilter(
        filter: FilterCriteria[], filterProperty: string, token: string, query: any
    ): Promise<void> {
        let objectFilter = {};

        const andFilter = filter.filter((f) => f.filterType === FilterType.AND).map((f) => {
            return { Field: f.property, Operator: f.operator, Type: f.type, Value: f.value };
        });

        if (andFilter && andFilter.length) {
            objectFilter = {
                ...objectFilter,
                AND: andFilter
            };
        }

        const orFilter = filter.filter((f) => f.filterType === FilterType.OR).map((f) => {
            return { Field: f.property, Operator: f.operator, Type: f.type, Value: f.value };
        });

        if (orFilter && orFilter.length) {
            objectFilter = {
                ...objectFilter,
                OR: orFilter
            };
        }

        const apiFilter = {};
        apiFilter[filterProperty] = objectFilter;
        query.filter = JSON.stringify(apiFilter);
        query.search = JSON.stringify(apiFilter);
    }

}

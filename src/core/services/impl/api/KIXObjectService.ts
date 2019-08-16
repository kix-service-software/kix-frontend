/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import {
    SortOrder, KIXObjectType, KIXObject, FilterCriteria, FilterType,
    KIXObjectLoadingOptions, KIXObjectSpecificLoadingOptions, CreateLinkDescription,
    KIXObjectSpecificCreateOptions, KIXObjectSpecificDeleteOptions, ObjectIcon, ObjectIconLoadingOptions,
    Error, CreatePermissionDescription
} from '../../../model';
import { Query, CreateLink, CreateLinkRequest, RequestObject } from '../../../api';
import { IKIXObjectService } from '../../IKIXObjectService';
import { HttpService } from './HttpService';
import { LoggingService } from '../LoggingService';
import { KIXObjectServiceRegistry } from '../../KIXObjectServiceRegistry';
import { ObjectFactoryService } from '../../ObjectFactoryService';
import { RoleService } from './RoleService';
import { IObjectFactory } from '../../object-factories/IObjectFactory';

/**
 * Generic abstract class for all ObjectServices.
 *
 * The class provides generic methods to make get, update, create and delete requests against the REST-API.
 */
export abstract class KIXObjectService implements IKIXObjectService {

    protected httpService: HttpService = HttpService.getInstance();

    protected abstract objectType: KIXObjectType;

    protected abstract RESOURCE_URI: string;

    public constructor(factories: IObjectFactory[] = []) {
        factories.forEach((f) => ObjectFactoryService.registerFactory(f));
    }

    public abstract isServiceFor(kixObjectType: KIXObjectType): boolean;

    public async loadObjects<O extends KIXObject = any>(
        token: string, clientRequestId: string, objectType: KIXObjectType, objectIds: Array<number | string>,
        loadingOptions: KIXObjectLoadingOptions, objectLoadingOptions: KIXObjectSpecificLoadingOptions
    ): Promise<O[]> {
        throw new Error('-1', `Method loadObjects not implemented (${objectType})`);
    }

    protected async load<O extends KIXObject | string = any>(
        token: string, objectType: KIXObjectType, baseUri: string, loadingOptions: KIXObjectLoadingOptions,
        objectIds: Array<number | string>, responseProperty: string, useCache?: boolean
    ): Promise<O[]> {
        const query = this.prepareQuery(loadingOptions);
        if (loadingOptions && loadingOptions.filter && loadingOptions.filter.length) {
            await this.buildFilter(loadingOptions.filter, responseProperty, token, query);
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
        token: string, clientRequestId: string, objectType: KIXObjectType, parameter: Array<[string, string]>,
        createOptions: KIXObjectSpecificCreateOptions, cacheKeyPrefix: string
    ): Promise<string | number> {
        throw new Error('', "Method not implemented.");
    }

    public async updateObject(
        token: string, clientRequestId: string, objectType: KIXObjectType, parameter: Array<[string, string]>,
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
        token: string, clientRequestId: string, uri: string, cacheKeyPrefix: string
    ): Promise<R> {
        return await this.httpService.delete<R>(uri, token, clientRequestId, cacheKeyPrefix);
    }

    protected buildUri(...args): string {
        return args.join("/");
    }

    public async deleteObject(
        token: string, clientRequestId: string, objectType: KIXObjectType, objectId: string | number,
        deleteOptions: KIXObjectSpecificDeleteOptions, cacheKeyPrefix: string
    ): Promise<void> {
        return await this.sendDeleteRequest<void>(
            token, clientRequestId, this.buildUri(this.RESOURCE_URI, objectId), cacheKeyPrefix
        ).catch((error: Error) => {
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

    protected async setObjectPermissions(
        token: string, clientRequestId: string, permissions: CreatePermissionDescription[],
        resourcePath: string, objectType: KIXObjectType, objectId: string, forUpdate: boolean = false
    ): Promise<void> {
        if (resourcePath && objectId) {
            const target = `${resourcePath.match(/^\/.+/) ? resourcePath : '/' + resourcePath}/${objectId}`;
            if (forUpdate && objectType) {
                await this.deleteRolePermissions(token, clientRequestId, permissions, target, 2, objectType, objectId);
            }
            if (permissions && !!permissions.length) {
                this.setRolePermissions(token, clientRequestId, permissions, target, 2);
            }
        }
    }

    protected async setPropertyValuePermissions(
        token: string, clientRequestId: string, permissions: CreatePermissionDescription[],
        propertyString: string, objectType: KIXObjectType, objectId: string, forUpdate: boolean = false
    ): Promise<void> {
        if (objectId && propertyString) {
            // TODO: ggf. aus SysConfig relevanten String ermitteln
            const target = `{${propertyString} EQ ${objectId}}`;
            if (forUpdate && objectType) {
                await this.deleteRolePermissions(token, clientRequestId, permissions, target, 3, objectType, objectId);
            }
            if (permissions && !!permissions.length) {
                this.setRolePermissions(token, clientRequestId, permissions, target, 3);
            }
        }
    }

    private async deleteRolePermissions(
        token: string, clientRequestId: string, permissions: CreatePermissionDescription[],
        target: string, permissionType: number, objectType: KIXObjectType, objectId: string
    ): Promise<void> {
        const roleService = KIXObjectServiceRegistry.getServiceInstance<RoleService>(
            KIXObjectType.ROLE
        );
        if (roleService) {
            const objects = await this.loadObjects(token, clientRequestId, objectType, [objectId],
                new KIXObjectLoadingOptions(
                    null, null, null, ['ConfiguredPermissions'], null,
                    [['fields', `${objectType}.ConfiguredPermissions`]]
                ), null
            );
            if (
                objects && !!objects.length && (objects[0] as KIXObject).ConfiguredPermissions
            ) {
                let existingPermissions = (objects[0] as KIXObject).ConfiguredPermissions.Assigned;
                if (permissionType === 3) {
                    existingPermissions = (objects[0] as KIXObject).ConfiguredPermissions.DependingObjects;
                }
                const permissionsToDelete = existingPermissions.filter(
                    (p) => !permissions || !!!permissions.length || !permissions.some(
                        (cp) => cp.RoleID === p.RoleID && permissionType === p.TypeID && target === p.Target
                    )
                );
                if (!!permissionsToDelete.length) {
                    for (const permission of permissionsToDelete) {
                        await roleService.deletePermission(token, clientRequestId, permission.RoleID, permission.ID);
                    }
                }
            }
        }
    }

    private async setRolePermissions(
        token: string, clientRequestId: string, permissions: CreatePermissionDescription[], target: string,
        permissionType: number
    ): Promise<void> {
        const roleService = KIXObjectServiceRegistry.getServiceInstance<RoleService>(
            KIXObjectType.ROLE
        );
        if (roleService) {
            const preparedPermissions = await this.getPermissionsPerRole(permissions, permissionType, target);
            for (const pp of preparedPermissions) {
                await roleService.setPermissions(
                    token, clientRequestId, pp[0], pp[1], false
                );
            }
        }
    }

    private async getPermissionsPerRole(
        permissions: CreatePermissionDescription[], permissionTypeId: number, target: string
    ): Promise<Array<[number, CreatePermissionDescription[]]>> {
        const permissionsByRoleId: Array<[number, CreatePermissionDescription[]]> = [];
        permissions.forEach((p) => {
            p.TypeID = permissionTypeId;
            p.Target = target;
            const pByRoleId = permissionsByRoleId.find((pbri) => pbri[0] === p.RoleID);
            if (pByRoleId) {
                pByRoleId[1].push(p);
            } else {
                permissionsByRoleId.push([p.RoleID, [p]]);
            }
        });
        return permissionsByRoleId;
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

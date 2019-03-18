import {
    RolesResponse, CreateRole, CreateRoleResponse, CreateRoleRequest,
    UpdateRole, UpdateRoleResponse, UpdateRoleRequest
} from '../../../api';
import {
    Role, KIXObjectType, KIXObjectLoadingOptions, KIXObjectSpecificLoadingOptions,
    KIXObjectSpecificCreateOptions, KIXObjectCache, ObjectIcon, Error
} from '../../../model';

import { KIXObjectService } from './KIXObjectService';
import { KIXObjectServiceRegistry } from '../../KIXObjectServiceRegistry';
import { ConfigurationService } from '../ConfigurationService';
import { LoggingService } from '../LoggingService';

export class RoleService extends KIXObjectService {

    private static INSTANCE: RoleService;

    public static getInstance(): RoleService {
        if (!RoleService.INSTANCE) {
            RoleService.INSTANCE = new RoleService();
        }
        return RoleService.INSTANCE;
    }

    protected RESOURCE_URI: string = 'roles';

    public kixObjectType: KIXObjectType = KIXObjectType.ROLE;

    private constructor() {
        super();
        KIXObjectServiceRegistry.registerServiceInstance(this);
    }

    public isServiceFor(kixObjectType: KIXObjectType): boolean {
        return kixObjectType === KIXObjectType.ROLE;
    }

    public async initCache(): Promise<void> {
        const serverConfig = ConfigurationService.getInstance().getServerConfiguration();
        const token = serverConfig.BACKEND_API_TOKEN;

        await this.getRoles(token);
    }

    public async loadObjects<T>(
        token: string, objectType: KIXObjectType, objectIds: Array<number | string>,
        loadingOptions: KIXObjectLoadingOptions, objectLoadingOptions: KIXObjectSpecificLoadingOptions
    ): Promise<T[]> {

        let objects = [];
        if (objectType === KIXObjectType.ROLE) {
            const roles = await this.getRoles(token);
            if (objectIds && objectIds.length) {
                objects = roles.filter((t) => objectIds.some((oid) => oid === t.ObjectId));
            } else {
                objects = roles;
            }
        }

        return objects;
    }

    public async createObject(
        token: string, objectType: KIXObjectType, parameter: Array<[string, any]>,
        createOptions?: KIXObjectSpecificCreateOptions
    ): Promise<number> {
        const createRole = new CreateRole(parameter);

        const response = await this.sendCreateRequest<CreateRoleResponse, CreateRoleRequest>(
            token, this.RESOURCE_URI, new CreateRoleRequest(createRole)
        ).catch((error: Error) => {
            LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
            throw new Error(error.Code, error.Message);
        });

        const icon: ObjectIcon = this.getParameterValue(parameter, 'ICON');
        if (icon) {
            icon.Object = 'Role';
            icon.ObjectID = response.RoleID;
            await this.createIcons(token, icon);
        }

        return response.RoleID;
    }

    public async updateObject(
        token: string, objectType: KIXObjectType, parameter: Array<[string, any]>, objectId: number | string
    ): Promise<string | number> {
        const updateRole = new UpdateRole(parameter);

        const response = await this.sendUpdateRequest<UpdateRoleResponse, UpdateRoleRequest>(
            token, this.buildUri(this.RESOURCE_URI, objectId), new UpdateRoleRequest(updateRole)
        ).catch((error: Error) => {
            LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
            throw new Error(error.Code, error.Message);
        });

        const icon: ObjectIcon = this.getParameterValue(parameter, 'ICON');
        if (icon) {
            icon.Object = 'Role';
            icon.ObjectID = response.RoleID;
            await this.updateIcon(token, icon);
        }

        return response.RoleID;
    }

    public async getRoles(token: string): Promise<Role[]> {
        if (!KIXObjectCache.hasObjectCache(KIXObjectType.ROLE)) {
            const uri = this.buildUri(this.RESOURCE_URI);
            const response = await this.getObjectByUri<RolesResponse>(token, uri, {
                sort: 'Role.Name'
            });
            response.Role
                .map((t) => new Role(t))
                .forEach((t) => KIXObjectCache.addObject(KIXObjectType.ROLE, t));
        }
        return KIXObjectCache.getObjectCache(KIXObjectType.ROLE);
    }
}

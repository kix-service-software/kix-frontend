import {
    RolesResponse, CreateRole, CreateRoleResponse, CreateRoleRequest,
    UpdateRole, UpdateRoleResponse, UpdateRoleRequest
} from '../../../api';
import {
    Role, KIXObjectType, KIXObjectLoadingOptions, KIXObjectSpecificLoadingOptions,
    KIXObjectSpecificCreateOptions, ObjectIcon, Error, RoleFactory, KIXObject
} from '../../../model';

import { KIXObjectService } from './KIXObjectService';
import { KIXObjectServiceRegistry } from '../../KIXObjectServiceRegistry';
import { ConfigurationService } from '../ConfigurationService';
import { LoggingService } from '../LoggingService';

export class RoleService extends KIXObjectService {

    protected objectType: KIXObjectType = KIXObjectType.ROLE;

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
        super([new RoleFactory()]);
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

    public async loadObjects<T extends KIXObject = any>(
        token: string, clientRequestId: string, objectType: KIXObjectType, objectIds: Array<number | string>,
        loadingOptions: KIXObjectLoadingOptions, objectLoadingOptions: KIXObjectSpecificLoadingOptions
    ): Promise<T[]> {
        return await super.load(
            token, this.objectType, this.RESOURCE_URI, loadingOptions, objectIds, KIXObjectType.ROLE
        );
    }

    public async createObject(
        token: string, clientRequestId: string, objectType: KIXObjectType, parameter: Array<[string, any]>,
        createOptions?: KIXObjectSpecificCreateOptions
    ): Promise<number> {
        const createRole = new CreateRole(parameter);

        const response = await this.sendCreateRequest<CreateRoleResponse, CreateRoleRequest>(
            token, clientRequestId, this.RESOURCE_URI, new CreateRoleRequest(createRole), this.objectType
        ).catch((error: Error) => {
            LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
            throw new Error(error.Code, error.Message);
        });

        const icon: ObjectIcon = this.getParameterValue(parameter, 'ICON');
        if (icon) {
            icon.Object = 'Role';
            icon.ObjectID = response.RoleID;
            await this.createIcons(token, clientRequestId, icon);
        }

        return response.RoleID;
    }

    public async updateObject(
        token: string, clientRequestId: string, objectType: KIXObjectType,
        parameter: Array<[string, any]>, objectId: number | string
    ): Promise<string | number> {
        const updateRole = new UpdateRole(parameter);

        const response = await this.sendUpdateRequest<UpdateRoleResponse, UpdateRoleRequest>(
            token, clientRequestId, this.buildUri(this.RESOURCE_URI, objectId), new UpdateRoleRequest(updateRole),
            this.objectType
        ).catch((error: Error) => {
            LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
            throw new Error(error.Code, error.Message);
        });

        const icon: ObjectIcon = this.getParameterValue(parameter, 'ICON');
        if (icon) {
            icon.Object = 'Role';
            icon.ObjectID = response.RoleID;
            await this.updateIcon(token, clientRequestId, icon);
        }

        return response.RoleID;
    }

    public async getRoles(token: string): Promise<Role[]> {
        const uri = this.buildUri(this.RESOURCE_URI);
        const response = await this.getObjectByUri<RolesResponse>(token, uri, {
            sort: 'Role.Name'
        });
        return response.Role.map((t) => new Role(t));
    }
}

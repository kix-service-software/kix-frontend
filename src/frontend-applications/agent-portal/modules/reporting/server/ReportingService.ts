/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectType } from '../../../model/kix/KIXObjectType';
import { KIXObjectServiceRegistry } from '../../../server/services/KIXObjectServiceRegistry';
import { KIXObjectLoadingOptions } from '../../../model/KIXObjectLoadingOptions';
import { LoggingService } from '../../../../../server/services/LoggingService';
import { KIXObjectAPIService } from '../../../server/services/KIXObjectAPIService';
import { Error } from '../../../../../server/model/Error';
import { ReportDefinition } from '../model/ReportDefinition';
import { FilterCriteria } from '../../../model/FilterCriteria';
import { ReportDefinitionProperty } from '../model/ReportDefinitionProperty';
import { KIXObjectSpecificLoadingOptions } from '../../../model/KIXObjectSpecificLoadingOptions';
import { Report } from '../model/Report';
import { ReportResultLoadingOptions } from '../model/ReportResultLoadingOptions';
import { ReportResult } from '../model/ReportResult';
import { ReportOutputFormat } from '../model/ReportOutputFormat';
import { DataSource } from '../model/DataSource';
import { KIXObjectSpecificCreateOptions } from '../../../model/KIXObjectSpecificCreateOptions';
import { ConfigurationService } from '../../../../../server/services/ConfigurationService';
import { RoleService } from '../../user/server/RoleService';
import { RoleProperty } from '../../user/model/RoleProperty';
import { Role } from '../../user/model/Role';
import { CreatePermissionDescription } from '../../user/server/CreatePermissionDescription';
import { KIXObjectSpecificDeleteOptions } from '../../../model/KIXObjectSpecificDeleteOptions';
import { Permission } from '../../user/model/Permission';

export class ReportingAPIService extends KIXObjectAPIService {

    private static INSTANCE: ReportingAPIService;

    protected enableSearchQuery: boolean = false;

    public static getInstance(): ReportingAPIService {
        if (!ReportingAPIService.INSTANCE) {
            ReportingAPIService.INSTANCE = new ReportingAPIService();
        }
        return ReportingAPIService.INSTANCE;
    }

    protected RESOURCE_URI: string = 'reporting';

    public objectType: KIXObjectType = KIXObjectType.REPORT_DEFINITION;

    private constructor() {
        super();
        KIXObjectServiceRegistry.registerServiceInstance(this);
    }

    public isServiceFor(kixObjectType: KIXObjectType): boolean {
        return kixObjectType === KIXObjectType.REPORT_DEFINITION
            || kixObjectType === KIXObjectType.REPORT
            || kixObjectType === KIXObjectType.REPORT_RESULT
            || kixObjectType === KIXObjectType.REPORT_DATA_SOURCE
            || kixObjectType === KIXObjectType.REPORT_OUTPUT_FORMAT;
    }

    public async loadObjects<T>(
        token: string, clientRequestId: string, objectType: KIXObjectType,
        objectIds: string[], loadingOptions: KIXObjectLoadingOptions,
        objectLoadingOptions: KIXObjectSpecificLoadingOptions
    ): Promise<T[]> {

        let objects = [];

        if (objectType === KIXObjectType.REPORT_DEFINITION) {
            const uri = this.buildUri(this.RESOURCE_URI, 'reportdefinitions');
            objects = await super.load(
                token, KIXObjectType.REPORT_DEFINITION, uri, loadingOptions, objectIds,
                KIXObjectType.REPORT_DEFINITION, ReportDefinition
            );
        } else if (objectType === KIXObjectType.REPORT) {
            const uri = this.buildUri(
                this.RESOURCE_URI, 'reports'
            );
            objects = await super.load(
                token, KIXObjectType.REPORT, uri, loadingOptions, objectIds,
                KIXObjectType.REPORT, Report
            );
        } else if (objectType === KIXObjectType.REPORT_RESULT) {
            const uri = this.buildUri(
                this.RESOURCE_URI, 'reports',
                (objectLoadingOptions as ReportResultLoadingOptions).reportId, 'results'
            );
            objects = await super.load(
                token, KIXObjectType.REPORT_RESULT, uri, loadingOptions, objectIds,
                KIXObjectType.REPORT_RESULT, ReportResult
            );
        } else if (objectType === KIXObjectType.REPORT_DATA_SOURCE) {
            const uri = this.buildUri(this.RESOURCE_URI, 'datasources');
            objects = await super.load(
                token, KIXObjectType.REPORT_DATA_SOURCE, uri, loadingOptions, objectIds,
                KIXObjectType.REPORT_DATA_SOURCE, DataSource
            );
        } else if (objectType === KIXObjectType.REPORT_OUTPUT_FORMAT) {
            const uri = this.buildUri(this.RESOURCE_URI, 'outputformats');
            objects = await super.load(
                token, KIXObjectType.REPORT_OUTPUT_FORMAT, uri, loadingOptions, objectIds,
                KIXObjectType.REPORT_OUTPUT_FORMAT, ReportOutputFormat
            );
        }

        return objects;
    }

    public async createObject(
        token: string, clientRequestId: string, objectType: KIXObjectType, parameter: Array<[string, any]>,
        createOptions?: KIXObjectSpecificCreateOptions
    ): Promise<number> {
        if (objectType === KIXObjectType.REPORT_DEFINITION) {
            const reportDefinition = parameter.find((p) => p[0] === KIXObjectType.REPORT_DEFINITION);
            if (reportDefinition && reportDefinition[1]) {
                const response = await this.sendCreateRequest(
                    token, clientRequestId,
                    this.buildUri(this.RESOURCE_URI, 'reportdefinitions'),
                    {
                        ReportDefinition: reportDefinition[1]
                    },
                    KIXObjectType.REPORT_DEFINITION
                ).catch((error: Error) => {
                    LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
                    throw new Error(error.Code, error.Message);
                });

                const id = response['ReportDefinitionID'];

                const roleIds = parameter.find((p) => p[0] === ReportDefinitionProperty.ROLE_IDS)
                    || [ReportDefinitionProperty.ROLE_IDS, []];

                if (roleIds && Array.isArray(roleIds[1])) {
                    await this.updatePermissions(id, roleIds[1]);
                }

                return id;
            } else {
                throw new Error('1', 'Missing required parameter ReportDefinition.');
            }
        } else if (objectType === KIXObjectType.REPORT) {
            const uri = this.buildUri(this.RESOURCE_URI, 'reports');
            const reportParameter = parameter.find((p) => p[0] === KIXObjectType.REPORT);

            const response = await this.sendCreateRequest(
                token, clientRequestId, uri, { Report: reportParameter[1] }, this.objectType
            ).catch((error: Error) => {
                LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
                throw new Error(error.Code, error.Message);
            });

            return response['ReportID'];
        }
    }

    public async updateObject(
        token: string, clientRequestId: string, objectType: KIXObjectType,
        parameter: Array<[string, any]>, objectId: number | string
    ): Promise<string | number> {
        if (objectType === KIXObjectType.REPORT_DEFINITION) {

            const reportDefinition = parameter.find((p) => p[0] === KIXObjectType.REPORT_DEFINITION);

            const response = await this.sendUpdateRequest(
                token, clientRequestId,
                this.buildUri(this.RESOURCE_URI, 'reportdefinitions', objectId),
                {
                    ReportDefinition: reportDefinition[1]
                },
                KIXObjectType.REPORT_DEFINITION
            ).catch((error: Error) => {
                LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
                throw new Error(error.Code, error.Message);
            });

            const id = response['ReportDefinitionID'];
            const roleIds = parameter.find((p) => p[0] === ReportDefinitionProperty.ROLE_IDS);
            if (roleIds && Array.isArray(roleIds[1])) {
                await this.updatePermissions(id, roleIds[1]);
            }

            return id;
        }
    }

    public async deleteObject(
        token: string, clientRequestId: string, objectType: KIXObjectType | string, objectId: string | number,
        deleteOptions: KIXObjectSpecificDeleteOptions, cacheKeyPrefix: string, ressourceUri: string = this.RESOURCE_URI
    ): Promise<Error[]> {
        if (objectType === KIXObjectType.REPORT) {
            ressourceUri = this.buildUri(this.RESOURCE_URI, 'reports');
        }
        else if (objectType === KIXObjectType.REPORT_DEFINITION) {
            ressourceUri = this.buildUri(
                this.RESOURCE_URI, 'reportdefinitions'
            );
        }
        return super.deleteObject(token, clientRequestId, objectType, objectId, null, objectType, ressourceUri);
    }

    public async prepareAPISearch(criteria: FilterCriteria[], token: string): Promise<FilterCriteria[]> {
        return criteria.filter(
            (c) => c.property === ReportDefinitionProperty.NAME
                || c.property === ReportDefinitionProperty.DATASOURCE
        );
    }

    private async updatePermissions(reportDefinitionId: number, roleIds: number[]): Promise<void> {
        if (!roleIds) {
            roleIds = [];
        }

        const config = ConfigurationService.getInstance().getServerConfiguration();
        const token = config.BACKEND_API_TOKEN;

        const loadingOptions = new KIXObjectLoadingOptions(null, null, null, [RoleProperty.PERMISSIONS]);
        const roles = await RoleService.getInstance().loadObjects<Role>(
            token, 'ReportingService', KIXObjectType.ROLE, null, loadingOptions, null
        ).catch((error): Role[] => {
            LoggingService.getInstance().error(
                `Could not load assigned roles from report definition with id ${reportDefinitionId}`
            );
            LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
            return [];
        });

        const permissionRessourceTypeId = await RoleService.getInstance().getPermissionTypeId('Resource', token);
        const permissionObjectTypeId = await RoleService.getInstance().getPermissionTypeId('Object', token);

        const permissionsToCheck: Permission[] = [];
        const reportDefinitionPermission = new Permission();
        reportDefinitionPermission.Target = `/reporting/reportdefinitions/${reportDefinitionId}`;
        reportDefinitionPermission.TypeID = permissionRessourceTypeId;
        reportDefinitionPermission.Value = 2;
        permissionsToCheck.push(reportDefinitionPermission);

        const reportReadPermission = new Permission();
        reportReadPermission.Target = `/reporting/reports/*{Report.DefinitionID EQ ${reportDefinitionId}}`;
        reportReadPermission.TypeID = permissionObjectTypeId;
        reportReadPermission.Value = 2;
        permissionsToCheck.push(reportReadPermission);

        const reportCreatePermission = new Permission();
        reportCreatePermission.Target = `/reporting/reports{Report.DefinitionID EQ ${reportDefinitionId}}`;
        reportCreatePermission.TypeID = permissionObjectTypeId;
        reportCreatePermission.Value = 3;
        permissionsToCheck.push(reportCreatePermission);

        if (roles && roles.length) {
            for (const role of roles) {
                if (role.Permissions) {
                    const isRoleAssinged = roleIds.some((rid) => rid === role.ID);
                    for (const permission of permissionsToCheck) {
                        const rolePermission = role.Permissions.find((p) =>
                            p.TypeID === permission.TypeID &&
                            p.Value === permission.Value &&
                            p.Target === permission.Target
                        );

                        if (rolePermission && !isRoleAssinged) {
                            await RoleService.getInstance().deletePermission(
                                token, 'ReportingService', role.ID, rolePermission.ID
                            ).catch((error) => {
                                LoggingService.getInstance().error(
                                    // tslint:disable-next-line: max-line-length
                                    `Could not delete permission with id ${permission.ID} for report definition with id ${reportDefinitionId}`
                                );
                                LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
                            });
                        } else if (!rolePermission && isRoleAssinged) {
                            const newPermission = new CreatePermissionDescription(
                                permission.TypeID, permission.Target, 0, permission.Value,
                                `Read & Create permission for report definition with id ${reportDefinitionId}.`
                            );
                            RoleService.getInstance().createPermissions(
                                token, 'ReportingService', role.ID, [], [newPermission]
                            );
                        }
                    }
                }
            }
        }
    }

}

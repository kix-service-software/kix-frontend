/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectAPIService } from '../../../server/services/KIXObjectAPIService';
import { KIXObjectServiceRegistry } from '../../../server/services/KIXObjectServiceRegistry';
import { KIXObjectType } from '../../../model/kix/KIXObjectType';
import { KIXObjectLoadingOptions } from '../../../model/KIXObjectLoadingOptions';
import { KIXObjectSpecificLoadingOptions } from '../../../model/KIXObjectSpecificLoadingOptions';
import { HttpService } from '../../../server/services/HttpService';
import { KIXObjectSpecificCreateOptions } from '../../../model/KIXObjectSpecificCreateOptions';
import { LoggingService } from '../../../../../server/services/LoggingService';
import { PreferencesLoadingOptions } from '../model/PreferencesLoadingOptions';
import { User } from '../model/User';
import { PersonalSettingsProperty } from '../model/PersonalSettingsProperty';
import { SetPreferenceOptions } from '../model/SetPreferenceOptions';
import { UserPreference } from '../model/UserPreference';
import { Error } from '../../../../../server/model/Error';
import { UserProperty } from '../model/UserProperty';
import { FilterCriteria } from '../../../model/FilterCriteria';
import { SearchOperator } from '../../search/model/SearchOperator';
import { KIXObjectProperty } from '../../../model/kix/KIXObjectProperty';

export class UserService extends KIXObjectAPIService {

    private static INSTANCE: UserService;

    public static getInstance(): UserService {
        if (!UserService.INSTANCE) {
            UserService.INSTANCE = new UserService();
        }
        return UserService.INSTANCE;
    }

    private constructor() {
        super();
        KIXObjectServiceRegistry.registerServiceInstance(this);
    }

    protected RESOURCE_URI: string = this.buildUri('system', 'users');

    public objectType: KIXObjectType | string = KIXObjectType.USER;

    public isServiceFor(kixObjectType: KIXObjectType | string): boolean {
        return kixObjectType === KIXObjectType.USER
            || kixObjectType === KIXObjectType.USER_PREFERENCE;
    }

    public async loadObjects<T>(
        token: string, clientRequestId: string, objectType: KIXObjectType | string, objectIds: Array<number | string>,
        loadingOptions: KIXObjectLoadingOptions, objectLoadingOptions: KIXObjectSpecificLoadingOptions
    ): Promise<T[]> {

        let objects = [];
        if (objectType === KIXObjectType.USER) {
            objects = await super.load(
                token, KIXObjectType.USER, this.RESOURCE_URI, loadingOptions, objectIds, KIXObjectType.USER, User
            );
        } else if (objectType === KIXObjectType.USER_PREFERENCE) {
            let uri = this.buildUri('session', 'user', 'preferences');
            const preferenceOptions = (objectLoadingOptions as PreferencesLoadingOptions);
            if (preferenceOptions && preferenceOptions.userId) {
                uri = this.buildUri(this.RESOURCE_URI, preferenceOptions.userId, 'preferences');
            }

            objects = await super.load(
                token, KIXObjectType.USER_PREFERENCE, uri, loadingOptions, objectIds, KIXObjectType.USER_PREFERENCE,
                UserPreference
            );
        }

        return objects;
    }

    public async getUserByToken(token: string): Promise<User> {
        const user = await HttpService.getInstance().getUserByToken(token);
        return user;
    }

    public async createObject(
        token: string, clientRequestId: string, objectType: KIXObjectType | string, parameter: Array<[string, any]>,
        createOptions?: KIXObjectSpecificCreateOptions
    ): Promise<string | number> {
        if (objectType === KIXObjectType.USER) {
            const preferences = [];

            const createParameter = parameter.filter((p) =>
                p[0] !== PersonalSettingsProperty.USER_LANGUAGE &&
                p[0] !== PersonalSettingsProperty.MY_QUEUES &&
                p[0] !== PersonalSettingsProperty.NOTIFICATIONS
            );

            const userLanguage = parameter.find((p) => p[0] === PersonalSettingsProperty.USER_LANGUAGE);
            if (userLanguage) {
                preferences.push({ ID: PersonalSettingsProperty.USER_LANGUAGE, Value: userLanguage[1] });
            }

            const myQueues = parameter.find((p) => p[0] === PersonalSettingsProperty.MY_QUEUES);
            if (myQueues) {
                myQueues[1] = myQueues[1] === null ? '' : myQueues[1];
                preferences.push({ ID: PersonalSettingsProperty.MY_QUEUES, Value: myQueues[1] });
            }

            const notifications = parameter.find((p) => p[0] === PersonalSettingsProperty.NOTIFICATIONS);
            if (notifications) {
                preferences.push({ ID: PersonalSettingsProperty.NOTIFICATIONS, Value: notifications[1] });
            }

            createParameter.push([UserProperty.PREFERENCES, preferences]);

            const id = await super.executeUpdateOrCreateRequest(
                token, clientRequestId, createParameter, this.RESOURCE_URI, this.objectType, 'UserID', true
            );

            return id;
        } else if (objectType === KIXObjectType.USER_PREFERENCE) {
            let uri = this.buildUri('session', 'user', 'preferences');
            if (createOptions) {
                const userId = (createOptions as SetPreferenceOptions).userId;
                if (userId) {
                    uri = this.buildUri(this.RESOURCE_URI, userId, 'preferences');
                }
            }

            return await super.executeUpdateOrCreateRequest(
                token, clientRequestId, parameter, uri, objectType, 'UserPreferenceID', true
            ).catch((error: Error) => {
                LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
                throw new Error(error.Code, error.Message);
            });

        }
    }

    public async updateObject(
        token: string, clientRequestId: string, objectType: KIXObjectType | string,
        parameter: Array<[string, any]>, objectId: number | string,
        updateOptions?: KIXObjectSpecificCreateOptions
    ): Promise<string | number> {
        if (objectType === KIXObjectType.USER) {
            const userPassword = this.getParameterValue(parameter, UserProperty.USER_PASSWORD);
            if (!userPassword || userPassword === '') {
                parameter = parameter.filter((p) => p[0] !== UserProperty.USER_PASSWORD);
            }

            const updateParameter = parameter.filter((p) =>
                p[0] !== PersonalSettingsProperty.USER_LANGUAGE &&
                p[0] !== PersonalSettingsProperty.MY_QUEUES &&
                p[0] !== PersonalSettingsProperty.NOTIFICATIONS &&
                p[0] !== UserProperty.ROLE_IDS &&
                p[0] !== UserProperty.PREFERENCES
            );

            const userId = Number(objectId);

            const uri = this.buildUri(this.RESOURCE_URI, userId);
            const id = await super.executeUpdateOrCreateRequest(
                token, clientRequestId, updateParameter, uri, this.objectType, 'UserID'
            ).catch((error: Error) => {
                LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
                throw new Error(error.Code, error.Message);
            });

            const roleIds = this.getParameterValue(parameter, UserProperty.ROLE_IDS);
            if (roleIds) {
                await this.updateUserRoles(
                    token, clientRequestId, Array.isArray(roleIds) ? roleIds : [roleIds], userId
                );
            }

            const userLanguage = parameter.find((p) => p[0] === PersonalSettingsProperty.USER_LANGUAGE);
            if (userLanguage) {
                await this.setPreferences(token, clientRequestId, [userLanguage], userId);
            }

            const myQueues = parameter.find((p) => p[0] === PersonalSettingsProperty.MY_QUEUES);
            if (myQueues) {
                await this.setPreferences(token, clientRequestId, [myQueues], userId);
            }

            const notifications = parameter.find((p) => p[0] === PersonalSettingsProperty.NOTIFICATIONS);
            if (notifications) {
                await this.setPreferences(token, clientRequestId, [notifications], userId);
            }

            const contextWIdgetLists = parameter.find((p) => p[0] === PersonalSettingsProperty.CONTEXT_WIDGET_LISTS);
            if (contextWIdgetLists) {
                await this.setPreferences(token, clientRequestId, [contextWIdgetLists], userId);
            }

            return id;
        } else if (objectType === KIXObjectType.USER_PREFERENCE) {
            let uri = this.buildUri('session', 'user', 'preferences', objectId);
            if (updateOptions) {
                const userId = (updateOptions as SetPreferenceOptions).userId;
                if (userId) {
                    uri = this.buildUri(this.RESOURCE_URI, userId, 'preferences', objectId);
                }
            }
            const id = await super.executeUpdateOrCreateRequest(
                token, clientRequestId, parameter, uri, objectType, 'UserPreferenceID'
            );
            return id;
        }
    }

    private async updateUserRoles(
        token: string, clientReqeustId: string, roleIds: number[], userId: number
    ): Promise<void> {
        if (!roleIds) {
            roleIds = [];
        }

        const baseUri = this.buildUri(this.RESOURCE_URI, userId, 'roleids');
        const existingRoleIds = await this.load<number>(token, null, baseUri, null, null, 'RoleIDs', null, false);

        const rolesToDelete = existingRoleIds ? existingRoleIds.filter((r) => !roleIds.some((rid) => rid === r)) : [];
        const rolesToCreate = existingRoleIds
            ? roleIds.filter((r) => !existingRoleIds.some((rid) => rid === r))
            : roleIds;

        if (rolesToDelete && rolesToDelete.length) {
            const deleteUris = rolesToDelete.map((roleId) => this.buildUri(baseUri, roleId));
            const errors: Error[] = await this.sendDeleteRequest(token, clientReqeustId, deleteUris, KIXObjectType.USER)
                .catch((error) => [error]);
            errors.forEach((e) => LoggingService.getInstance().error(`${e.Code}: ${e.Message}`, e));
        }

        for (const roleId of rolesToCreate) {
            await this.sendCreateRequest(token, clientReqeustId, baseUri, { RoleID: roleId }, KIXObjectType.USER)
                .catch((error) => LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error));
        }

    }

    public async setPreferences(
        token: string, clientRequestId: string, parameter: Array<[string, any]>, userId?: number
    ): Promise<void> {
        const currentPreferences = await this.loadObjects<UserPreference>(
            token, null, KIXObjectType.USER_PREFERENCE, null, null,
            userId ? new PreferencesLoadingOptions(userId) : null
        );
        const errors: Error[] = [];

        const options = userId ? new SetPreferenceOptions(userId) : undefined;

        parameter = parameter.filter((p) =>
            p[0] !== PersonalSettingsProperty.CURRENT_PASSWORD &&
            p[0] !== PersonalSettingsProperty.USER_PASSWORD_CONFIRM
        );

        for (const param of parameter) {

            if (param[0] === PersonalSettingsProperty.USER_PASSWORD) {
                if (param[1] !== null && param[1] !== '') {
                    await this.executeUpdateOrCreateRequest(
                        token, clientRequestId, [[UserProperty.USER_PASSWORD, param[1]]],
                        this.buildUri('session', 'user'), KIXObjectType.USER, 'User'
                    );
                }
            } else if (currentPreferences.some((p) => p.ID === param[0])) {
                const paramValue = param[1] === null ? '' : param[1];
                if (
                    paramValue && (typeof paramValue === 'string' || (Array.isArray(paramValue) && paramValue.length))
                ) {
                    await this.updateObject(
                        token, clientRequestId, KIXObjectType.USER_PREFERENCE,
                        [
                            ['Value', paramValue]
                        ],
                        param[0], options
                    ).catch((error: Error) => {
                        errors.push(error);
                    });
                } else {
                    const uri = this.buildUri('system', 'users', userId, 'preferences', param[0]);
                    await this.sendDeleteRequest<void>(token, clientRequestId, [uri], KIXObjectType.USER_PREFERENCE)
                        .catch((error: Error) => {
                            LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
                            throw new Error(error.Code, error.Message);
                        });
                }
            } else {
                const paramValue = param[1] === null ? '' : param[1];
                await this.createObject(
                    token, clientRequestId, KIXObjectType.USER_PREFERENCE,
                    [
                        ['ID', param[0]],
                        ['Value', paramValue]
                    ],
                    options
                ).catch((error: Error) => {
                    errors.push(error);
                });
            }
        }
        if (!!errors.length) {
            throw new Error(errors[0].Code, errors.map((e) => e.Message).join('\n'), errors[0].StatusCode);
        }
    }

    public async prepareAPIFilter(criteria: FilterCriteria[], token: string): Promise<FilterCriteria[]> {
        const filterProperties = [
            KIXObjectProperty.VALID_ID,
            UserProperty.IS_AGENT,
            UserProperty.IS_CUSTOMER,
            UserProperty.USAGE_CONTEXT
        ];
        const filterCriteria = criteria.filter((f) => filterProperties.some((fp) => f.property === fp));
        return filterCriteria;
    }

    public async prepareAPISearch(criteria: FilterCriteria[], token: string): Promise<FilterCriteria[]> {
        const searchProperties = [
            UserProperty.USER_LOGIN,
            'Search'
        ];

        const searchCriteria = criteria.filter(
            (f) => searchProperties.some((sp) => sp === f.property) && f.operator !== SearchOperator.NOT_EQUALS
        );

        return searchCriteria;
    }

}

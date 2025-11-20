/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AgentSocketClient } from './AgentSocketClient';
import { User } from '../../model/User';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { AuthenticationSocketClient } from '../../../../modules/base-components/webapp/core/AuthenticationSocketClient';
import { PersonalSetting } from '../../model/PersonalSetting';
import { KIXObjectService } from '../../../../modules/base-components/webapp/core/KIXObjectService';
import { ServiceRegistry } from '../../../../modules/base-components/webapp/core/ServiceRegistry';
import { ServiceType } from '../../../../modules/base-components/webapp/core/ServiceType';
import { EventService } from '../../../base-components/webapp/core/EventService';
import { ApplicationEvent } from '../../../base-components/webapp/core/ApplicationEvent';
import { KIXObject } from '../../../../model/kix/KIXObject';
import { KIXObjectLoadingOptions } from '../../../../model/KIXObjectLoadingOptions';
import { KIXObjectSpecificLoadingOptions } from '../../../../model/KIXObjectSpecificLoadingOptions';
import { KIXObjectFormService } from '../../../base-components/webapp/core/KIXObjectFormService';
import { FilterCriteria } from '../../../../model/FilterCriteria';
import { SearchOperator } from '../../../search/model/SearchOperator';
import { FilterDataType } from '../../../../model/FilterDataType';
import { FilterType } from '../../../../model/FilterType';
import { UserPreference } from '../../model/UserPreference';
import { Counter } from '../../model/Counter';
import { LoginResult } from '../../../base-components/model/LoginResult';
import { MFAToken } from '../../../multifactor-authentication/model/MFAToken';
import { UIComponentPermission } from '../../../../model/UIComponentPermission';
import { CRUD } from '../../../../../../server/model/rest/CRUD';
import { UserProperty } from '../../model/UserProperty';
import { PersonalSettingsProperty } from '../../model/PersonalSettingsProperty';

export class AgentService extends KIXObjectService<User> {

    private static INSTANCE: AgentService = null;

    public static getInstance(): AgentService {
        if (!AgentService.INSTANCE) {
            AgentService.INSTANCE = new AgentService();
        }

        return AgentService.INSTANCE;
    }

    private constructor() {
        super(KIXObjectType.USER);
        this.objectConstructors.set(KIXObjectType.USER, [User]);
    }

    public isServiceFor(kixObjectType: KIXObjectType | string): boolean {
        return kixObjectType === KIXObjectType.USER
            || kixObjectType === KIXObjectType.PERSONAL_SETTINGS
            || kixObjectType === KIXObjectType.CURRENT_USER;
    }

    public async loadObjects<O extends KIXObject>(
        objectType: KIXObjectType | string, objectIds: Array<string | number>,
        loadingOptions?: KIXObjectLoadingOptions, objectLoadingOptions?: KIXObjectSpecificLoadingOptions,
        cache: boolean = true, forceIds: boolean = true, silent?: boolean
    ): Promise<O[]> {
        let objects: O[];
        let superLoad = false;
        if (objectType === KIXObjectType.USER) {
            objects = await super.loadObjects<O>(
                KIXObjectType.USER, forceIds ? objectIds : null, loadingOptions, objectLoadingOptions,
                cache, forceIds, silent
            );
        } else {
            superLoad = true;
            objects = await super.loadObjects<O>(
                objectType, objectIds, loadingOptions, objectLoadingOptions,
                cache, forceIds, silent
            );
        }

        if (objectIds && !superLoad) {
            objects = objects.filter((c) => objectIds.map((id) => Number(id)).some((oid) => c.ObjectId === oid));
        }

        return objects;
    }

    public getLinkObjectName(): string {
        return 'User';
    }

    public async login(
        userName: string, password: string, redirectUrl: string, mfaToken?: MFAToken
    ): Promise<LoginResult> {
        return await AuthenticationSocketClient.getInstance().login(userName, password, null, redirectUrl, mfaToken);
    }

    public async getPersonalSettings(): Promise<PersonalSetting[]> {
        return await AgentSocketClient.getInstance().getPersonalSettings();
    }

    public getCurrentUser(): Promise<User> {
        return AgentSocketClient.getInstance().getCurrentUser();
    }

    public async setPreferencesByForm(): Promise<void> {
        const service = ServiceRegistry.getServiceInstance<KIXObjectFormService>(
            KIXObjectType.PERSONAL_SETTINGS, ServiceType.FORM
        );
        let parameter: Array<[string, any]>;
        if (service) {
            parameter = await service.getFormParameter();
        }

        await AgentSocketClient.getInstance().setPreferences(parameter);

        EventService.getInstance().publish(ApplicationEvent.OBJECT_UPDATED, { objectType: KIXObjectType.CURRENT_USER });
    }

    public async setPreferences(preferences: Array<[string, any]>): Promise<void> {
        const parameter: Array<[string, any]> = Array.isArray(preferences) ? preferences : [];

        if (parameter.length) {
            await AgentSocketClient.getInstance().setPreferences(parameter);
        }
    }

    public async checkPassword(password: string): Promise<boolean> {
        const user = await this.getCurrentUser();
        const result = await AuthenticationSocketClient.getInstance().login(
            user.UserLogin, password, null, null, null, true
        );
        return result.success;
    }

    public async prepareFullTextFilter(searchValue: string): Promise<FilterCriteria[]> {
        return [
            new FilterCriteria(
                'Search', SearchOperator.CONTAINS, FilterDataType.STRING,
                FilterType.AND, searchValue.toLocaleLowerCase()
            )
        ];
    }

    public async getPinnedContexts(): Promise<Array<[string, string, string | number]>> {
        let contextList: Array<[string, string, string | number]> = [];
        const tabPreference = await this.getUserPreference('AgentPortalContextList');
        if (tabPreference) {
            try {
                contextList = Array.isArray(tabPreference.Value)
                    ? tabPreference.Value.map((v) => JSON.parse(v))
                    : [];
            } catch (error) {
                console.error(error);
            }
        }

        return contextList;
    }

    public async replacePinnedContexts(contextList: Array<[string, string | number]>): Promise<void> {
        const value = contextList.length ? contextList.map((c) => JSON.stringify(c)) : null;
        await this.setPreferences([['AgentPortalContextList', value]]);
    }

    public async getUserPreference(id: string): Promise<UserPreference> {
        const currentUser = await this.getCurrentUser();
        const preference = currentUser?.Preferences.find((p) => p.ID === id);
        return preference;
    }

    public async getCounter(): Promise<Counter> {
        const counter = await KIXObjectService.loadObjects<Counter>(KIXObjectType.USER_COUNTER)
            .catch((): Counter[] => []);
        return counter?.length ? counter[0] : new Counter();
    }

    public static userHasRole(roleIds: number[], user: User): boolean {
        if (user.UserID === 1) {
            return true;
        }

        const allowed = roleIds?.length ? roleIds.some((rid) => user.RoleIDs?.includes(Number(rid))) : true;
        return allowed;
    }

    public static async checkPermissions(resource: string, crud: CRUD[] = [CRUD.READ]): Promise<boolean> {
        return await AuthenticationSocketClient.getInstance().checkPermissions(
            [new UIComponentPermission(resource, crud)]
        );
    }

    public async getOutOfOfficeUserIds(): Promise<Array<string | number>> {
        const user = await this.getCurrentUser();

        const myQueues = user.Preferences.find((p) => p.ID === PersonalSettingsProperty.MY_QUEUES);
        const myQueueValue = Array.isArray(myQueues?.Value)
            ? myQueues?.Value
            : isNaN(Number(myQueues?.Value)) ? [] : [myQueues?.Value];

        let outOfOfficeUsersIDs: Array<string | number> = [];
        let loadingOptions;
        if (
            myQueueValue
            && myQueueValue.length
        ) {
            loadingOptions = new KIXObjectLoadingOptions(
                [
                    new FilterCriteria(`${UserProperty.PREFERENCES}.${UserProperty.MY_QUEUES}`,
                        SearchOperator.IN, FilterDataType.STRING,
                        FilterType.AND, myQueueValue
                    ),
                    new FilterCriteria(
                        'IsOutOfOffice',
                        SearchOperator.EQUALS, FilterDataType.NUMERIC,
                        FilterType.AND, 1
                    ),
                    new FilterCriteria(
                        'IsAgent',
                        SearchOperator.EQUALS, FilterDataType.NUMERIC,
                        FilterType.AND, 1
                    )
                ]
            );
        } else {
            loadingOptions = new KIXObjectLoadingOptions(
                [
                    new FilterCriteria(`${UserProperty.USER_ID}`,
                        SearchOperator.EQUALS, FilterDataType.NUMERIC,
                        FilterType.AND, KIXObjectType.CURRENT_USER
                    ),
                    new FilterCriteria(
                        'IsOutOfOffice',
                        SearchOperator.EQUALS, FilterDataType.NUMERIC,
                        FilterType.AND, 1
                    ),
                    new FilterCriteria(
                        'IsAgent',
                        SearchOperator.EQUALS, FilterDataType.NUMERIC,
                        FilterType.AND, 1
                    )
                ]
            );
        }
        loadingOptions.includes = [KIXObjectType.CONTACT, UserProperty.PREFERENCES];

        const outOfOfficeUsers = await KIXObjectService.loadObjects<User>(
            KIXObjectType.USER, null,
            loadingOptions, null, true, true, false
        ).catch((error) => [] as User[]);

        outOfOfficeUsers.forEach((u) => outOfOfficeUsersIDs.push(u.ObjectId));

        return outOfOfficeUsersIDs;
    }
}

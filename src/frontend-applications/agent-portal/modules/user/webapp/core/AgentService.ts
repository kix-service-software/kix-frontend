/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
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
        cache: boolean = true, forceIds: boolean = true
    ): Promise<O[]> {
        let objects: O[];
        let superLoad = false;
        if (objectType === KIXObjectType.USER) {
            objects = await super.loadObjects<O>(KIXObjectType.USER, forceIds ? objectIds : null, loadingOptions);
        } else {
            superLoad = true;
            objects = await super.loadObjects<O>(objectType, objectIds, loadingOptions, objectLoadingOptions);
        }

        if (objectIds && !superLoad) {
            objects = objects.filter((c) => objectIds.map((id) => Number(id)).some((oid) => c.ObjectId === oid));
        }

        return objects;
    }

    public getLinkObjectName(): string {
        return 'User';
    }

    public async login(userName: string, password: string, redirectUrl: string): Promise<boolean> {
        return await AuthenticationSocketClient.getInstance().login(userName, password, redirectUrl);
    }

    public async getPersonalSettings(): Promise<PersonalSetting[]> {
        return await AgentSocketClient.getInstance().getPersonalSettings();
    }

    public async getCurrentUser(useCache: boolean = true): Promise<User> {
        const currentUser = await AgentSocketClient.getInstance().getCurrentUser(useCache);
        return currentUser;
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
        return await AuthenticationSocketClient.getInstance().login(user.UserLogin, password, null, true);
    }

    public async prepareFullTextFilter(searchValue: string): Promise<FilterCriteria[]> {
        return [
            new FilterCriteria(
                'Search', SearchOperator.CONTAINS, FilterDataType.STRING,
                FilterType.OR, searchValue.toLocaleLowerCase()
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
}

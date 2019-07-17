import { AgentSocketClient } from './AgentSocketClient';
import { UserType } from '../../model/kix/user/UserType';
import { PersonalSetting, KIXObjectType, User, PersonalSettingsProperty } from '../../model';
import { KIXObjectService } from '../kix';
import { AuthenticationSocketClient } from './AuthenticationSocketClient';

export class AgentService extends KIXObjectService<User> {

    private static INSTANCE: AgentService = null;

    public static getInstance(): AgentService {
        if (!AgentService.INSTANCE) {
            AgentService.INSTANCE = new AgentService();
        }

        return AgentService.INSTANCE;
    }

    public getLinkObjectName(): string {
        return 'User';
    }

    public isServiceFor(kixObjectType: KIXObjectType) {
        return kixObjectType === KIXObjectType.USER ||
            kixObjectType === KIXObjectType.PERSONAL_SETTINGS;
    }

    public async login(userName: string, password: string, userType: UserType = UserType.AGENT): Promise<boolean> {
        return await AuthenticationSocketClient.getInstance().login(userName, password, userType);
    }

    public async getPersonalSettings(): Promise<PersonalSetting[]> {
        return await AgentSocketClient.getInstance().getPersonalSettings();
    }

    public async getCurrentUser(useCache: boolean = true): Promise<User> {
        const currentUser = await AgentSocketClient.getInstance().getCurrentUser(useCache);
        return currentUser;
    }

    public async setPreferencesByForm(formId: string): Promise<void> {
        const parameter: Array<[string, any]> = await this.prepareFormFields(formId);

        const queuesParameter = parameter.find((p) => p[0] === PersonalSettingsProperty.MY_QUEUES);
        if (queuesParameter) {
            queuesParameter[1] = Array.isArray(queuesParameter[1]) ? queuesParameter[1].join(',') : queuesParameter[1];
        }

        await AgentSocketClient.getInstance().setPreferences(parameter);
    }

    public async prepareFormFields(formId: string, forUpdate: boolean = false): Promise<Array<[string, any]>> {
        const parameter = await super.prepareFormFields(formId, forUpdate);

        const queuesParameter = parameter.find((p) => p[0] === PersonalSettingsProperty.MY_QUEUES);
        if (queuesParameter) {
            queuesParameter[1] = Array.isArray(queuesParameter[1]) ? queuesParameter[1].join(',') : '';
        }

        return parameter;
    }
}

import { AgentSocketClient } from './AgentSocketClient';
import { UserType } from '../../model/kix/user/UserType';
import { PersonalSetting, KIXObjectType, User } from '../../model';
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

    public async getCurrentUser(cache: boolean = true): Promise<User> {
        const currentUser = await AgentSocketClient.getInstance().getCurrentUser(cache);
        return currentUser;
    }

    public async setPreferencesByForm(formId: string): Promise<void> {
        const parameter: Array<[string, any]> = await this.prepareFormFields(formId);
        await AgentSocketClient.getInstance().setPreferences(parameter);
    }
}

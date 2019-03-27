import { AgentSocketListener } from "./AgentSocketListener";
import { UserType } from "../../model/kix/user/UserType";
import { PersonalSetting, KIXObjectType, Error, User, KIXObjectCache } from "../../model";
import { KIXObjectService, ServiceMethod } from "../kix";

export class AgentService extends KIXObjectService {

    private static INSTANCE: AgentService = null;

    public static getInstance(): AgentService {
        if (!AgentService.INSTANCE) {
            AgentService.INSTANCE = new AgentService();
        }

        return AgentService.INSTANCE;
    }

    public getLinkObjectName(): string {
        return "";
    }

    public isServiceFor(kixObjectType: KIXObjectType) {
        return kixObjectType === KIXObjectType.PERSONAL_SETTINGS;
    }

    public async login(userName: string, password: string, userType: UserType = UserType.AGENT): Promise<boolean> {
        return await AgentSocketListener.getInstance().login(userName, password, userType);
    }

    public async getPersonalSettings(): Promise<PersonalSetting[]> {
        return await AgentSocketListener.getInstance().getPersonalSettings();
    }

    public async getCurrentUser(cache: boolean = true): Promise<User> {
        if (!KIXObjectCache.hasObjectCache(KIXObjectType.CURRENT_USER)) {
            const currentUser = await AgentSocketListener.getInstance().getCurrentUser(cache);
            KIXObjectCache.addObject(KIXObjectType.CURRENT_USER, currentUser);
        }
        return KIXObjectCache.getObjectCache<User>(KIXObjectType.CURRENT_USER)[0];
    }

    public async setPreferencesByForm(formId: string): Promise<void> {
        KIXObjectCache.updateCache(KIXObjectType.CURRENT_USER, null, ServiceMethod.UPDATE);
        const parameter: Array<[string, any]> = await this.prepareFormFields(formId);
        return await AgentSocketListener.getInstance().setPreferences(parameter);
    }

}

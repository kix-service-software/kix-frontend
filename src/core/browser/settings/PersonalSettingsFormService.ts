import { KIXObjectFormService } from "../kix/KIXObjectFormService";
import { KIXObjectType, PersonalSettingsProperty } from "../../model";
import { AgentService } from "../application/AgentService";

export class PersonalSettingsFormService extends KIXObjectFormService {

    private static INSTANCE: PersonalSettingsFormService;

    public static getInstance(): PersonalSettingsFormService {
        if (!PersonalSettingsFormService.INSTANCE) {
            PersonalSettingsFormService.INSTANCE = new PersonalSettingsFormService();
        }
        return PersonalSettingsFormService.INSTANCE;
    }

    private constructor() {
        super();
    }

    public isServiceFor(objectType: KIXObjectType): boolean {
        return objectType === KIXObjectType.PERSONAL_SETTINGS;
    }

    protected async getValue(property: string, value: any): Promise<any> {
        const user = await AgentService.getInstance().getCurrentUser();
        const preference = user.Preferences ? user.Preferences.find((p) => p.ID === property) : null;

        value = preference ? preference.Value : value;

        if (property === PersonalSettingsProperty.MY_QUEUES && value && typeof value === 'string') {
            value = value.split(',').map((v) => Number(v));
        }

        return value;
    }
}

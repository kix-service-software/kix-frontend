import { KIXObjectService } from "../../kix";
import { KIXObjectType, ConfigItemClass } from "../../../model";

export class ConfigItemClassService extends KIXObjectService<ConfigItemClass> {

    private static INSTANCE: ConfigItemClassService = null;

    public static getInstance(): ConfigItemClassService {
        if (!ConfigItemClassService.INSTANCE) {
            ConfigItemClassService.INSTANCE = new ConfigItemClassService();
        }

        return ConfigItemClassService.INSTANCE;
    }

    private constructor() {
        super();
    }

    public isServiceFor(kixObjectType: KIXObjectType) {
        return kixObjectType === KIXObjectType.CONFIG_ITEM_CLASS;
    }

    public getLinkObjectName(): string {
        return 'ConfigItemClass';
    }

    public async init(): Promise<void> {
        this.loadObjects(KIXObjectType.CONFIG_ITEM_CLASS, null);
    }

}

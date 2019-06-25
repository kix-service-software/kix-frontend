import { KIXObjectType, ObjectIcon } from "../kix";
import { UIComponentPermission } from "../UIComponentPermission";

export class AdminModule {

    public constructor(
        adminModule?: AdminModule,
        public id?: string,
        public name?: string,
        public icon?: string | ObjectIcon,
        public objectType?: KIXObjectType,
        public componentId?: string,
        public permissions: UIComponentPermission[] = []
    ) {
        if (adminModule) {
            this.id = adminModule.id;
            this.name = adminModule.name;
            this.icon = adminModule.icon;
            this.objectType = adminModule.objectType;
            this.componentId = adminModule.componentId;
        }
    }

}

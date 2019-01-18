import { KIXObjectType, ObjectIcon } from "../kix";

export class AdminModule {

    public constructor(
        adminModule?: AdminModule,
        public id?: string,
        public name?: string,
        public icon?: string | ObjectIcon,
        public objectType?: KIXObjectType,
        public componentId?: string
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

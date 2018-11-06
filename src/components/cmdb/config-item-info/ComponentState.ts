import { ConfigItem, ObjectIcon } from "@kix/core/dist/model";

export class ComponentState {

    public constructor(
        public configItem: ConfigItem = null,
        public icon: string | ObjectIcon = null,
        public loading: boolean = true
    ) { }

}

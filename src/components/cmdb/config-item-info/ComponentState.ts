import { ConfigItem, ObjectIcon } from "../../../core/model";

export class ComponentState {

    public constructor(
        public configItem: ConfigItem = null,
        public icon: string | ObjectIcon = null,
        public loading: boolean = true
    ) { }

}

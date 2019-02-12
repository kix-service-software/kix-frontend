import { ConfigItem } from "../../../core/model";

export class ComponentState {

    public constructor(
        public loading: boolean = false,
        public configItems: ConfigItem[] = []
    ) { }

}

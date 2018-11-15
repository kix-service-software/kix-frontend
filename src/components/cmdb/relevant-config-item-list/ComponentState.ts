import { ConfigItem } from "@kix/core/dist/model";

export class ComponentState {

    public constructor(
        public loading: boolean = false,
        public configItems: ConfigItem[] = []
    ) { }

}

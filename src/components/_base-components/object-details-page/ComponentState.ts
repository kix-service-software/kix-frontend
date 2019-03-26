import { ConfiguredWidget, AbstractAction } from "../../../core/model";

export class ComponentState {

    public constructor(
        public instanceId: string = null,
        public lanes: ConfiguredWidget[] = [],
        public tabWidgets: ConfiguredWidget[] = [],
        public contentWidgets: ConfiguredWidget[] = [],
        public actions: AbstractAction[] = [],
        public loading: boolean = true,
        public hasError: boolean = false,
        public error: any = null,
        public title: string = ''
    ) { }
}

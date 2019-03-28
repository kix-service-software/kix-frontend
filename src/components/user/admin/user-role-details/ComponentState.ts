import { AbstractAction, ConfiguredWidget } from "../../../../core/model";
import { AbstractComponentState } from "../../../../core/browser";

export class ComponentState extends AbstractComponentState {

    public constructor(
        public instanceId: string = 'user-role-details',
        public lanes: ConfiguredWidget[] = [],
        public tabWidgets: ConfiguredWidget[] = [],
        public contentWidgets: ConfiguredWidget[] = [],
        public actions: AbstractAction[] = [],
        public loading: boolean = true,
        public hasError: boolean = false,
        public error: any = null,
        public title: string = ''
    ) {
        super();
    }
}

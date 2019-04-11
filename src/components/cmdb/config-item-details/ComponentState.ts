import { ConfiguredWidget, ConfigItem, IAction } from "../../../core/model";
import { ConfigItemDetailsContextConfiguration } from "../../../core/browser/cmdb";

export class ComponentState {

    public constructor(
        public instanceId: string = '20180824-config-item-details',
        public configItem: ConfigItem = null,
        public configuration: ConfigItemDetailsContextConfiguration = null,
        public error: any = null,
        public lanes: ConfiguredWidget[] = [],
        public tabWidgets: ConfiguredWidget[] = [],
        public contentWidgets: ConfiguredWidget[] = [],
        public loading: boolean = true,
        public title: string = '',
        public actions: IAction[] = [],
        public configItemActions: IAction[] = []
    ) { }

}

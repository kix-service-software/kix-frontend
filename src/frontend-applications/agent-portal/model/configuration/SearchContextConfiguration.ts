import { KIXObjectType } from '../kix/KIXObjectType';
import { KIXObjectLoadingOptions } from '../KIXObjectLoadingOptions';
import { ConfigurationType } from './ConfigurationType';
import { ConfiguredDialogWidget } from './ConfiguredDialogWidget';
import { ConfiguredWidget } from './ConfiguredWidget';
import { ContextConfiguration } from './ContextConfiguration';

export class SearchContextConfiguration extends ContextConfiguration {

    public application: string = 'agent-portal';

    public constructor(
        public id: string,
        public name: string,
        public type: string | ConfigurationType,
        public contextId: string,
        public sidebars: ConfiguredWidget[] = [],
        public explorer: ConfiguredWidget[] = [],
        public lanes: ConfiguredWidget[] = [],
        public content: ConfiguredWidget[] = [],
        public generalActions: string[] = [],
        public actions: string[] = [],
        public overlays: ConfiguredWidget[] = [],
        public others: ConfiguredWidget[] = [],
        public dialogs: ConfiguredDialogWidget[] = [],
        public customizable: boolean = false,
        public valid: boolean = true,
        public loadingOptions: Array<[KIXObjectType | string, KIXObjectLoadingOptions]> = null,
        public tableWidgetInstanceIds: Array<[string, string]> = [],
        public roleIds: number[] = [],
        public provideInvalidValues: boolean = true,
        public enabeSidebarAutoSearch: boolean = false,
    ) {
        super(
            id, name, type, contextId, sidebars, explorer, lanes, content, generalActions, actions,
            overlays, others, dialogs, customizable, valid, loadingOptions, tableWidgetInstanceIds,
            roleIds, provideInvalidValues
        );
    }

}
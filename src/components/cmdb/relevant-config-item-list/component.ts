import { ComponentState } from './ComponentState';
import { ContextService, KIXObjectService } from '@kix/core/dist/browser';
import {
    KIXObjectType, ConfigItem, KIXObjectLoadingOptions, ContextMode, ConfigItemProperty
} from '@kix/core/dist/model';
import { RoutingConfiguration } from '@kix/core/dist/browser/router';
import { ConfigItemDetailsContext } from '@kix/core/dist/browser/cmdb';

class Component {

    private state: ComponentState;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        this.state.loading = true;

        const object = await ContextService.getInstance().getActiveContext().getObject();

        const linkedConfigItemIds = object.Links.filter(
            (l) => l.Type === 'RelevantTo' && l.SourceObject === KIXObjectType.CONFIG_ITEM
        ).map((l) => l.SourceKey);

        if (linkedConfigItemIds && linkedConfigItemIds.length) {
            const loadingOptions = new KIXObjectLoadingOptions(null, null, null, null, null, ['CurrentVersion']);

            const configItems = await KIXObjectService.loadObjects<ConfigItem>(
                KIXObjectType.CONFIG_ITEM, linkedConfigItemIds, loadingOptions
            );

            this.state.configItems = configItems.sort(
                (a, b) => (a.CurrentVersion.Name.localeCompare(b.CurrentVersion.Name))
            );
        } else {
            this.state.configItems = [];
        }

        setTimeout(() => {
            this.state.loading = false;
        }, 200);
    }

    public getRoutingConfiguration(configItem: ConfigItem): RoutingConfiguration {
        return new RoutingConfiguration(
            null, ConfigItemDetailsContext.CONTEXT_ID, KIXObjectType.CONFIG_ITEM,
            ContextMode.DETAILS, ConfigItemProperty.CONFIG_ITEM_ID
        );
    }

}

module.exports = Component;

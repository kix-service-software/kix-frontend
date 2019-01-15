import { ComponentState } from './ComponentState';
import { ContextService, KIXObjectService } from '../../../core/browser';
import {
    KIXObjectType, ConfigItem, KIXObjectLoadingOptions, ContextMode, ConfigItemProperty, ContextType
} from '../../../core/model';
import { RoutingConfiguration } from '../../../core/browser/router';
import { ConfigItemDetailsContext } from '../../../core/browser/cmdb';

class Component {

    private state: ComponentState;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        this.state.loading = true;

        const object = await ContextService.getInstance().getActiveContext(ContextType.MAIN).getObject();
        if (object) {
            const linkedConfigItemIds = object.Links.filter(
                (l) => l.Type === 'RelevantTo' && l.SourceObject === KIXObjectType.CONFIG_ITEM
            ).map((l) => l.SourceKey);

            if (linkedConfigItemIds && linkedConfigItemIds.length) {
                const loadingOptions = new KIXObjectLoadingOptions(null, null, null, null, null, ['CurrentVersion']);

                const configItems = await KIXObjectService.loadObjects<ConfigItem>(
                    KIXObjectType.CONFIG_ITEM, linkedConfigItemIds, loadingOptions
                );

                this.state.configItems = configItems.sort(
                    (a, b) => {
                        const aName = a.CurrentVersion ? a.CurrentVersion.Name : '';
                        const bName = b.CurrentVersion ? b.CurrentVersion.Name : '';
                        return (aName.localeCompare(bName));
                    }
                );
            } else {
                this.state.configItems = [];
            }
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

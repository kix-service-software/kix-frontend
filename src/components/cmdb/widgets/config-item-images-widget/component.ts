import { ComponentState } from './ComponentState';
import {
    ContextService, ActionFactory, IdService, DialogService
} from '@kix/core/dist/browser';
import {
    KIXObjectType, Context, ConfigItem, ImagesLoadingOptions, ConfigItemImage
} from '@kix/core/dist/model';
import { DisplayImageDescription } from '@kix/core/dist/browser/components';

class Component {

    private state: ComponentState;
    private contextListenerId: string;
    private images: DisplayImageDescription[];

    public onCreate(): void {
        this.state = new ComponentState();
        this.contextListenerId = IdService.generateDateBasedId('config-item-images-widget');
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public async onMount(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();
        this.state.widgetConfiguration = context ? context.getWidgetConfiguration(this.state.instanceId) : undefined;

        context.registerListener(this.contextListenerId, {
            objectChanged: (id: string | number, object: ConfigItem, type: KIXObjectType) => {
                if (type === KIXObjectType.CONFIG_ITEM) {
                    this.initWidget(context, object);
                }
            },
            sidebarToggled: () => { return; },
            explorerBarToggled: () => { return; },
            objectListChanged: () => { return; },
            filteredObjectListChanged: () => { return; }
        });

        await this.initWidget(context, await context.getObject<ConfigItem>());
    }

    private async initWidget(context: Context, configItem?: ConfigItem): Promise<void> {
        this.state.loading = true;
        this.state.configItem = configItem;
        this.state.widgetTitle = `${this.state.widgetConfiguration.title}`;

        this.setActions();
        await this.prepareImages();

        setTimeout(() => {
            this.state.loading = false;
        }, 100);
    }

    private setActions(): void {
        if (this.state.widgetConfiguration && this.state.configItem) {
            this.state.actions = ActionFactory.getInstance().generateActions(
                this.state.widgetConfiguration.actions, false, [this.state.configItem]
            );
        }
    }

    private async prepareImages(): Promise<void> {
        if (this.state.configItem) {
            const ciImages: ConfigItemImage[] = await ContextService.getInstance().loadObjects<ConfigItemImage>(
                KIXObjectType.CONFIG_ITEM_IMAGE,
                [], null, new ImagesLoadingOptions(this.state.configItem.ConfigItemID)
            );

            this.images = ciImages.map(
                (i) => {
                    return new DisplayImageDescription(i.ID, i.decodedContent, i.Comment, true);
                }
            );
            this.state.thumbnails = this.images;
        }
    }

    public openImageDialog(imageId: string | number): void {
        DialogService.getInstance().openImageDialog(this.images, imageId);
    }
}

module.exports = Component;

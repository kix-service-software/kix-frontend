import { ComponentState } from './ComponentState';
import {
    ContextService, ActionFactory, IdService, KIXObjectService
} from '../../../../core/browser';
import {
    KIXObjectType, Context, ConfigItem, ImagesLoadingOptions, ConfigItemImage
} from '../../../../core/model';
import { DisplayImageDescription } from '../../../../core/browser/components';
import { DialogService } from '../../../../core/browser/components/dialog';

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
            filteredObjectListChanged: () => { return; },
            scrollInformationChanged: () => { return; }
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
                this.state.widgetConfiguration.actions, [this.state.configItem]
            );
        }
    }

    private async prepareImages(): Promise<void> {
        if (this.state.configItem) {
            const ciImages: ConfigItemImage[] = await KIXObjectService.loadObjects<ConfigItemImage>(
                KIXObjectType.CONFIG_ITEM_IMAGE,
                null, null, new ImagesLoadingOptions(this.state.configItem.ConfigItemID)
            );

            this.images = ciImages.map((i) => {
                const content = `data:${i.ContentType};base64,${i.Content}`;
                return new DisplayImageDescription(i.ID, content, i.Comment);
            });
            this.state.thumbnails = this.images;
            this.state.widgetTitle = `${this.state.widgetConfiguration.title} (${this.images.length})`;
        }
    }

    public openImageDialog(imageId: string | number): void {
        DialogService.getInstance().openImageDialog(this.images, imageId);
    }
}

module.exports = Component;

/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { DisplayImageDescription } from '../../../../../modules/base-components/webapp/core/DisplayImageDescription';
import { IdService } from '../../../../../model/IdService';
import { TranslationService } from '../../../../../modules/translation/webapp/core/TranslationService';
import { ContextService } from '../../../../../modules/base-components/webapp/core/ContextService';
import { ConfigItem } from '../../../model/ConfigItem';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { ActionFactory } from '../../../../../modules/base-components/webapp/core/ActionFactory';
import { ConfigItemImage } from '../../../model/ConfigItemImage';
import { KIXObjectService } from '../../../../../modules/base-components/webapp/core/KIXObjectService';
import { ImagesLoadingOptions } from '../../../model/ImagesLoadingOptions';
import { Context } from '../../../../../model/Context';
import { EventService } from '../../../../base-components/webapp/core/EventService';
import { ImageViewerEvent } from '../../../../agent-portal/model/ImageViewerEvent';
import { ImageViewerEventData } from '../../../../agent-portal/model/ImageViewerEventData';

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

        this.state.translations = await TranslationService.createTranslationObject([
            'Translatable#Large View'
        ]);

        const context = ContextService.getInstance().getActiveContext();
        this.state.widgetConfiguration = context
            ? await context.getWidgetConfiguration(this.state.instanceId)
            : undefined;

        context.registerListener(this.contextListenerId, {
            objectChanged: (id: string | number, object: ConfigItem, type: KIXObjectType) => {
                if (type === KIXObjectType.CONFIG_ITEM) {
                    this.initWidget(context, object);
                }
            },
            sidebarRightToggled: (): void => { return; },
            sidebarLeftToggled: (): void => { return; },
            objectListChanged: () => { return; },
            filteredObjectListChanged: (): void => { return; },
            scrollInformationChanged: () => { return; },
            additionalInformationChanged: (): void => { return; }
        });

        await this.initWidget(context, await context.getObject<ConfigItem>());
    }

    private async initWidget(context: Context, configItem?: ConfigItem): Promise<void> {
        this.state.loading = true;
        this.state.configItem = configItem;
        this.state.widgetTitle = `${this.state.widgetConfiguration.title}`;

        await this.prepareActions();
        await this.prepareImages();

        setTimeout(() => {
            this.state.loading = false;
        }, 100);
    }

    private async prepareActions(): Promise<void> {
        if (this.state.widgetConfiguration && this.state.configItem) {
            this.state.actions = await ActionFactory.getInstance().generateActions(
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
        EventService.getInstance().publish(
            ImageViewerEvent.OPEN_VIEWER,
            new ImageViewerEventData(this.images, imageId)
        );
    }
}

module.exports = Component;

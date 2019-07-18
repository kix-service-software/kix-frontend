/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import {
    Context, ConfigItem, KIXObjectType, BreadcrumbInformation, KIXObject, KIXObjectLoadingOptions, VersionProperty
} from "../../../model";
import { KIXObjectService } from "../../kix";
import { CMDBContext } from "./CMDBContext";
import { EventService } from "../../event";
import { LabelService } from "../../LabelService";
import { ApplicationEvent } from "../../application";

export class ConfigItemDetailsContext extends Context {

    public static CONTEXT_ID = 'config-item-details';

    public getIcon(): string {
        return 'kix-icon-ci';
    }

    public async getDisplayText(short?: boolean): Promise<string> {
        return await LabelService.getInstance().getText(await this.getObject<ConfigItem>(), true, !short);
    }

    public async getBreadcrumbInformation(): Promise<BreadcrumbInformation> {
        const object = await this.getObject<ConfigItem>();
        const text = await LabelService.getInstance().getText(object);
        return new BreadcrumbInformation(this.getIcon(), [CMDBContext.CONTEXT_ID], text);
    }

    public async getObject<O extends KIXObject>(
        objectType: KIXObjectType = KIXObjectType.CONFIG_ITEM, reload: boolean = false
    ): Promise<O> {
        const object = await this.loadConfigItem() as any;
        if (reload) {
            this.listeners.forEach(
                (l) => l.objectChanged(Number(this.objectId), object, KIXObjectType.CONFIG_ITEM)
            );
        }
        return object;
    }

    private async loadConfigItem(): Promise<ConfigItem> {
        const loadingOptions = new KIXObjectLoadingOptions(
            null, null, null,
            [
                'Versions', 'Links', 'History', VersionProperty.DEFINITION,
                VersionProperty.DATA, VersionProperty.PREPARED_DATA
            ],
            ['Links']
        );

        const itemId = Number(this.objectId);

        const timeout = window.setTimeout(() => {
            EventService.getInstance().publish(ApplicationEvent.APP_LOADING, {
                loading: true, hint: `Translatable#Load Config Item ...`
            });
        }, 500);

        const configItems = await KIXObjectService.loadObjects<ConfigItem>(
            KIXObjectType.CONFIG_ITEM, [itemId], loadingOptions, null, true
        ).catch((error) => {
            console.error(error);
            return null;
        });

        window.clearTimeout(timeout);

        let configItem: ConfigItem;
        if (configItems && configItems.length) {
            configItem = configItems[0];
        }

        EventService.getInstance().publish(
            ApplicationEvent.APP_LOADING, { loading: false, hint: '' }
        );
        return configItem;
    }

}

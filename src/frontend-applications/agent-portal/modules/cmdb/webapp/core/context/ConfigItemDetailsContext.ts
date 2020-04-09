/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Context } from "../../../../../model/Context";
import { LabelService } from "../../../../../modules/base-components/webapp/core/LabelService";
import { ConfigItem } from "../../../model/ConfigItem";
import { BreadcrumbInformation } from "../../../../../model/BreadcrumbInformation";
import { CMDBContext } from ".";
import { KIXObject } from "../../../../../model/kix/KIXObject";
import { KIXObjectType } from "../../../../../model/kix/KIXObjectType";
import { KIXObjectLoadingOptions } from "../../../../../model/KIXObjectLoadingOptions";
import { VersionProperty } from "../../../model/VersionProperty";

export class ConfigItemDetailsContext extends Context {

    public static CONTEXT_ID = 'config-item-details';

    public getIcon(): string {
        return 'kix-icon-ci';
    }

    public async getDisplayText(short?: boolean): Promise<string> {
        return await LabelService.getInstance().getObjectText(await this.getObject<ConfigItem>(), true, !short);
    }

    public async getBreadcrumbInformation(): Promise<BreadcrumbInformation> {
        const object = await this.getObject<ConfigItem>();
        const text = await LabelService.getInstance().getObjectText(object);
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

        return await this.loadDetailsObject<ConfigItem>(KIXObjectType.CONFIG_ITEM, loadingOptions);
    }

}

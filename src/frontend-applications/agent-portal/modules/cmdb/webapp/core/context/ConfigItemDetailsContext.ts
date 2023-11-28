/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Context } from '../../../../../model/Context';
import { LabelService } from '../../../../../modules/base-components/webapp/core/LabelService';
import { ConfigItem } from '../../../model/ConfigItem';
import { BreadcrumbInformation } from '../../../../../model/BreadcrumbInformation';
import { CMDBContext } from '.';
import { KIXObject } from '../../../../../model/kix/KIXObject';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { KIXObjectLoadingOptions } from '../../../../../model/KIXObjectLoadingOptions';
import { VersionProperty } from '../../../model/VersionProperty';
import { KIXObjectProperty } from '../../../../../model/kix/KIXObjectProperty';

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
        let object;

        if (objectType === KIXObjectType.CONFIG_ITEM) {
            object = await this.loadConfigItem();
        }

        return object as any;
    }

    private async loadConfigItem(): Promise<ConfigItem> {
        const loadingOptions = new KIXObjectLoadingOptions(
            null, null, null,
            [
                'Versions', 'History', VersionProperty.DEFINITION,
                VersionProperty.DATA, VersionProperty.PREPARED_DATA,
                KIXObjectProperty.LINK_COUNT
            ]
        );

        return await this.loadDetailsObject<ConfigItem>(KIXObjectType.CONFIG_ITEM, loadingOptions);
    }

    public async getObjectList<T = KIXObject>(objectType: KIXObjectType | string): Promise<T[]> {
        if (objectType === KIXObjectType.CONFIG_ITEM_VERSION) {
            const asset = await this.getObject<ConfigItem>();
            return asset.Versions as any[];
        }

        return super.getObjectList(objectType);
    }

}

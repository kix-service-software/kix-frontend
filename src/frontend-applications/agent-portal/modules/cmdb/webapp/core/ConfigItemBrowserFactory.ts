/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IKIXObjectFactory } from '../../../../modules/base-components/webapp/core/IKIXObjectFactory';
import { ConfigItem } from '../../model/ConfigItem';
import { ConfigItemFactory } from '../../server/ConfigItemFactory';
import { KIXObjectService } from '../../../../modules/base-components/webapp/core/KIXObjectService';
import { User } from '../../../user/model/User';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { Version } from '../../model/Version';
import { ConfigItemImage } from '../../model/ConfigItemImage';
import { ConfigItemHistory } from '../../model/ConfigItemHistory';
import { Link } from '../../../links/model/Link';

export class ConfigItemBrowserFactory implements IKIXObjectFactory<ConfigItem> {

    private static INSTANCE: ConfigItemBrowserFactory;

    public static getInstance(): ConfigItemBrowserFactory {
        if (!ConfigItemBrowserFactory.INSTANCE) {
            ConfigItemBrowserFactory.INSTANCE = new ConfigItemBrowserFactory();
        }
        return ConfigItemBrowserFactory.INSTANCE;
    }

    private constructor() { }

    public async create(configItem: ConfigItem): Promise<ConfigItem> {
        const newConfigItem = ConfigItemFactory.create(configItem);
        await this.mapAdditionalData(newConfigItem);
        return newConfigItem;
    }

    private async mapAdditionalData(configItem: ConfigItem): Promise<void> {
        const createUsers = await KIXObjectService.loadObjects<User>(
            KIXObjectType.USER, [configItem.CreateBy], null, null, true, true, true
        ).catch((error) => [] as User[]);
        configItem.createdBy = createUsers && !!createUsers.length ? createUsers[0] : null;
        const changeUsers = await KIXObjectService.loadObjects<User>(
            KIXObjectType.USER, [configItem.ChangeBy], null, null, true, true, true
        ).catch((error) => [] as User[]);
        configItem.changedBy = changeUsers && !!changeUsers.length ? changeUsers[0] : null;

        configItem.CurrentVersion = new Version(configItem.CurrentVersion);

        if (!configItem.Name && configItem.CurrentVersion) {
            configItem.Name = configItem.CurrentVersion.Name;
        }

        if (configItem.Links) {
            configItem.Links = configItem.Links.map((l) => new Link(l));
        }

        if (configItem.Versions) {
            configItem.Versions = configItem.Versions.map((v) => new Version(v));
        }

        if (configItem.Images) {
            configItem.Images = configItem.Images.map((i) => new ConfigItemImage(i));
        }

        if (configItem.History) {
            configItem.History = configItem.History.map((h) => new ConfigItemHistory(h));
        }

    }
}

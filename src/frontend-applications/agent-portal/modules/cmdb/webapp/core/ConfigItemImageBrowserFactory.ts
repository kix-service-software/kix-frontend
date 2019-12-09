/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IKIXObjectFactory } from "../../../../modules/base-components/webapp/core/IKIXObjectFactory";
import { ConfigItemImage } from "../../model/ConfigItemImage";
import { ConfigItemImageFactory } from "../../server/ConfigItemImageFactory";

export class ConfigItemImageBrowserFactory implements IKIXObjectFactory<ConfigItemImage> {

    private static INSTANCE: ConfigItemImageBrowserFactory;

    public static getInstance(): ConfigItemImageBrowserFactory {
        if (!ConfigItemImageBrowserFactory.INSTANCE) {
            ConfigItemImageBrowserFactory.INSTANCE = new ConfigItemImageBrowserFactory();
        }
        return ConfigItemImageBrowserFactory.INSTANCE;
    }

    private constructor() { }

    public async create(_image: ConfigItemImage): Promise<ConfigItemImage> {
        const image = ConfigItemImageFactory.create(_image);
        return image;
    }
}

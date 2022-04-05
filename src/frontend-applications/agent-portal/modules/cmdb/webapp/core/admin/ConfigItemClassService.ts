/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectService } from '../../../../../modules/base-components/webapp/core/KIXObjectService';
import { ConfigItemClass } from '../../../model/ConfigItemClass';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';


export class ConfigItemClassService extends KIXObjectService<ConfigItemClass> {

    private static INSTANCE: ConfigItemClassService = null;

    public static getInstance(): ConfigItemClassService {
        if (!ConfigItemClassService.INSTANCE) {
            ConfigItemClassService.INSTANCE = new ConfigItemClassService();
        }

        return ConfigItemClassService.INSTANCE;
    }

    private constructor() {
        super(KIXObjectType.CONFIG_ITEM_CLASS);
        this.objectConstructors.set(KIXObjectType.CONFIG_ITEM_CLASS, [ConfigItemClass]);
    }

    public isServiceFor(kixObjectType: KIXObjectType): boolean {
        return kixObjectType === KIXObjectType.CONFIG_ITEM_CLASS;
    }

    public getLinkObjectName(): string {
        return 'ConfigItemClass';
    }

}

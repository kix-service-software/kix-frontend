/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectService } from '../../../../modules/base-components/webapp/core/KIXObjectService';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { Plugin } from '../../model/Plugin';

export class PluginService extends KIXObjectService<Plugin> {

    private static INSTANCE: PluginService = null;

    public static getInstance(): PluginService {
        if (!PluginService.INSTANCE) {
            PluginService.INSTANCE = new PluginService();
        }

        return PluginService.INSTANCE;
    }

    private constructor() {
        super(KIXObjectType.PLUGIN);
        this.objectConstructors.set(KIXObjectType.PLUGIN, [Plugin]);
    }

    public isServiceFor(kixObjectType: KIXObjectType): boolean {
        return kixObjectType === KIXObjectType.PLUGIN;
    }

}

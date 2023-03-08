/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectType } from '../../../../../../../model/kix/KIXObjectType';
import { ObjectIconLoadingOptions } from '../../../../../../../server/model/ObjectIconLoadingOptions';
import { KIXObjectService } from '../../../../../../base-components/webapp/core/KIXObjectService';
import { ObjectIcon } from '../../../../../../icon/model/ObjectIcon';
import { ComponentState } from './ComponentState';

class Component {

    public state: ComponentState;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        const logoLoadingOptions = new ObjectIconLoadingOptions('agent-portal-logo', 'agent-portal-logo');
        const icons = await KIXObjectService.loadObjects<ObjectIcon>(
            KIXObjectType.OBJECT_ICON, null, null, logoLoadingOptions
        );
        if (icons && icons.length) {
            this.state.logoIcon = icons[0];
        }
    }
}

module.exports = Component;

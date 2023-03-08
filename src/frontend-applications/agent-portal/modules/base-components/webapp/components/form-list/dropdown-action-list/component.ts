/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractMarkoComponent } from '../../../../../../modules/base-components/webapp/core/AbstractMarkoComponent';
import { FormInputAction } from '../../../../../../modules/base-components/webapp/core/FormInputAction';

class Component extends AbstractMarkoComponent {

    public actionClicked(action: FormInputAction): void {
        action.active = !action.active;
        action.callback(action);
    }

}

module.exports = Component;

/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
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

/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FormInputComponentState } from '../../../../base-components/webapp/core/FormInputComponentState';
import { BasePermissionManager } from '../../core/admin/BasePermissionManager';

export class ComponentState extends FormInputComponentState {

    public constructor(
        public permissionManager: BasePermissionManager = null,
        public invalid: boolean = false
    ) {
        super();
    }

}
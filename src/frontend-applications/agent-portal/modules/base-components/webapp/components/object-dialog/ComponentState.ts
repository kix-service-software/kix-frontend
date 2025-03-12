/**
 * Copyright (C) 2006-2025 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ConfiguredWidget } from '../../../../../model/configuration/ConfiguredWidget';
import { ContextType } from '../../../../../model/ContextType';
import { AbstractComponentState } from '../../core/AbstractComponentState';
import { ValidationResult } from '../../core/ValidationResult';

export class ComponentState extends AbstractComponentState {

    public constructor(
        public widgets: ConfiguredWidget[] = [],
        public validationResult: ValidationResult[] = [],
        public sidebars: ConfiguredWidget[] = [],
        public contextType: ContextType = null,
        public isContextCustomizable: boolean = false,
        public submitButtonText: string = null,
        public canSubmit: boolean = true,
        public processing: boolean = false,
    ) {
        super();
    }

}

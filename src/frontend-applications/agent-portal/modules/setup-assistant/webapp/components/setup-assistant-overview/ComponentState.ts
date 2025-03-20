/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractComponentState } from '../../../../base-components/webapp/core/AbstractComponentState';
import { SetupStep } from '../../core/SetupStep';

export class ComponentState extends AbstractComponentState {

    public constructor(
        public instanceId: string = 'admin-setup-assistant-overview',
        public prepared: boolean = false,
        public title: string = 'Setup Assistant',
        public setupSteps: SetupStep[] = [],
        public activeStep: SetupStep = null,
        public template: any = null
    ) {
        super();
    }

}

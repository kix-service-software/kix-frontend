/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AdditionalRoutingHandler } from '../../../base-components/webapp/core/AdditionalRoutingHandler';
import { SetupService } from './SetupService';

export class SetupAssistentRoutingHandler extends AdditionalRoutingHandler {

    public constructor() {
        super(20);
    }

    public handleRouting(): Promise<boolean> {
        return SetupService.getInstance().setSetupAssistentIfNeeded();
    }

}
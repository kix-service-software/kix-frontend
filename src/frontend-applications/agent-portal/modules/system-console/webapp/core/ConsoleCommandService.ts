/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { KIXObjectService } from '../../../../modules/base-components/webapp/core/KIXObjectService';
import { ConsoleCommand } from '../../model/ConsoleCommand';

export class ConsoleCommandService extends KIXObjectService {

    private static INSTANCE: ConsoleCommandService;

    public static getInstance(): ConsoleCommandService {
        if (!ConsoleCommandService.INSTANCE) {
            ConsoleCommandService.INSTANCE = new ConsoleCommandService();
        }
        return ConsoleCommandService.INSTANCE;
    }

    private constructor() {
        super(KIXObjectType.CONSOLE_COMMAND);
        this.objectConstructors.set(KIXObjectType.CONSOLE_COMMAND, [ConsoleCommand]);
    }

    public isServiceFor(kixObjectType: KIXObjectType): boolean {
        return kixObjectType === KIXObjectType.CONSOLE_COMMAND;
    }

    public getLinkObjectName(): string {
        return 'ConsoleCommand';
    }


}

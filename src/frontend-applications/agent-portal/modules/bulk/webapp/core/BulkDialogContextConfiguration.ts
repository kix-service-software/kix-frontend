/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ContextConfiguration } from '../../../../model/configuration/ContextConfiguration';
import { BulkDialogContext } from '.';
import { ConfigurationType } from '../../../../model/configuration/ConfigurationType';

export class BulkDialogContextConfiguration extends ContextConfiguration {

    public constructor() {
        super(
            BulkDialogContext.CONTEXT_ID, BulkDialogContext.CONTEXT_ID, ConfigurationType.Context,
            BulkDialogContext.CONTEXT_ID,
            [], [], [], [], []
        );
    }

}

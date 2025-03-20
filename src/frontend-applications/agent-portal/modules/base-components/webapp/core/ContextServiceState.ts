/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Context } from 'vm';
import { ContextType } from '../../../../model/ContextType';

export class ContextServiceState {

    public previousContextId: string = null;

    public contexts: Context[] = [];

    public activeContexts: Map<ContextType, Context> = new Map();

    public activeContextType: ContextType = ContextType.MAIN;

    public contextStack: string[] = [];

}

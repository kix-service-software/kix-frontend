/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ExtendedDynamicFormManager } from './dynamic-form/ExtendedDynamicFormManager';
import { TreeNode } from './tree';

export class ExtendedSearchFormManager extends ExtendedDynamicFormManager {

    public async getSortNodes(): Promise<TreeNode[]> {
        return;
    }

    public getSortableDFTypes(): Array<string> {
        return [];
    }

    public async getSortAttributeType(attribute: string): Promise<string> {
        return;
    }

    public getSortAttribute(attribute: string): string {
        return;
    }
}

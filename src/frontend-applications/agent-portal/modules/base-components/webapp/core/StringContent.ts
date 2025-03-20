/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IWidgetContent } from './IWidgetContent';
import { KIXObject } from '../../../../model/kix/KIXObject';

export class StringContent<T extends KIXObject> implements IWidgetContent<T> {

    public constructor(private value: string, private actionObject?: T) { }

    public getValue(): string {
        return this.value;
    }

    public getActionObject(): T {
        return this.actionObject;
    }
}

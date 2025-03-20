/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { ArticleReceiver } from '../../../model/ArticleReceiver';

class Component {

    private state: ComponentState;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.receiverList = input.receiver;
    }

    public getReceiverString(receiver: ArticleReceiver): string {
        return receiver.realName === receiver.email
            ? receiver.email
            : `${receiver.realName} (${receiver.email})`;
    }

}

module.exports = Component;

/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractMarkoComponent } from '../../../../base-components/webapp/core/AbstractMarkoComponent';
import { ComponentState } from './ComponentState';

declare const JSONEditor: any;

export class Component extends AbstractMarkoComponent<ComponentState> {

    private editor: any;
    private value: string;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.value = input.value;
        if (this.value) {
            this.editor?.set(this.value || {});
        }
    }

    public async onMount(): Promise<void> {
        this.initCodeEditor();
    }

    public onDestroy(): void {
        return;
    }

    private initCodeEditor(): void {
        const container = document.getElementById(this.state.editorId);
        const options = {
            search: false,
            history: false,
            mode: 'code',
            onChange: (): void => {
                try {
                    (this as any).emit('valueChanged', this.editor.get());
                } catch (e) { }
            }
        };
        this.editor = new JSONEditor(container, options);
        this.editor?.set(this.value || {});
    }

}

module.exports = Component;
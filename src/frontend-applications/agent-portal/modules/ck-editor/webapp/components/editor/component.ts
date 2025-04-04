/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { BrowserUtil } from '../../../../base-components/webapp/core/BrowserUtil';
import { EventService } from '../../../../base-components/webapp/core/EventService';
import { FormEvent } from '../../../../base-components/webapp/core/FormEvent';
import { CKEditor5 } from '../../core/CKEditor5';
import { ComponentState } from './ComponentState';

class EditorComponent {

    public state: ComponentState;
    private editor: CKEditor5;
    private createTimeout: any;
    private input: any;
    private changeTimeout: any;


    public onCreate(input: any): void {
        this.state = new ComponentState(input.readOnly);
    }

    public onInput(input: any): void {
        this.input = input;
        if (this.editor) {
            this.editor.update(input);

            if (this.input.style) {
                BrowserUtil.applyStyle(this.state.id, this.input.style);
            }
        }
    }

    public async onMount(): Promise<void> {
        this.editor = new CKEditor5(this.state.id);
        this.editor.addChangeListener(() => {
            if (this.changeTimeout) {
                clearTimeout(this.changeTimeout);
            } else {
                EventService.getInstance().publish(FormEvent.BLOCK, true);
            }
            this.changeTimeout = setTimeout(() => {
                const value = this.editor.getValue();
                (this as any).emit('valueChanged', value);
                EventService.getInstance().publish(FormEvent.BLOCK, false);
                this.changeTimeout = null;
            }, CKEditor5.editorTimeout);
            return null;
        });
        this.editor.addFocusListener((value) => (this as any).emit('focusLost', value));
        await this.editor.create();
        if (this.input) {
            this.editor.update(this.input);
        }

        if (this.input.style) {
            BrowserUtil.applyStyle(this.state.id, this.input.style);
        }
    }

    public async onDestroy(): Promise<void> {
        if (this.createTimeout) {
            clearTimeout(this.createTimeout);
            this.createTimeout = null;
        }
        this.editor?.destroy();
        BrowserUtil.removeStyle(this.state.id);
    }

    public getValue(): string {
        return this.editor.getValue();
    }

    public editorClicked(event: any): void {
        if (this.input.readOnly && event?.srcElement?.tagName !== 'A') {
            event.stopPropagation();
            event.preventDefault();
        }
    }

}

module.exports = EditorComponent;


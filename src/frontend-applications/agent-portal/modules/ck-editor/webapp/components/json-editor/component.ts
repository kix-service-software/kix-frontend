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

    public onCreate(input: any): void {
        super.onCreate(input);
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        super.onInput(input);
        this.value = input.value;
        if (this.value) {
            this.editor?.set(this.value || {});
        }
    }

    public async onMount(): Promise<void> {
        await super.onMount();
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
        this.addFullscreenButton();

        document.addEventListener('fullscreenchange', () => {
            this.editor.resize();
        }, { once: true });
    }

    private addFullscreenButton(): void {
        const menu = document.querySelector('.jsoneditor-menu');
        const fullscreenBtn = document.createElement('button');
        fullscreenBtn.className = 'fullscreen-button';
        fullscreenBtn.innerHTML = '<i class="fas fa-expand-arrows-alt"></i>';
        fullscreenBtn.title = 'Toggle Fullscreen';
        menu.appendChild(fullscreenBtn);

        const container = document.getElementById(this.state.editorId);

        fullscreenBtn.addEventListener('click', () => {
            this.toggleFullscreen(container, fullscreenBtn);
        });

    }

    private toggleFullscreen(container: HTMLElement, fullscreenBtn: HTMLButtonElement): void {
        container.focus();
        if (!document.fullscreenElement) {
            // Enter fullscreen
            container.requestFullscreen?.() ||
                (container as any).webkitRequestFullscreen?.() ||
                (container as any).mozRequestFullScreen?.() ||
                (container as any).msRequestFullscreen?.();
            //this.editor.resize();
            fullscreenBtn.innerHTML = '<i class="fas fa-compress"></i>';
        } else {
            // Exit fullscreen
            document.exitFullscreen?.() ||
                (document as any).webkitExitFullscreen?.() ||
                (document as any).mozCancelFullScreen?.() ||
                (document as any).msExitFullscreen?.();
            //this.editor.resize();
            fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
        }
    }


}

module.exports = Component;
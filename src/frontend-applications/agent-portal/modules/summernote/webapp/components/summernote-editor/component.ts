import { AbstractMarkoComponent } from '../../../../../modules/base-components/webapp/core/AbstractMarkoComponent';
import { ComponentState } from './ComponentState';

declare const $: any;

export class Component extends AbstractMarkoComponent<ComponentState> {
    private value: string;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.value = input.value || '';
    }

    public async onMount(): Promise<void> {
        const container = document.getElementById(this.state.editorId);
        if (!container) {
            console.error(`[Summernote] Container with ID "${this.state.editorId}" not found.`);
            return;
        }

        container.innerHTML = '';

        const editorElement = document.createElement('div');
        editorElement.classList.add('summernote-editor-body');
        container.appendChild(editorElement);

        $(editorElement).summernote({
            tabsize: 2,
            height: 350,
            codemirror: { theme: 'monokai' },
            callbacks: {
                onChange: (contents: string) => {
                    (this as any).emit('valueChanged', contents);
                }
            }
        });

        if (this.value) {
            $(editorElement).summernote('code', this.value);
        }
    }

    public onDestroy(): void {
        const container = document.getElementById(this.state.editorId);
        if (container) {
            const editorElement = container.querySelector('.summernote-editor-body');
            if (editorElement && $(editorElement).summernote) {
                $(editorElement).summernote('destroy');
            }
            container.innerHTML = '';
        }
    }
}

module.exports = Component;
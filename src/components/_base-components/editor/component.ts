import { EditorComponentState } from './model/EditorComponentState';

declare var CKEDITOR: any;

class EditorComponent {

    public state: EditorComponentState;

    public onCreate(input: any): void {
        this.state = new EditorComponentState(
            input.inline,
            input.readOnly,
            input.resize,
            input.resizeDir
        );
        this.state.value = input.value || '';
    }

    public async onInput(input: any): Promise<void> {
        if (input.value && input.value !== this.state.value) {
            this.state.value = input.value || '';
            if (await this.isEditorReady()) {
                CKEDITOR.instances[this.state.id].insertHtml(this.state.value);
            }
        }
        if (typeof input.readOnly !== 'undefined' && this.state.readOnly !== input.readOnly) {
            this.state.readOnly = input.readOnly;
            if (await this.isEditorReady()) {
                CKEDITOR.instances[this.state.id].setReadOnly(this.state.readOnly);
            }
        }
    }

    public onMount(): void {
        if (this.state.inline) {
            CKEDITOR.inline(this.state.id, {
                ...this.state.config
            });
        } else {
            CKEDITOR.replace(this.state.id, {
                ...this.state.config
            });
        }

        // TODO: eventuell bessere Lösung als blur (könnte nicht fertig werden (unvollständiger Text),
        // wenn durch den Klick außerhalb auch gleich der Editor entfernt wird
        // - siehe bei Notes-Sidebar (toggleEditMode))
        CKEDITOR.instances[this.state.id].on('blur', (event) => {
            this.state.value = event.editor.getData();
            (this as any).emit('valueChanged', this.state.value);
        });
    }

    /**
     * Checks if editor is ready (with timeout recursion), stops after 10 attempts
     *
     * @param retryCount optional - number of attempts (default: starts with 1)
     *
     * @return boolean (promise)
     */
    private async isEditorReady(retryCount: number = 1): Promise<boolean> {
        return new Promise<boolean>((resolve) => {
            if (CKEDITOR.instances &&
                CKEDITOR.instances[this.state.id] &&
                CKEDITOR.instances[this.state.id].status === 'ready'
            ) {
                resolve(true);
            } else if (retryCount < 10) {
                setTimeout(() => {
                    resolve(this.isEditorReady(++retryCount));
                }, 200);
            } else {
                resolve(false);
            }
        });
    }

}

module.exports = EditorComponent;


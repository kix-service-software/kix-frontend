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

    public onInput(input: any): void {
        if (input.value && input.value !== this.state.value) {
            this.state.value = input.value || '';
            this.doIfEditorIsReady(() => {
                CKEDITOR.instances[this.state.id].insertHtml(this.state.value);
            });
        }
        if (typeof input.readOnly !== 'undefined' && this.state.readOnly !== input.readOnly) {
            this.state.readOnly = input.readOnly;
            this.doIfEditorIsReady(() => {
                CKEDITOR.instances[this.state.id].setReadOnly(this.state.readOnly);
            });
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

        // TODO: maybe not necessary
        (this as any).emit('editorInitialized', this.state.id);
    }

    /**
     * Does given function when editor is ready (timeout recursion), but stops on 10 attempts
     *
     * @param whatToDo the function which should be done
     * @param retryCount optional - number of attempts (default: starts with 1)
     *
     * @return nothing
     */
    private doIfEditorIsReady(whatToDo: () => void, retryCount?: number): void {
        if (!retryCount) {
            retryCount = 1;
        }
        if (CKEDITOR.instances &&
            CKEDITOR.instances[this.state.id] &&
            CKEDITOR.instances[this.state.id].status === 'ready'
        ) {
            whatToDo();
        } else {
            if (retryCount < 10) {
                setTimeout(() => {
                    this.doIfEditorIsReady(whatToDo, ++retryCount);
                }, retryCount * 100);    // wait a while longer each iteration
            } else {
                return;
            }
        }
    }
}

module.exports = EditorComponent;


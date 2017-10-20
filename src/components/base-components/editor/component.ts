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
        if (this.state.value !== input.value) {
            this.state.value = input.value || '';
            if (CKEDITOR.instances && CKEDITOR.instances[this.state.id]) {
                CKEDITOR.instances[this.state.id].insertHtml(this.state.value);
            }
        }
        if (this.state.readOnly !== input.readOnly) {
            this.state.readOnly = input.readOnly || false;
            if (CKEDITOR.instances && CKEDITOR.instances[this.state.id]) {
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
        // TODO: maybe not necessary
        (this as any).emit('editorInitialized', this.state.id);
    }

    public valueChanged(event: any): void {
        this.state.value = event.target.value;
        (this as any).emit('valueChanged', this.state.value);
    }
}

module.exports = EditorComponent;


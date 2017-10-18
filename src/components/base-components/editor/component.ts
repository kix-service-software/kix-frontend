import { EditorComponentState } from './model/EditorComponentState';
declare var CKEDITOR: any;

class EditorComponent {

    public state: EditorComponentState;

    public onCreate(input: any): void {
        this.state = new EditorComponentState((input.inline ? true : false), input.resize, input.resizeDir);
        this.state.value = (input.defaultValue ? input.defaultValue : '');
        this.state.inline = (input.inline ? true : false);
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

    /**
     * Adds html text to the richtext editor on cursor position
     *
     * @param text the html text string
     *
     * @return nothing
     */
    public addHTML(text: string): void {
        if (CKEDITOR.instances && CKEDITOR.instances[this.state.id]) {
            CKEDITOR.instances[this.state.id].insertHtml(text);
        }
    }
}

module.exports = EditorComponent;


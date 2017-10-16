// declare var ckEditor: any;

class EditorComponent {

    public state: any;
    public ckEditor: any;

    public onCreate(input: any): void {
        this.ckEditor = require('@ckeditor/ckeditor5-build-classic');

        this.state = {
            value: (input.defaultValue ? input.defaultValue : ''),
            type: input.type,
            inline: input.inline,
            id: 'editor-' + Date.now(),
        };
    }

    public onMount(): void {
        const type = 5;
        if (type === 5) {
            this.ckEditor
                .create(document.querySelector('#' + this.state.id))
                .then((editor) => {
                    console.log(editor);
                })
                .catch((error) => {
                    console.error(error);
                });
        } else {
            console.log('bla');
        }
    }

    public valueChanged(event: any): void {
        this.state.value = event.target.value;
        (this as any).emit('valueChanged', this.state.value);
    }
}

module.exports = EditorComponent;


import { EditorComponentState } from './EditorComponentState';

declare var CKEDITOR: any;

class EditorComponent {

    public state: EditorComponentState;

    private autocompleteConfig: any;

    public onCreate(input: any): void {
        this.state = new EditorComponentState(
            input.inline,
            input.simple,
            input.readOnly,
            input.resize,
            input.resizeDir
        );
    }

    public async onInput(input: any): Promise<void> {
        if (await this.isEditorReady()) {
            if (input.addValue) {
                CKEDITOR.instances[this.state.id].insertHtml(input.addValue);
            } else if (input.value) {
                const currentValue = CKEDITOR.instances[this.state.id].getData();
                if (input.value !== currentValue) {
                    CKEDITOR.instances[this.state.id].setData(input.value);
                }
            }
            if (typeof input.readOnly !== 'undefined' && this.state.readOnly !== input.readOnly) {
                this.state.readOnly = input.readOnly;
                CKEDITOR.instances[this.state.id].setReadOnly(this.state.readOnly);
            }
        }

        this.state.invalid = typeof input.invalid !== 'undefined' ? input.invalid : false;
    }

    public async onMount(): Promise<void> {
        if (!this.instanceExists()) {
            if (this.state.inline) {
                CKEDITOR.inline(this.state.id, {
                    ...this.state.config
                });
            } else {
                CKEDITOR.replace(this.state.id, {
                    ...this.state.config
                });
            }

            this.initAutocompleteConfiguration();

            // TODO: eventuell bessere Lösung als blur (könnte nicht fertig werden (unvollständiger Text),
            // wenn durch den Klick außerhalb auch gleich der Editor entfernt wird
            // - siehe bei Notes-Sidebar (toggleEditMode))
            CKEDITOR.instances[this.state.id].on('blur', (event) => {
                const value = event.editor.getData();
                (this as any).emit('valueChanged', value);
            });
        }
    }

    private initAutocompleteConfiguration(): void {
        const matchCallback = (text, offset) => {
            // Get the text before the caret.
            const left = text.slice(0, offset);
            const match = left.match(/#\w*$/);

            if (!match) {
                return null;
            }

            return { start: match.index, end: offset };
        };

        this.autocompleteConfig = {

            textTestCallback: (range) => {
                if (!range.collapsed) {
                    return null;
                }
                return CKEDITOR.plugins.textMatch.match(range, matchCallback);
            },

            dataCallback: (matchInfo, callback) => {
                const query = matchInfo.query.substring(1);
                const result = [
                    { id: 'Bloh', name: 'Bloh' },
                    { id: 'Bleh', name: 'Bleh' },
                    { id: 'Blah', name: 'Blah' },
                    { id: 'Blih', name: 'Blih' },
                ].filter((o) => o.name.indexOf(query) !== -1);

                callback(result);
            },
            itemTemplate: '<li data-id="{id}">{name}</li>',
            outputTemplate: '<span>{name} (#{id})</span>'
        };

        setTimeout(() => {
            // tslint:disable-next-line:no-unused-expression
            new CKEDITOR.plugins.autocomplete(CKEDITOR.instances[this.state.id], this.autocompleteConfig);
        }, 500);
    }

    // TODO: bessere Lösung finden (im Moment gibt es warnings im Log, ...->
    // weil der Editor schon kurz nach Instanziierung wieder zerstört wird)
    public async onDestroy(): Promise<void> {
        if (this.instanceExists()) {
            CKEDITOR.instances[this.state.id].destroy();
        }
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
            if (
                this.instanceExists() &&
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

    /**
     * Checks if an instance exists
     *
     * @return boolean (promise)
     */
    private instanceExists(): boolean {
        return CKEDITOR && CKEDITOR.instances && CKEDITOR.instances[this.state.id];
    }

}

module.exports = EditorComponent;


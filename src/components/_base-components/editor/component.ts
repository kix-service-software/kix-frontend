import { ComponentState } from './ComponentState';
import { ServiceRegistry, IKIXObjectService } from '@kix/core/dist/browser';
import { AutocompleteFormFieldOption } from '@kix/core/dist/browser/components';

declare var CKEDITOR: any;

class EditorComponent {

    public state: ComponentState;
    private editor: any;
    private autoCompletePlugins: any[] = [];
    private useReadonlyStyle: boolean = false;

    public onCreate(input: any): void {
        this.state = new ComponentState(
            input.inline,
            input.simple,
            input.readOnly,
            input.resize,
            input.resizeDir
        );
    }

    public async onInput(input: any): Promise<void> {
        this.useReadonlyStyle = typeof input.useReadonlyStyle ? input.useReadonlyStyle : false;
        if (await this.isEditorReady()) {
            if (input.addValue) {
                this.editor.insertHtml(input.addValue);
            } else if (input.value) {
                const currentValue = this.editor.getData();
                if (input.value !== currentValue) {
                    this.editor.setData(input.value);
                }
            }
            if (typeof input.readOnly !== 'undefined' && this.state.readOnly !== input.readOnly) {
                this.state.readOnly = input.readOnly;
                this.editor.setReadOnly(this.state.readOnly);
            }
        }
        this.state.invalid = typeof input.invalid !== 'undefined' ? input.invalid : false;
    }

    public async onMount(): Promise<void> {
        this.autoCompletePlugins = [];

        if (!this.instanceExists()) {
            if (this.state.inline) {
                this.editor = CKEDITOR.inline(this.state.id, {
                    ...this.state.config
                });
            } else {
                this.editor = CKEDITOR.replace(this.state.id, {
                    ...this.state.config
                });
            }

            // TODO: eventuell bessere Lösung als blur (könnte nicht fertig werden (unvollständiger Text),
            // wenn durch den Klick außerhalb auch gleich der Editor entfernt wird
            // - siehe bei Notes-Sidebar (toggleEditMode))
            this.editor.on('blur', (event) => {
                const value = event.editor.getData();
                (this as any).emit('valueChanged', value);
            });

            if (this.state.readOnly) {
                this.editor.on('contentDom', () => {
                    const editable = this.editor.editable();
                    editable.attachListener(editable, 'click', (evt) => {
                        const link = new CKEDITOR.dom.elementPath(evt.data.getTarget(), this).contains('a');
                        if (link && evt.data.$.button !== 2 && link.isReadOnly()) {
                            window.open(link.getAttribute('href'));
                        }
                    });
                });

                if (this.useReadonlyStyle) {
                    if (await this.isEditorReady()) {
                        setTimeout(() => {
                            const element = document.getElementById('cke_' + this.state.id);
                            if (element) {
                                const iframe = element.getElementsByTagName('iframe')[0];
                                iframe.contentWindow.document.body.style.backgroundColor = 'transparent';
                                iframe.classList.remove('cke_wysiwyg_frame', 'cke_reset');
                                iframe.classList.add('readonly-ck-editor');
                            }
                        }, 500);
                    }
                }
            }
        }
    }

    public setAutocompleteConfiguration(autocompleteOption: AutocompleteFormFieldOption): void {
        autocompleteOption.autocompleteObjects.forEach((ao) => {
            const service = (ServiceRegistry.getInstance().getServiceInstance(ao.objectType) as IKIXObjectService);
            if (service) {
                const config = service.getAutoFillConfiguration(CKEDITOR.plugins.textMatch, ao.placeholder);
                if (config) {
                    const plugin = new CKEDITOR.plugins.autocomplete(this.editor, config);
                    plugin.getHtmlToInsert = function (item) {
                        return this.outputTemplate ? this.outputTemplate.output(item) : item.name;
                    };
                    this.autoCompletePlugins.push(plugin);
                }
            }
        });
    }

    // TODO: bessere Lösung finden (im Moment gibt es warnings im Log, ...->
    // weil der Editor schon kurz nach Instanziierung wieder zerstört wird)
    public async onDestroy(): Promise<void> {
        if (this.instanceExists()) {
            this.autoCompletePlugins.forEach((p) => p.close());
            this.editor.destroy();
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
                this.editor.status === 'ready'
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


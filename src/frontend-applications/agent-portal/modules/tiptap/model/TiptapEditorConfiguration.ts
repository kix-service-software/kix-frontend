import { IConfiguration } from '../../../model/configuration/IConfiguration';

export class TiptapEditorConfiguration implements IConfiguration {

    public static CONFIGURATION_ID = 'agent-portal-tiptap-editor-configuration';

    public id: string = TiptapEditorConfiguration.CONFIGURATION_ID;
    public name: string = 'Tiptap Editor Configuration';
    public type: string = 'Tiptap';
    public application: string = 'agent-portal';
    public valid: boolean = true;
    public roleIds: number[];

    public editorName = 'Tiptap Editor';

    public placeholder = 'Start writing your ticket...';

}
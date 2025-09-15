import { IConfiguration } from '../../../model/configuration/IConfiguration';

export class QuillEditorConfiguration implements IConfiguration {
    public static CONFIGURATION_ID = 'agent-portal-quill-editor-configuration';

    public id: string = QuillEditorConfiguration.CONFIGURATION_ID;
    public name: string = 'Quill Editor Configuration';
    public type: string = 'QuillEditor';
    public application: string = 'agent-portal';
    public valid: boolean = true;
    public roleIds: number[];

    public toolbarOptions = [
        [{ 'header': [1, 2, false] }],
        ['bold', 'italic', 'underline'],
        ['code-block', 'blockquote'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        ['link', 'image']
    ];

    public placeholder = 'Start writing your ticket...';
}
import { IKIXModuleExtension } from '../../model/IKIXModuleExtension';
import { UIComponent } from '../../model/UIComponent';
import { KIXExtension } from '../../../../server/model/KIXExtension';

class Extension extends KIXExtension implements IKIXModuleExtension {

    public id = 'kix-module-quill';

    public applications: string[] = ['agent-portal'];

    public external: boolean = false;

    public webDependencies: string[] = [
        './quill/webapp'
    ];

    public initComponents: UIComponent[] = [
        new UIComponent('UIModule', '/kix-module-quill$0/webapp/core/QuillUIModule', [])
    ];

    public uiComponents: UIComponent[] = [
        new UIComponent('quill-editor', '/kix-module-quill$0/webapp/components/quill-editor', []),
    ];

}

module.exports = (data, host, options): Extension => {
    return new Extension();
};
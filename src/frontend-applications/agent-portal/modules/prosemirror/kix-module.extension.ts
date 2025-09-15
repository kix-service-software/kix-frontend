import { IKIXModuleExtension } from '../../model/IKIXModuleExtension';
import { UIComponent } from '../../model/UIComponent';
import { KIXExtension } from '../../../../server/model/KIXExtension';

class Extension extends KIXExtension implements IKIXModuleExtension {

    public id = 'kix-module-prosemirror';

    public applications: string[] = ['agent-portal'];

    public external: boolean = false;

    public webDependencies: string[] = [
        './prosemirror/webapp'
    ];

    public initComponents: UIComponent[] = [
        new UIComponent('UIModule', '/kix-module-prosemirror$0/webapp/core/ProsemirrorEditorUIModule', [])
    ];

    public uiComponents: UIComponent[] = [
        new UIComponent('prosemirror-editor', '/kix-module-prosemirror$0/webapp/components/prosemirror-editor', []),
    ];

}

module.exports = (data, host, options): Extension => {
    return new Extension();
};
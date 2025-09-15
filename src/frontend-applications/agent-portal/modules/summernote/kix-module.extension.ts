import { IKIXModuleExtension } from '../../model/IKIXModuleExtension';
import { UIComponent } from '../../model/UIComponent';
import { KIXExtension } from '../../../../server/model/KIXExtension';

class Extension extends KIXExtension implements IKIXModuleExtension {

    public id = 'kix-module-summernote';

    public applications: string[] = ['agent-portal'];

    public external: boolean = false;

    public webDependencies: string[] = [
        './summernote/webapp'
    ];

    public initComponents: UIComponent[] = [
        new UIComponent('UIModule', '/kix-module-summernote$0/webapp/core/SummerNoteUIModule', [])
    ];

    public uiComponents: UIComponent[] = [
        new UIComponent('summernote-editor', '/kix-module-summernote$0/webapp/components/summernote-editor', [])
    ];

}

module.exports = (data, host, options): Extension => {
    return new Extension();
};
import { IKIXModuleExtension } from '../../model/IKIXModuleExtension';
import { UIComponent } from '../../model/UIComponent';
import { KIXExtension } from '../../../../server/model/KIXExtension';

class Extension extends KIXExtension implements IKIXModuleExtension {

    public id = 'kix-module-toast';

    public applications: string[] = ['agent-portal'];

    public external: boolean = false;

    public webDependencies: string[] = [
        './toast/webapp'
    ];

    public initComponents: UIComponent[] = [
        new UIComponent('UIModule', '/kix-module-toast$0/webapp/core/ToastUIModule', [])
    ];

    public uiComponents: UIComponent[] = [
        new UIComponent('refresh-app-toast', '/kix-module-toast$0/webapp/components/refresh-app-toast', []),
        new UIComponent('success-toast', '/kix-module-toast$0/webapp/components/success-toast', []),
        new UIComponent('info-toast', '/kix-module-toast$0/webapp/components/info-toast', []),
        new UIComponent('error-toast', '/kix-module-toast$0/webapp/components/error-toast', [])
    ];

}

module.exports = (data, host, options): Extension => {
    return new Extension();
};
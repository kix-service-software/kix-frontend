/**
 * Copyright (C) 2006-2025 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IKIXModuleExtension } from '../../model/IKIXModuleExtension';
import { UIComponent } from '../../model/UIComponent';
import { KIXExtension } from '../../../../server/model/KIXExtension';

class Extension extends KIXExtension implements IKIXModuleExtension {

   public id = 'kix-module-file';

   public applications: string[] = ['agent-portal'];

   public external: boolean = false;

   public webDependencies: string[] = [
       './file/webapp'
   ];

   public initComponents: UIComponent[] = [
       new UIComponent('UIModule', '/kix-module-file$0/webapp/core/FileUIModule', [])
   ];

   public uiComponents: UIComponent[] = [
       // new UIComponent('your-component', '/kix-module-file$0/webapp/components/your-component', []),
   ];

}

module.exports = (data, host, options): Extension => {
   return new Extension();
};
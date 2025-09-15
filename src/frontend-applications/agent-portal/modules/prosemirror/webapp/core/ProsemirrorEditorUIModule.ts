import { IUIModule } from '../../../../model/IUIModule';

export class UIModule implements IUIModule {

   public name: string = 'ProsemirrorEditorUIModule';

   public priority: number = 5000;

   public async register(): Promise<void> {
       // register some module stuff, e.g. Context, LabelProvider, TableFactory, Actions, ...
   }

   public async registerExtensions(): Promise<void> {
       return;
   }

}
import { ISidebar } from './../model/client/components/';

export interface ISidebarFactoryExtension {

    createSidebar(): ISidebar;

    getSidebarId(): string;

    getDefaultConfiguration(): any;

}

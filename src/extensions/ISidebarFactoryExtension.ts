import { ISidebar } from './../model/client/components/';

export interface ISidebarFactoryExtension {

    // creates the sidebar implemantation and returns it
    createSidebar(): ISidebar;

    // returns the internal id of a sidebar (not DOM id!)
    getSidebarId(): string;

    // returns the default configuration for a sidebar
    getDefaultConfiguration(): any;

}

import { MainMenuCommunicator } from './MainMenuCommunicator';
import { ICommunicatorExtension } from './../extensions/';

export class MainMenuCommunicatorExtension implements ICommunicatorExtension {

    public getCommunicatorClass(): any {
        return MainMenuCommunicator;
    }

}

module.exports = (data, host, options) => {
    return new MainMenuCommunicatorExtension();
};

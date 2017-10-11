import { IMarkoDependencyExtension } from '@kix/core';

export class NotesSidebarMarkoDependencyExtension implements IMarkoDependencyExtension {

    public getDependencies(): string[] {
        return [
            "sidebars/notes",
            "sidebars/notes/configuration"
        ];
    }

    public isExternal(): boolean {
        return false;
    }

}

module.exports = (data, host, options) => {
    return new NotesSidebarMarkoDependencyExtension();
};

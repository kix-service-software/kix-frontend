import { IMarkoDependencyExtension } from '@kix/core';

export class NotesSidebarMarkoDependencyExtension implements IMarkoDependencyExtension {

    public getDependencies(): string[] {
        return [
            "widgets/notes",
            "widgets/notes/configuration"
        ];
    }

    public isExternal(): boolean {
        return false;
    }

}

module.exports = (data, host, options) => {
    return new NotesSidebarMarkoDependencyExtension();
};

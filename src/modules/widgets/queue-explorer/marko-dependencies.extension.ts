import { IMarkoDependencyExtension } from '@kix/core/dist/extensions';

export class QueueExplorerWidgetMarkoDependencyExtension implements IMarkoDependencyExtension {

    public getDependencies(): string[] {
        return [
            "widgets/queue-explorer"
        ];
    }

    public getComponentTags(): Array<[string, string]> {
        return [
            ['queue-explorer-widget', 'widgets/queue-explorer']
        ];
    }

    public isExternal(): boolean {
        return false;
    }

}

module.exports = (data, host, options) => {
    return new QueueExplorerWidgetMarkoDependencyExtension();
};

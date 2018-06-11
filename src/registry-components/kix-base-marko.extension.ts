import { IMarkoDependencyExtension } from '@kix/core/dist/extensions';

export class KIXMarkoDependencyExtension implements IMarkoDependencyExtension {

    public getDependencies(): string[] {
        return [
            ...this.getDialogFormDependencies(),
            ...this.getGeneralWidgetDependencies(),
            'quick-search',
            'home/home-module',
            '_base-components/base-html-components/list-with-title'
        ];
    }

    private getDialogFormDependencies(): string[] {
        return [
            '_base-components/form-main/inputs/form-default-input',
            '_base-components/form-main/inputs/form-dropdown'
        ];
    }

    private getGeneralWidgetDependencies(): string[] {
        return [
            'widgets/notes-widget'
        ];
    }

    public getComponentTags(): Array<[string, string]> {
        return [
            ...this.getDialogFormTags(),
            ...this.getGeneralWidgetTags(),
            ['home', 'home/home-module'],
            ['icon', '_base-components/icon'],
            ['list-with-title', '_base-components/base-html-components/list-with-title']
        ];
    }

    private getDialogFormTags(): Array<[string, string]> {
        return [
            ['form-default-input', '_base-components/form-main/inputs/form-default-input'],
            ['form-dropdown', '_base-components/form-main/inputs/form-dropdown']
        ];
    }

    private getGeneralWidgetTags(): Array<[string, string]> {
        return [
            ['notes-widget', 'widgets/notes-widget']
        ];
    }

    public isExternal(): boolean {
        return false;
    }

}

module.exports = (data, host, options) => {
    return new KIXMarkoDependencyExtension();
};

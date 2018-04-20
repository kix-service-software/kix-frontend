import { IMarkoDependencyExtension } from '@kix/core/dist/extensions';

export class KIXMarkoDependencyExtension implements IMarkoDependencyExtension {

    public getDependencies(): string[] {
        return [
            ...this.getDialogFormDependencies(),
            'quick-search',
            'home/home-module',
        ];
    }

    private getDialogFormDependencies(): string[] {
        return [
            '_base-components/form-main/inputs/form-text-input',
            '_base-components/form-main/inputs/form-dropdown'
        ];
    }


    public getComponentTags(): Array<[string, string]> {
        return [
            ...this.getDialogFormTags(),
            ['home', 'home/home-module'],
            ['icon', '_base-components/icon']
        ];
    }

    private getDialogFormTags(): Array<[string, string]> {
        return [
            ['form-text-input', '_base-components/form-main/inputs/form-text-input'],
            ['form-dropdown', '_base-components/form-main/inputs/form-dropdown']
        ];
    }

    public isExternal(): boolean {
        return false;
    }

}

module.exports = (data, host, options) => {
    return new KIXMarkoDependencyExtension();
};

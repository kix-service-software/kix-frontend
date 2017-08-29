export interface IMarkoDependencyExtension {

    getDependencies(): string[];

    isExternal(): boolean;

}

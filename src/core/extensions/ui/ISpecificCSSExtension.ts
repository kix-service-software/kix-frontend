/**
 * Interface for CSS extensions. The extension provides an array with paths
 * to css files which should be integrated into the base template.
 * This CSS will overwrite existings themes and other CSS.
 */
export interface ISpecificCSSExtension {

    /**
     * The path must be an absoulte path to the static folder of the module
     * e.g.: /module-static/css/module.css
     * Module specific static folders can be registered via the {@link IStaticContentExtension} extension
     *
     * @return an arry of paths with the module specific css files
     */
    getSpecificCSSPaths(): string[];

}

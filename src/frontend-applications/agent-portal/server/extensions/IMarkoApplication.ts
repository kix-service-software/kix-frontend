/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

export interface IMarkoApplication {

    /**
     * The name of the application. The name of the folder where the application is contained.
     */
    name: string;

    /**
     * internal modul path to the main marko component.
     */
    path: string;

    /**
     * if internal the module has to be located in modules folder, otherwise in plugins.
     */
    internal: boolean;

}

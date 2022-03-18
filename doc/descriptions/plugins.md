### Indruction
The framework provides the possibility to provide functionality via plugins with the help of extension points. One Plugin can contain several extension point implementations. 

A extension point describes a specific interface which one is needed to be implemented by the extension.

### Structure of a Plugin
<ul>
    <li><b>src</b></li>
        <ul>
            <li>package.json</li>
            <li>RELEASE</li>
            <li>locale</li>
            <li><i>[module]</i></li>            
        </ul>
    <li>README.md</li>
    <li><i>(other files to organise the plugin, e.g. ci/cd definitions, ide configurations)</i></li>
</ul>

The **src** folder contains the main implementation of the plugin.

#### RELEASE File
The RELEASE file defines the current state and the requirements of the plugin. This file is evaluated at frontend server startup and checks the dependencies from the REQUIRES field. If dependencies could not be resolved the plugin will not be available in the software.

| Property    | Value                              | Example                             |
| ----------- | ---------------------------------- | ----------------------------------- |
| PRODUCT     | Name of th plugin                  | MyPlugin                            |
| VERSION     | String which describes the version | 1 or V1                             |
| BUILDDATE   | String with the date of build      | Fri, 17 Apr 2020 07:30:54 +0200     |
| BUILDNUMBER | The build number of the version    | 1, 3354                             |
| PATCHNUMBER | The patch number of the version    | 1                                   |
| REQUIRES    | Dependencies for the plugin        | framework(>3), backend::Maintenance |

**REQUIRES**
Following syntax is supported for the REQUIRES dependencies:
* **framework** *(the frontend it self)*
* **framework(>1)** *(the frontend must be available in the specified version)*
* **pluginname** *(only the name of the depending plugin; plugin must be available)*
* **pluginname(>1)** *(the name of the depending plugin with a version requirement; plugin must be available in the specified version; supported operators: >, <, =, !)*
* **backend** *(the KIX backend)*
* **backend::pluginname** *(this plugin must be available in KIX backend)*
* **backend::pluginname(>1)** *(this plugin must be available in the specified version in KIX backend)*

Example:
```
PRODUCT = MyPlugin
VERSION = 1
BUILDDATE = Fri, 17 Apr 2020 07:30:54 +0200
BUILDNUMBER = 12
PATCHNUMBER = 0
REQUIRES = framework(>3340), backend::KIXPro
```

#### Package.json File
This file contains the name of the plugin. This is important for bundling the wep application.

Example:
```
{
    "name": "MyPlugin"
}
```

#### locale
This folder should contain the po files for the translations if the plugin provide new translations.

To provide this translation files to KIX you have to register on extension point `kix:locale` and implement the extension interface `ILocaleExtension`.

#### [module]
A module contains implementations for a specific context or topic (e.g. ticket, cmdb, faq, maintenance, calendar).

The following structure of a module is recommended:

* **model** *(datamodel for the module)*
* **server** *(implementations for the server side, e.g. services for KIX backend communication, socket namespaces)*
* **tests** *(test implementation for the module)*
* **webapp** *(implementation for the agent portal wep application)*
* **package.json** *(defines the name of the module and the list of extensions)*
* ***[...extension.ts]*** *(a specific extension implementation)*

![Module Structure](static/module-structure.png)
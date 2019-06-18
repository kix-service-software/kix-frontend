#### Extensions & Extension Points
The frontend server provides extension points to add or extend existing functionality. An extension point has a defined interface which has to be implemented to successfully add an extension to the software.

The `PluginService` scans the configured directories for registered extensions. A registration for an extension has to be done in a `package.json` file with an object `extensions`. 

The configuration for the search directories can be done in the `server.config.json`. By default the following directories are configured:
```json
...
"PLUGIN_FOLDERS": [
        "node_modules/@kix",
        "extensions"
    ],
...
```

##### Use a extension point
`package.json`:
```json
{
    ...
    "extensions": {
        "EXTENSION_POINT_ID": {
            "EXTENSION_ID": "PATH_TO_EXTENSION_IMPLEMENTATION"
        }
    }
    ...
}
```
| Key                              | Description                                                     |
| -------------------------------- | --------------------------------------------------------------- |
| extensions                       | the fixed key for the extension object                          |
| EXTENSION_POINT_ID               | the id of the extension point which is provided by the software |
| EXTENSION_ID                     | the id of the extension point which add/extend the software     |
| PATH_TO_EXTENSION_IMPLEMENTATION | the path to the implementation of the extension point interface |

##### Implementation

```javascript
export class Extension [extends | implements] Extensions {

    // Extension Implementation

}

module.exports = (data, host, options) => {
    return new Extension();
};
```
import { ConfigurationService } from "../src/core/services";
import { PluginService } from "../src/services";
ConfigurationService.getInstance().init(__dirname + '/../config/', __dirname + '/../cert');
PluginService.getInstance().init(['extensions']);

import { getConfig } from "src/config";
import { capitalize } from "lodash";

import { loadNotificationPlugin } from "src/plugin/notification";
import { checkValidConfig } from "./helpers";

export const notificationTest = async (commandOptions) => {
  const config = getConfig();
  await checkValidConfig(config);
  console.log(`Running notification test.`);
  let notificationPlugins = getConfig("notifications") ?? [];
  if (commandOptions.pluginType !== undefined) {
    notificationPlugins = notificationPlugins.filter(
      (p) => p.type === commandOptions.pluginType
    );
  }

  for (const plugin of notificationPlugins) {
    try {
      console.log(`Sending notifications via ${capitalize(plugin.type)}`);
      const testConfig = {
        ...plugin,
        messageTemplate: `Breadcrumbs: Notification Test`,
      };
      const notificator = await loadNotificationPlugin(testConfig);
      await notificator.notify({
        cycle: "test",
        cycleStakingBalance: "test",
        totalDistributed: "test",
        numberOfDelegators: "test",
      });
      console.log(`${capitalize(plugin.type)} notifications sent`);
    } catch (e) {
      console.log(`Notification error.`);
      console.log(e);
    }
  }
  console.log(`Notification test completed.`);
};

export type NotificationPluginConfiguration = {
  name?: string;
  type: string;
  message: string;
};

export type PluginHostDetails = {
  id: string;
  version: string;
};

export enum ENotificationLevel {
  Error,
  Warning,
  Info,
}

export enum ENotificationPluginKind {
  Discord = "discord",
  Telegram = "telegram",
  Native = "native",
}

export interface NotificationPlugin {
  notify(
    message: string,
    data?: NotificationInputData,
    level?: ENotificationLevel
  );
}

export interface NotificationInputData {
  cycle: string;
  cycleStakingBalance: string;
  totalDistributed: string;
  numberOfDelegators: string;
}

export type NotificationPluginConfiguration = {
  name?: string;
  type: string;
  public: boolean;
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
    data?: { [key: string]: string },
    level?: ENotificationLevel
  );
}

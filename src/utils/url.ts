export const getExplorerUrl = (
  ophash: string,
  template = "https://mainnet.tzkt.io/<ophash>"
) => {
  return template.replace(/<ophash>/, ophash);
};

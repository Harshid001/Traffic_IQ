module.exports = ({ config }) => {
  const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL || config.extra?.apiBaseUrl || "http://localhost:8005";
  
  return {
    ...config,
    extra: {
      ...config.extra,
      apiBaseUrl: apiBaseUrl,
    },
  };
};

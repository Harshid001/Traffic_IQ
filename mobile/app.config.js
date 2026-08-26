const { withAndroidManifest } = require('@expo/config-plugins');

module.exports = ({ config }) => {
  const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL || config.extra?.apiBaseUrl || "http://192.168.1.147:8005";
  
  const updatedConfig = {
    ...config,
    extra: {
      ...config.extra,
      apiBaseUrl: apiBaseUrl,
    },
  };

  return withAndroidManifest(updatedConfig, async (config) => {
    const androidManifest = config.modResults.manifest;
    if (androidManifest && androidManifest.application && androidManifest.application[0]) {
      androidManifest.application[0].$['android:usesCleartextTraffic'] = 'true';
    }
    return config;
  });
};

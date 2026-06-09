export const Config = {
  // Your local backend — for physical device use your Mac IP (ipconfig getifaddr en0)
  // For iOS simulator, localhost works fine
  apiBaseUrl: 'http://172.20.10.2:8000',

  // Set to false — we have a real backend now
  useMock: false,

  // Set to false to disable all ads during testing
  adsEnabled: false,

  admobBannerIos: 'ca-app-pub-3940256099942544/2934735716',
  admobBannerAndroid: 'ca-app-pub-3940256099942544/6300978111',
  admobInterstitialIos: 'ca-app-pub-3940256099942544/4411468910',
  admobInterstitialAndroid: 'ca-app-pub-3940256099942544/1033173712',
  admobRewardedIos: 'ca-app-pub-3940256099942544/1712485313',
  admobRewardedAndroid: 'ca-app-pub-3940256099942544/5224354917',

  interstitialEveryNScans: 2,  // show interstitial every 2 scans
  maxHistoryFree: 10,
} as const;
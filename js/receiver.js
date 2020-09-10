const context = cast.framework.CastReceiverContext.getInstance();
const playerManager = context.getPlayerManager();
const options = new cast.framework.CastReceiverOptions();

playerManager.setMessageInterceptor(
  cast.framework.messages.MessageType.LOAD,
  request => {
    if (request.media && request.media.customData) {
      // Live content
      if (request.media.customData.isLive) {
        request.media.streamType = cast.framework.messages.StreamType.LIVE;
        playerManager.removeSupportedMediaCommands(cast.framework.messages.Command.SEEK, true);
        playerManager.setMessageInterceptor(
          cast.framework.messages.MessageType.SEEK,
          seekData => {
            // if the SEEK supported media command is disabled, block seeking
            if (!(playerManager.getSupportedMediaCommands() && cast.framework.messages.Command.SEEK)) {
              return null;
            }
            return seekData;
          });
      }
      // DRM content
      if (request.media.customData.licenseUrl) {
        playerManager.setMediaPlaybackInfoHandler((loadRequest, playbackConfig) => {
          playbackConfig.protectionSystem = cast.framework.ContentProtection.WIDEVINE;
          playbackConfig.licenseUrl = request.media.customData.licenseUrl;
          if (typeof request.media.customData.credentials === 'boolean' || typeof request.media.customData.licenseHeaders === 'object') {
            playbackConfig.licenseRequestHandler = requestInfo => {
              if (typeof request.media.customData.credentials === 'boolean') {
                requestInfo.withCredentials = request.media.customData.credentials;
              }
              if (typeof request.media.customData.licenseHeaders === 'object') {
                requestInfo.headers = request.media.customData.licenseHeaders;
              }
            };
          }
          return playbackConfig;
        });
      }
    }
    return request;
  }
);

context.start(options);

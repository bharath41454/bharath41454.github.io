'use strict';

import { CastQueue } from './queuing.js';

const context = cast.framework.CastReceiverContext.getInstance();
const playerManager = context.getPlayerManager();


const LOG_RECEIVER_TAG = 'Receiver';

/**
 * Debug Logger
 */
const castDebugLogger = cast.debug.CastDebugLogger.getInstance();

/**
 * WARNING: Make sure to turn off debug logger for production release as it
 * may expose details of your app.
 * Uncomment below line to enable debug logger and show a 'DEBUG MODE' tag at
 * top left corner.
 */
castDebugLogger.setEnabled(true);

/**
 * Uncomment below line to show debug overlay.
 */
castDebugLogger.showDebugLogs(true);

/**
 * Set verbosity level for Core events.
 */
castDebugLogger.loggerLevelByEvents = {
  'cast.framework.events.category.CORE': 
    cast.framework.LoggerLevel.INFO,
  'cast.framework.events.EventType.MEDIA_STATUS': 
    cast.framework.LoggerLevel.DEBUG
};
const LOG_TAG1 = 'Tag1';
const LOG_TAG2 = 'Tag2';

// Set verbosity level for custom tags
castDebugLogger.loggerLevelByTags = {
    [LOG_TAG1]: cast.framework.LoggerLevel.WARNING,
    [LOG_TAG2]: cast.framework.LoggerLevel.DEBUG,
};
castDebugLogger.debug(LOG_TAG1, 'debug log from tag1');
castDebugLogger.info(LOG_TAG1, 'info log from tag1');
castDebugLogger.warn(LOG_TAG1, 'warn log from tag1');
castDebugLogger.error(LOG_TAG1, 'error log from tag1');

if (!castDebugLogger.loggerLevelByTags) {
  castDebugLogger.loggerLevelByTags = {};
}

/**
 * Set verbosity level for custom tag.
 * Enables log messages for error, warn, info and debug.
 */
castDebugLogger.loggerLevelByTags[LOG_RECEIVER_TAG] = 
  cast.framework.LoggerLevel.DEBUG;

/**
 * Example of how to listen for events on playerManager.
 */
playerManager.addEventListener(
  cast.framework.events.EventType.ERROR, (event) => {
    castDebugLogger.error(LOG_RECEIVER_TAG,
      'Detailed Error Code - ' + event.detailedErrorCode);
    if (event && event.detailedErrorCode == 905) {
      castDebugLogger.error(LOG_RECEIVER_TAG,
        'LOAD_FAILED: Verify the load request is set up ' +
        'properly and the media is able to play.');
    }
});

playerManager.addEventListener(
  cast.framework.events.EventType.LOAD_START,
  callbackcheck
  );

  playerManager.addEventListener(
    cast.framework.events.EventType.PLAY,
    callbackcheck
  );
/**
 * Intercept the LOAD request to be able to read in a contentId and get data.
 */
playerManager.setMessageInterceptor(
  cast.framework.messages.MessageType.LOAD, loadRequestData => {
    castDebugLogger.debug(LOG_RECEIVER_TAG,
      `LOAD interceptor loadRequestData: ${JSON.stringify(loadRequestData)}`);
    if (!loadRequestData || !loadRequestData.media) {
      const error = new cast.framework.messages.ErrorData(
        cast.framework.messages.ErrorType.LOAD_FAILED);
      error.reason = cast.framework.messages.ErrorReason.INVALID_REQUEST;
      castDebugLogger.error(LOG_RECEIVER_TAG, 'Invalid load request');
      return error;
    }
    if (!loadRequestData.media.contentUrl) {
      castDebugLogger.warn(LOG_RECEIVER_TAG,
        'Playable URL is missing. Using ContentId as a fallback.');
      if (!loadRequestData.media.contentId) {
        castDebugLogger.error(LOG_RECEIVER_TAG,
          'Missing Content ID and Playable URL.');
      }
    }
    return loadRequestData;
  });

const playbackConfig = new cast.framework.PlaybackConfig();

/**
 * Set the player to start playback as soon as there are five seconds of
 * media content buffered. Default is 10.
 */
playbackConfig.autoResumeDuration = 5;
castDebugLogger.info(LOG_RECEIVER_TAG,
  `autoResumeDuration set to: ${playbackConfig.autoResumeDuration}`);

/**
 * Set the control buttons in the UI controls.
 */
const controls = cast.framework.ui.Controls.getInstance();
controls.clearDefaultSlotAssignments();

/**
 * Assign buttons to control slots.
 */
controls.assignButton(
  cast.framework.ui.ControlsSlot.SLOT_1,
  cast.framework.ui.ControlsButton.QUEUE_PREV
);
controls.assignButton(
  cast.framework.ui.ControlsSlot.SLOT_2,
  cast.framework.ui.ControlsButton.CAPTIONS
);
controls.assignButton(
  cast.framework.ui.ControlsSlot.SLOT_3,
  cast.framework.ui.ControlsButton.SEEK_FORWARD_15
);
controls.assignButton(
  cast.framework.ui.ControlsSlot.SLOT_4,
  cast.framework.ui.ControlsButton.QUEUE_NEXT
);

context.start({
  queue: new CastQueue(),
  playbackConfig: playbackConfig,
  supportedCommands: cast.framework.messages.Command.ALL_BASIC_MEDIA |
                      cast.framework.messages.Command.QUEUE_PREV |
                      cast.framework.messages.Command.QUEUE_NEXT
});

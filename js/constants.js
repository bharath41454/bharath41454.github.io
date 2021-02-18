const castFramework = cast.framework;
const context = castFramework.CastReceiverContext.getInstance();
const playerManager = context.getPlayerManager();
const options = new castFramework.CastReceiverOptions();
const castMessages = castFramework.messages;
const castMessageType = castMessages.MessageType;

// cast debug
const castDebug = cast.debug;
const castDebugLogger = castDebug.CastDebugLogger.getInstance();
const LOG_RECEIVER_TAG = 'Receiver';
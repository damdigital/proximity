const LOG_LEVEL = "debug"

const whiteList = /.*/
// export const whiteList = /!|.*Ctrl|run/
const logLevels = ['error', 'warn', 'log', 'info', 'debug'];
const numLogLevel = logLevels.indexOf(LOG_LEVEL);

export const createLogger = (prefix, parentLog) => {
  var log = parentLog || window.console
  var match = prefix.match(whiteList)

  function e(fnName) {
    if (!log[fnName]) {
      fnName = 'log'
    }

    return (match || logLevels.indexOf(fnName) <= numLogLevel)
      ? log[fnName].bind(log, '[' + prefix + ']')
      : () => {}
  }

  return (
    { debug: e('debug')
    , info:  e('info')
    , log:   e('log')
    , warn:  e('warn')
    , error: e('error')
    }
  )
}

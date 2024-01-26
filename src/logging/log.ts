const iaDefaultLogger = {
    warning: (message:string) => {
        //console.warn(message)
    },
    info: (message:string) => {
        //console.log(message)
    },
    error: (message:string) => {
        //console.log(message)
    },
    debug: (message:string) => {
        //console.log(message)
    },
    verbose: (message:string) => {
        //console.log(message)
    }
}
var iaLogger = iaDefaultLogger;

export default iaLogger
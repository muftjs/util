class CustomError extends Error {
  constructor(code = '401', message=null, error=null, ...params) {
    // Pass remaining arguments (including vendor specific ones) to parent constructor
    super(...params);

    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, CustomError);

    // Custom debugging information
    this.code = code;
    this.error = error;
    this.message = message;
    // this.date = new Date();
  }
};

module.exports = class Response {
    constructor() {
        this.version = 1.0
    }

    humanize(str) {
      var frags = str.split('_');
      for (let i=0; i<frags.length; i++) {
        frags[i] = frags[i].charAt(0).toUpperCase() + frags[i].slice(1);
      }
      return frags.join(' ');
    }

    errorThrow(code,message, error) {
        return new CustomError(code, message, error);
    }

    print(message=null, data, code=null, append={}) {
        code = code ? code : 200;

        var response = {}
        if(message) {
            response['message'] = message
        }
        response['data'] = data
            
        response = Object.assign({}, response, append)
        return response
    }

    printError(message=null, data, code=null, append={}) {
        code = code ? code : 400;
        var response = {}
        let responseError = {}
        if(message) {
            responseError['message'] = message
        }

        if(code) {
            responseError['code'] = code
        }
        
        responseError['errors'] = data || [{
            code: code, 
            message: message
        }]

        response['error'] = responseError
        response = Object.assign({}, response, append)
        return response
    }

    

    say() {
        return 'hello'
    }


    parseMongooseFirstError(err) {
        var errObj = err.errors

        if(err.errors) {
            // Get First Key Name in Error Object
            var errorKeyName = Object.keys(errObj)[0];
            var errorKind = errObj[errorKeyName]['kind']

            if(errorKind=='required') {
                var message = this.humanize(errorKeyName) + ' is ' + errorKind
                return this.print(false, {
                    key: errorKeyName
                }, message)
            }
        }
        
        return this.print(false, null, err.message || 'Validation error.')
    }


    throwIfNotAcl(status) {
        if(!status) {
            throw(Response.print(false, null, 'Access Denied (ACL).'))
        }
    }

};
import Err from "../response/errorcode";

const ResponseTemplate = {
  general(data: any) {
    return data;
  },
  successMessage(message: any) {
    return {
      success: true,
      message,
    };
  },
  /**
   * Returns standard success response
   * @param {*} data
   * @param {String} message
   */
  success(message?: any, data?: any) {
    return {
      Status:200,
      message,
      data,
    };
  },
  fail(message?: any, code?: any) {
    return {
      Status: code || 400,
      message,
      
    };
  },
  error(message?: any, err?: any, code?: any) {
    return {
      success: false,
      message: message || "some error occurred",
      error:
        err || "error occurred on server, please try again after some time.",
      code: code || Err.InternalServerError,
    };
  },
  commonAuthUserDataError(data: any) {
    return ResponseTemplate.error(
      data.message || "Authentication error",
      data.error || "token verification failed, Please try again",
      data.code || Err.TokenValidationFailed
    );
  },

  BadRequestFromJoi(err: any) {
    return ResponseTemplate.error(
      err.message,
      err.error,
      err.code || Err.ValidationFailed
    );
  },
  routeNotFound(req: any) {
    return ResponseTemplate.error(
      "api not found",
      `${req.method} ${req.url}`,
      Err.RouteNotFound
    );
  },
  userNotFound(message?: any,code?: any) {
    return {
    Sataus: code || Err.UserNotFound,  
    message: message || "the user you're looking for doesn't exist or you dont have permissions to access it.",
    }
  },
  userAlreadyExist() {
    return ResponseTemplate.error(
      "user with email already exist",
      "User with same email already exist in System, please use another email",
      Err.EmailAlreadyExists
    );
  },
  userAlreadyInvited() {
    return ResponseTemplate.error(
      "user with email already invited",
      "User with same email already invited, Another link can be send after 24 hours window",
      Err.DuplicateInvite
    );
  },
  unauthorized(res:any) {
    return res.status(Err.UNAUTHORIZED).json({
      Status:401,
      message: "Unauthorized token",
    });
  },
  tokenEmpty(res:any) {
    return res.status(Err.UNAUTHORIZED).json({
      Status:401,
      message: "Token Missing. Please check token value are Empty",
    });
  },
  roleNotFound(message?: any,code?: any) {
    return {
    Sataus: code || Err.RoleNotFound,  
    message: message || "the Role you're looking for doesn't exist or you dont have permissions to access it.",
    }
  },

};

export default ResponseTemplate;

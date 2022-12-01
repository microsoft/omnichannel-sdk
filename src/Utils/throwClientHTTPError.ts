import { SDKError } from "../Common/Enums";

const throwClientHTTPTimeoutError = () : never => {
    const message = `${SDKError.ClientHTTPTimeoutErrorName}: ${SDKError.ClientHTTPTimeoutErrorMessage}`;
    throw new Error(message);
  }

  export default throwClientHTTPTimeoutError;
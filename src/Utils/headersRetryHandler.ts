import { AxiosError, AxiosRequestConfig } from "axios";


export default function overwriteHeaders(error:AxiosError, requestConfig:AxiosRequestConfig,headerOverwrites:string[] | undefined){
    const { config, response } = error;
    if (headerOverwrites && response?.headers) {
        for (const headerName of headerOverwrites) {
            const responseHeader = response?.headers[headerName.toLocaleLowerCase()];
            if (responseHeader && requestConfig.headers) {
                // eslint-disable-next-line security/detect-object-injection
                requestConfig.headers[headerName] = responseHeader;
            }
        }
    }
}
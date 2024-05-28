import { AxiosError, AxiosRequestConfig, type AxiosResponseHeaders } from 'axios'

import { FailResponse, SuccessResponse } from './interfaces'
import { httpHotsiteClient } from './httpHotsiteClient'

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'

interface SendRequestParams {
  data?: AxiosRequestConfig['data']
  endpoint: string,
  headers?: AxiosResponseHeaders
  method: HttpMethod
}

export const sendHotsiteRequest = async <D>({
  data,
  endpoint,
  headers,
  method
}: SendRequestParams): Promise<SuccessResponse<D> | FailResponse> => {
  try {
    const response = await httpHotsiteClient(`${endpoint}`, {
      data,
      headers,
      method,
    })

    return {
      data: response.data,
      error: false,
      headers:response.headers,
      message: response.data.message,
    }
  } catch (error) {
    if (error instanceof AxiosError) {
      return { error: true, message: error.response?.data.message }
    }

    return { error: true, message: 'Erro desconhecido' }
  }
}

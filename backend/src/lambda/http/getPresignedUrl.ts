import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { getPresignedUrl } from '../../businessLogic/todos'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { getUserId } from '../utils'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    const userId = getUserId(event)

    const signedUrl = await getPresignedUrl(userId, todoId);

    return {
      statusCode: 200,
      body: JSON.stringify({
        signedUrl
      })
    }
  }
)

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )

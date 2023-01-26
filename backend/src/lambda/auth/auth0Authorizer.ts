import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify, decode } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import Axios from 'axios'
import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'

const logger = createLogger('auth')


/*
const cert = `-----BEGIN CERTIFICATE-----
MIIDHTCCAgWgAwIBAgIJFGISFGjVWCA4MA0GCSqGSIb3DQEBCwUAMCwxKjAoBgNV
BAMTIWRldi1rb3p6ZHF2ZWozejJlcXNqLnVzLmF1dGgwLmNvbTAeFw0yMjExMTYx
MTM5MzNaFw0zNjA3MjUxMTM5MzNaMCwxKjAoBgNVBAMTIWRldi1rb3p6ZHF2ZWoz
ejJlcXNqLnVzLmF1dGgwLmNvbTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoC
ggEBANGlavfiCEiiKWYpK+vj5itX/LcBF4j1bSiD+HJK2eIpoRMFHEwp+MkkdjHK
mYgCRbJy7URr4Dg0g6NJlav4ou0O3AZLFTYnT9Vadm0da8Yfn6dBIxALVvrucsWg
oZ1eM/lhzom7AvKkc2ddT8Ljm/OXT6t2vHxPZ1biKbzY/xwstquv3an/yiz2KBMF
M2br5XBlF26IRDzQmxjuyLNsrcNbLJr/9W+2M+44kdjkYzZGZQMk8Ypna0XNvVnJ
O1KSsqxL+x/QqKSVBqH2JLxMneE1NwfKi5Z/YQ2Yuack5WOfP5rIHTg6/9sUNTI6
mKh/BjHSV79PDS9zWSkjsDARq/MCAwEAAaNCMEAwDwYDVR0TAQH/BAUwAwEB/zAd
BgNVHQ4EFgQUiOgwrkqd2SFakD2Ohpnl8qcEa/wwDgYDVR0PAQH/BAQDAgKEMA0G
CSqGSIb3DQEBCwUAA4IBAQCWBoUzGlyV0nItIwpxnUQCF5yVYcd6qNsQ/lSKkJRN
OFS/OhiwznlG3vsAjg0mXZw3mFYOodqhbTmVhw2C7tR4gy3qqwb8xP2ZhtETt8q+
IXA2ka8SGa5NHAJnV+3Teia72BsF+RGMScitL8v/hEUhfVAX9Ucj8GoYosNEiRan
hw9hwt1xlJYsDGYWF4fdtxrebt0n8QCkAYUsj81yk3gtDE/5WgUlRbzXmPF40k6l
NDH5LQRaWYrQpnnIOeBSvLcsxV4KhXRoxAZQgH8eNo3vjFPZSkEl+q0yH5Amjm1e
mvKY4fg0CMKU8UKY6QI+NUcUahbmClpxE4+NMaeYSzDr
-----END CERTIFICATE-----`
*/ 

//implement if there is time otherwise stick with hardcoded certificate
const jwksUrl = 'https://dev-vq8kaqph8eplmtc4.us.auth0.com/.well-known/jwks.json'

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)
  const jwt: Jwt = decode(token, { complete: true }) as Jwt
  console.log('Request: ' + jwksUrl);
  const res = await Axios.get(jwksUrl);
  const keys = res.data.keys.find(key => key.kid === jwt.header.kid);
  console.log("keys: "+keys);

  if(!keys){
    throw new Error('Error getting signing keys');
  }

  const certificate = '-----BEGIN CERTIFICATE-----\n'+keys.x5c[0]+'\n-----END CERTIFICATE-----';
  return verify(token,certificate,{algorithms: ['RS256']}) as JwtPayload
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}

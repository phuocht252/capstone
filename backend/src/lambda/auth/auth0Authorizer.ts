import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import { JwtPayload } from '../../auth/JwtPayload'

const logger = createLogger('auth')

// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
// const jwksUrl = 'https://dev-tlmy21ms5qfmsfwi.us.auth0.com/.well-known/jwks.json'
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Certificates -> Signing Certificate
const cert = `-----BEGIN CERTIFICATE-----
MIIDHTCCAgWgAwIBAgIJXLGzc9Pt0u6iMA0GCSqGSIb3DQEBCwUAMCwxKjAoBgNV
BAMTIWRldi1pbmlyOGhlbXpjNnQzbXZtLnVzLmF1dGgwLmNvbTAeFw0yMjEyMjEx
NjU4MDhaFw0zNjA4MjkxNjU4MDhaMCwxKjAoBgNVBAMTIWRldi1pbmlyOGhlbXpj
NnQzbXZtLnVzLmF1dGgwLmNvbTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoC
ggEBAPoUB2PAIZ5Cnlruuv1pg3++nhYFrV0PJP+zQoymjsHGlZ5hpREx8Ubwo/R/
zO0Tr+FwF2rHw6IZmbo2YbHjaveNSX70ogsAACgHnLDbYRCUdAwquMCrruggUway
k0pVtDKbafuUVMQ5Xr8o7q4ZYLsN2hdKyp1j4nhSDeWBAXNxa+I6tAGzASjuHP7n
2ES6AUkI5gX1JGO57dSXhm9Ww0zJ816IRLoOxbx1dFSaVbTMOCMDXk4XLgagUMUL
nI7cXbMLH0Dq1tzHUeuQ1VnXEeUljJKR3mB6MQ9SMU/w8IEy+ZpS4HjmROoMNTx1
m6hLtfs8dQdLxV/b7kbB6eoCWLkCAwEAAaNCMEAwDwYDVR0TAQH/BAUwAwEB/zAd
BgNVHQ4EFgQUom9+sQvguXfoqSxviU0TpFEk9ngwDgYDVR0PAQH/BAQDAgKEMA0G
CSqGSIb3DQEBCwUAA4IBAQCZXyrhWmwUOz5WrKyxwzo+otZMZRvq6jluuyYROPv7
Lvb9X73tGmCiBp3GcbPmVHxEOe81FxK4umLYfcKWKF+4/vz7y6T3nl7cuJZa6h9f
+kHBH2AdcGZkTNB/o8I3ojY4r75a7KVTE0oNZf8xi/nYXiL52aJmHX5/VjghTGDw
bP2y+7Zef8lm3CVcLYuHSsWa65fWLttgbW2MfqUe7t4CKCnyoaR21lREl5euQEZ/
m4R5yEQ3wwYlPo1hSodUm+6eAFtmYWT6AC19yvis+GMnWE5trFSsPsFsVjDPAZjb
OZ9HQ66aqlLuSLNOEV1QRbzHC6kc3lElLh0vLX7LY7cV
-----END CERTIFICATE-----`

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
  //const jwt: Jwt = decode(token, { complete: true }) as Jwt

  // TODO: Implement token verification
  // You should implement it similarly to how it was implemented for the exercise for the lesson 5
  // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/
  return verify(token, cert, { algorithms: ['RS256'] }) as JwtPayload
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}

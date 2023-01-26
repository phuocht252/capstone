import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { createLogger } from '../utils/logger'

const XAWS = AWSXRay.captureAWS(AWS)
const logger = createLogger('helpers-attachmentUtils')

// TODO: Implement the fileStogare logic
export class AttachmentUtils {
    constructor(
      private readonly s3 = new XAWS.S3({ signatureVersion: 'v4' }),
      private readonly bucketName = process.env.ATTACHMENT_S3_BUCKET,
      private readonly urlExpiration = process.env.SIGNED_URL_EXPIRATION
    ) {}
  
    async createAttachmentPresignedUrl(todoId: string): Promise<string> {
        logger.info('Get Presigned URL for attachement' + todoId)
        return this.s3.getSignedUrl('putObject', {
            Bucket: this.bucketName,
            Key: todoId,
            Expires: parseInt(this.urlExpiration)
        })
    }

    async getAttachmentUrl(todoId: string): Promise<string> {
        const attachmentUrl = `https://${this.bucketName}.s3.amazonaws.com/${todoId}`
        return attachmentUrl
    }

    async getAttachmentSignedUrl(attachmentId: string): Promise<string> {
        return this.s3.getSignedUrl('getObject', {
            Bucket: this.bucketName,
            Key: attachmentId,
            Expires: parseInt(this.urlExpiration)
        })
    }

    async deleteAttachment(todoId: string) {
        logger.info('Deleting Attachment with key: ' + todoId)
        this.s3.deleteObject({
            Bucket: this.bucketName,
            Key: todoId
        }).promise()
    }
}
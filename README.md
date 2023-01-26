# API Gateway Endpoints
- GET - https://piib9nah96.execute-api.us-east-1.amazonaws.com/dev/todos
- POST - https://piib9nah96.execute-api.us-east-1.amazonaws.com/dev/todos
- PATCH - https://piib9nah96.execute-api.us-east-1.amazonaws.com/dev/todos/{todoId}
- DELETE - https://piib9nah96.execute-api.us-east-1.amazonaws.com/dev/todos/{todoId}
- POST - https://piib9nah96.execute-api.us-east-1.amazonaws.com/dev/todos/{todoId}/attachment
  
# Deploy
npm update --save
serverless

# Websocket
wss://4wgvvaewqb.execute-api.us-east-1.amazonaws.com/dev

# New Features
1. Send Notification to client via Websocket when new S3 object is created
- Please connect to websocket: wscat -c wss://4wgvvaewqb.execute-api.us-east-1.amazonaws.com/dev
- Try to update new image file
- See evidence in screenshot folder

2. Download image into local disk when clicking on image
- Get presignedURL: POST - https://piib9nah96.execute-api.us-east-1.amazonaws.com/dev/todos/{todoId}/attachment
- Using file-saver npm to save file into local disk

3. Attchment file that stored in S3 will be deleted when TODO item is deleted


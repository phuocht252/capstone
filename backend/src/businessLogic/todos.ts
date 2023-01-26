import { TodosAccess } from '../dataLayer/todosAcess'
import { AttachmentUtils } from '../helpers/attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate} from '../models/TodoUpdate'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'

// TODO: Implement businessLogic
const logger = createLogger('businessLogic-todos')

const todosAccess = new TodosAccess()
const attachmentUtils = new AttachmentUtils()

export async function createTodo(userId: string, newTodo: CreateTodoRequest): Promise<TodoItem> {
    logger.info('Creating todo item for userId', {
        'userId': userId,
        'newTodo': newTodo
    })
    const createdAt = new Date().toISOString()
    const todoId = uuid.v4()
    return await todosAccess.createTodo({
        userId,
        todoId,
        createdAt,
        done: false,
        ... newTodo,
        attachmentUrl: ''
    })
}

export async function getTodosForUser(userId: string): Promise<TodoItem[]> {
    logger.info('Get todo items by userId: ' + userId)
    return todosAccess.getTodosForUser(userId)
}

export async function getPresignedUrl(userId: string, todoId: string): Promise<string> {
    const validTodoId = todosAccess.todoExists(userId, todoId)
    if (!validTodoId) {
        throw new Error('Data not found with todoId: ' + todoId + ' and userId: ' + userId)
    }

    return attachmentUtils.getAttachmentSignedUrl(todoId)
}

export async function updateTodo(userId: string, todoId: string, updatedTodo: UpdateTodoRequest): Promise<TodoUpdate> {
    const validTodoId = todosAccess.todoExists(userId, todoId)
    if (!validTodoId) {
        throw new Error('Data not found with todoId: ' + todoId + ' and userId: ' + userId)
    }

    let todoUpdate: TodoUpdate = {
        ... updatedTodo
    }
    logger.info('Updating todo item: ', {
        'userId': userId,
        'todoId': todoId,
        'updatedTodo': updatedTodo
    })
    return todosAccess.updateTodo(userId, todoId, todoUpdate)
}

export async function createAttachmentPresignedUrl(userId: string, todoId: string): Promise<string> {
    logger.info('Creating Attachment Presigned URL')
    const presignedUrl = await attachmentUtils.createAttachmentPresignedUrl(todoId)
    const attachmentUrl = await attachmentUtils.getAttachmentUrl(todoId)
    await todosAccess.updateAttachmentUrl(userId, todoId, attachmentUrl)

    return presignedUrl
}

export async function deleteTodo(userId: string, todoId: string) {
    const validTodoId = todosAccess.todoExists(userId, todoId)
    if (!validTodoId) {
        throw new Error('Data not found with todoId: ' + todoId + ' and userId: ' + userId)
    }
    
    logger.info('Deleting todo item: ', {
        'userId': userId,
        'todoId': todoId
    })

    await attachmentUtils.deleteAttachment(todoId)

    return todosAccess.deleteTodo(userId, todoId)

}
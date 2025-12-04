import { beforeEach, describe, expect, it } from 'vitest'
import { NotificationType, useNotification } from '../useNotification'

describe('useNotification', () => {
  let notification: ReturnType<typeof useNotification>

  beforeEach(() => {
    notification = useNotification()
    notification.clearAll()
  })

  it('should create a notification with default type', () => {
    const id = notification.notify({ message: 'Test message' })
    expect(id).toBeTypeOf('number')
    expect(notification.notifications.value).toHaveLength(1)
    expect(notification.notifications.value[0].type).toBe(NotificationType.INFO)
  })

  it('should create a success notification', () => {
    const id = notification.success('Success message')
    expect(id).toBeTypeOf('number')
    expect(notification.notifications.value[0].type).toBe(NotificationType.SUCCESS)
    expect(notification.notifications.value[0].message).toBe('Success message')
  })

  it('should create an error notification', () => {
    const id = notification.error('Error message')
    expect(id).toBeTypeOf('number')
    expect(notification.notifications.value[0].type).toBe(NotificationType.ERROR)
    expect(notification.notifications.value[0].message).toBe('Error message')
  })

  it('should create a warning notification', () => {
    const id = notification.warning('Warning message')
    expect(id).toBeTypeOf('number')
    expect(notification.notifications.value[0].type).toBe(NotificationType.WARNING)
  })

  it('should create an info notification', () => {
    const id = notification.info('Info message')
    expect(id).toBeTypeOf('number')
    expect(notification.notifications.value[0].type).toBe(NotificationType.INFO)
  })

  it('should dismiss a notification by id', () => {
    const id = notification.success('Test message')
    expect(notification.notifications.value).toHaveLength(1)

    const dismissed = notification.dismiss(id!)
    expect(dismissed).toBe(true)
    expect(notification.notifications.value).toHaveLength(0)
  })

  it('should clear all notifications', () => {
    notification.success('Message 1')
    notification.error('Message 2')
    notification.warning('Message 3')

    expect(notification.notifications.value).toHaveLength(3)
    notification.clearAll()
    expect(notification.notifications.value).toHaveLength(0)
  })

  it('should return null for invalid message', () => {
    const id = notification.notify({ message: '' })
    expect(id).toBeNull()
    expect(notification.notifications.value).toHaveLength(0)
  })

  it('should auto-dismiss notification after timeout', async () => {
    notification.success('Auto-dismiss message', 100)
    expect(notification.notifications.value).toHaveLength(1)

    await new Promise(resolve => setTimeout(resolve, 150))
    expect(notification.notifications.value).toHaveLength(0)
  })
})

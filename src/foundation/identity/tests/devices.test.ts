import { describe, it, expect, beforeEach } from 'vitest'
import { generateKeypair, type Keypair } from '../keys'
import {
    registerDevice,
    revokeDevice,
    isDeviceAuthorized,
    hasCapability,
    addCapability,
    removeCapability,
    updateDeviceLastSeen,
    DeviceRegistry,
    type Device
} from '../devices'

describe('Identity - Devices', () => {
    let rootKey: Keypair

    beforeEach(async () => {
        rootKey = await generateKeypair()
    })

    describe('registerDevice', () => {
        it('should register a new device', async () => {
            const result = await registerDevice(rootKey, 'Laptop')

            expect(result.deviceId).toBeTruthy()
            expect(result.deviceDID).toMatch(/^did:key:/)
            expect(result.deviceKey.did).toBe(result.deviceDID)
            expect(result.device.deviceName).toBe('Laptop')
            expect(result.device.authorizedAt).toBeTruthy()
            expect(result.device.lastSeen).toBe(result.device.authorizedAt)
        })

        it('should create device with default capabilities', async () => {
            const result = await registerDevice(rootKey, 'Phone')

            expect(result.device.capabilities).toContain('tree/mutate')
            expect(result.device.capabilities).toContain('vc/issue')
        })

        it('should create device with custom capabilities', async () => {
            const result = await registerDevice(
                rootKey,
                'Server',
                ['admin/all', 'data/sync']
            )

            expect(result.device.capabilities).toEqual(['admin/all', 'data/sync'])
        })

        it('should create unique device IDs', async () => {
            const device1 = await registerDevice(rootKey, 'Device 1')
            const device2 = await registerDevice(rootKey, 'Device 2')

            expect(device1.deviceId).not.toBe(device2.deviceId)
            expect(device1.deviceDID).not.toBe(device2.deviceDID)
        })
    })

    describe('Device authorization', () => {
        let device: Device

        beforeEach(async () => {
            const result = await registerDevice(rootKey, 'Test Device')
            device = result.device
        })

        it('should be authorized by default', () => {
            expect(isDeviceAuthorized(device)).toBe(true)
            expect(device.revokedAt).toBeUndefined()
        })

        it('should revoke device', () => {
            const revoked = revokeDevice(device)

            expect(revoked.revokedAt).toBeTruthy()
            expect(isDeviceAuthorized(revoked)).toBe(false)
        })

        it('should not mutate original device when revoking', () => {
            const revoked = revokeDevice(device)

            expect(isDeviceAuthorized(device)).toBe(true)
            expect(isDeviceAuthorized(revoked)).toBe(false)
        })
    })

    describe('Device capabilities', () => {
        let device: Device

        beforeEach(async () => {
            const result = await registerDevice(rootKey, 'Test Device', ['cap1', 'cap2'])
            device = result.device
        })

        it('should check if device has capability', () => {
            expect(hasCapability(device, 'cap1')).toBe(true)
            expect(hasCapability(device, 'cap2')).toBe(true)
            expect(hasCapability(device, 'cap3')).toBe(false)
        })

        it('should add capability', () => {
            const updated = addCapability(device, 'cap3')

            expect(hasCapability(updated, 'cap3')).toBe(true)
            expect(updated.capabilities).toHaveLength(3)
        })

        it('should not add duplicate capability', () => {
            const updated = addCapability(device, 'cap1')

            expect(updated.capabilities).toHaveLength(2)
            expect(updated.capabilities.filter(c => c === 'cap1')).toHaveLength(1)
        })

        it('should remove capability', () => {
            const updated = removeCapability(device, 'cap1')

            expect(hasCapability(updated, 'cap1')).toBe(false)
            expect(updated.capabilities).toEqual(['cap2'])
        })
    })

    describe('updateDeviceLastSeen', () => {
        it('should update last seen timestamp', async () => {
            const result = await registerDevice(rootKey, 'Test Device')
            const originalLastSeen = result.device.lastSeen

            // Wait a bit
            await new Promise(resolve => setTimeout(resolve, 10))

            const updated = updateDeviceLastSeen(result.device)
            expect(updated.lastSeen).toBeGreaterThan(originalLastSeen)
        })
    })

    describe('DeviceRegistry', () => {
        let registry: DeviceRegistry
        let device1: Device
        let device2: Device

        beforeEach(async () => {
            registry = new DeviceRegistry()

            const result1 = await registerDevice(rootKey, 'Device 1')
            const result2 = await registerDevice(rootKey, 'Device 2')

            device1 = result1.device
            device2 = result2.device

            registry.addDevice(device1)
            registry.addDevice(device2)
        })

        it('should add and retrieve device by ID', () => {
            const retrieved = registry.getDevice(device1.deviceId)
            expect(retrieved).toEqual(device1)
        })

        it('should retrieve device by DID', () => {
            const retrieved = registry.getDeviceByDID(device1.deviceDID)
            expect(retrieved).toEqual(device1)
        })

        it('should list all devices', () => {
            const devices = registry.listDevices()
            expect(devices).toHaveLength(2)
            expect(devices).toContainEqual(device1)
            expect(devices).toContainEqual(device2)
        })

        it('should list only authorized devices', () => {
            const revoked = revokeDevice(device1)
            registry.updateDevice(device1.deviceId, revoked)

            const authorized = registry.listAuthorizedDevices()
            expect(authorized).toHaveLength(1)
            expect(authorized[0]).toEqual(device2)
        })

        it('should check if device DID is authorized', () => {
            expect(registry.isAuthorized(device1.deviceDID)).toBe(true)

            const revoked = revokeDevice(device1)
            registry.updateDevice(device1.deviceId, revoked)

            expect(registry.isAuthorized(device1.deviceDID)).toBe(false)
        })

        it('should update device in registry', () => {
            const updated = updateDeviceLastSeen(device1)
            registry.updateDevice(device1.deviceId, updated)

            const retrieved = registry.getDevice(device1.deviceId)
            expect(retrieved?.lastSeen).toBe(updated.lastSeen)
        })

        it('should remove device from registry', () => {
            registry.removeDevice(device1.deviceId)

            expect(registry.getDevice(device1.deviceId)).toBeNull()
            expect(registry.listDevices()).toHaveLength(1)
        })

        it('should return null for non-existent device', () => {
            expect(registry.getDevice('nonexistent')).toBeNull()
            expect(registry.getDeviceByDID('did:key:nonexistent')).toBeNull()
        })
    })
})

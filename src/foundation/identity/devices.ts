import { z } from 'zod'
import { generateKeypair, type Keypair } from './keys'
import * as Signer from '@ucanto/principal/ed25519'

// ═══════════════════════════════════════════════════════════════════════
// DEVICE SCHEMA
// ═══════════════════════════════════════════════════════════════════════

export const DeviceSchema = z.object({
    deviceId: z.string(),
    deviceDID: z.string(),
    deviceName: z.string(),
    authorizedAt: z.number(),
    lastSeen: z.number(),
    capabilities: z.array(z.string()),
    revokedAt: z.number().optional()
})

export type Device = z.infer<typeof DeviceSchema>

// ═══════════════════════════════════════════════════════════════════════
// DEVICE MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════

/**
 * Register a new device for a root identity
 */
export async function registerDevice(
    rootKey: Keypair,
    deviceName: string,
    capabilities: string[] = ['tree/mutate', 'vc/issue']
): Promise<{
    deviceId: string
    deviceKey: Keypair
    deviceDID: string
    device: Device
}> {
    // Generate new keypair for device
    const deviceKey = await generateKeypair()

    // Create device record
    const device: Device = {
        deviceId: crypto.randomUUID(),
        deviceDID: deviceKey.did,
        deviceName,
        authorizedAt: Date.now(),
        lastSeen: Date.now(),
        capabilities
    }

    return {
        deviceId: device.deviceId,
        deviceKey,
        deviceDID: device.deviceDID,
        device
    }
}

/**
 * Update device last seen timestamp
 */
export function updateDeviceLastSeen(device: Device): Device {
    return {
        ...device,
        lastSeen: Date.now()
    }
}

/**
 * Revoke a device
 */
export function revokeDevice(device: Device): Device {
    return {
        ...device,
        revokedAt: Date.now()
    }
}

/**
 * Check if device is currently authorized (not revoked)
 */
export function isDeviceAuthorized(device: Device): boolean {
    return device.revokedAt === undefined
}

/**
 * Check if device has a specific capability
 */
export function hasCapability(device: Device, capability: string): boolean {
    return device.capabilities.includes(capability)
}

/**
 * Add capability to device
 */
export function addCapability(device: Device, capability: string): Device {
    if (device.capabilities.includes(capability)) {
        return device
    }

    return {
        ...device,
        capabilities: [...device.capabilities, capability]
    }
}

/**
 * Remove capability from device
 */
export function removeCapability(device: Device, capability: string): Device {
    return {
        ...device,
        capabilities: device.capabilities.filter(c => c !== capability)
    }
}

// ═══════════════════════════════════════════════════════════════════════
// DEVICE REGISTRY (In-Memory for now, will integrate with Fireproof later)
// ═══════════════════════════════════════════════════════════════════════

/**
 * Simple in-memory device registry
 * This will be replaced with Fireproof storage in Phase 2
 */
export class DeviceRegistry {
    private devices: Map<string, Device> = new Map()

    /**
     * Add device to registry
     */
    addDevice(device: Device): void {
        this.devices.set(device.deviceId, device)
    }

    /**
     * Get device by ID
     */
    getDevice(deviceId: string): Device | null {
        return this.devices.get(deviceId) || null
    }

    /**
     * Get device by DID
     */
    getDeviceByDID(deviceDID: string): Device | null {
        for (const device of this.devices.values()) {
            if (device.deviceDID === deviceDID) {
                return device
            }
        }
        return null
    }

    /**
     * List all devices
     */
    listDevices(): Device[] {
        return Array.from(this.devices.values())
    }

    /**
     * List authorized devices only
     */
    listAuthorizedDevices(): Device[] {
        return this.listDevices().filter(isDeviceAuthorized)
    }

    /**
     * Update device in registry
     */
    updateDevice(deviceId: string, device: Device): void {
        this.devices.set(deviceId, device)
    }

    /**
     * Remove device from registry
     */
    removeDevice(deviceId: string): void {
        this.devices.delete(deviceId)
    }

    /**
     * Check if device DID is authorized
     */
    isAuthorized(deviceDID: string): boolean {
        const device = this.getDeviceByDID(deviceDID)
        return device !== null && isDeviceAuthorized(device)
    }
}

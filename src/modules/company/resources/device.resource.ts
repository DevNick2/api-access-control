import { Device } from "src/entities/device.entity"

interface DeviceResource {
  name: string
  ip_address: string
  is_active: boolean
}

export class DeviceResources implements DeviceResource {
  name: string
  ip_address: string
  is_active: boolean

  constructor(payload: Partial<Device>) {
    this.name = payload.name
    this.ip_address = payload.ip_address
    this.is_active = payload.is_active

    // XXX TODO :: Adicionar a company
  }

  static list(devices: Device[]): DeviceResources[] {
    return devices.map(d => new DeviceResources(d))
  }
}

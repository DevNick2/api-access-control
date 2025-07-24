import { Device } from "src/entities/device.entity"
import { Person } from "src/entities/person.entity"

interface PersonResource {
  name: string
  email: string
  photo_url: string
  is_active: boolean
}

export class PersonResources implements PersonResource {
  name: string
  email: string
  photo_url: string
  is_active: boolean

  constructor(payload: Partial<Person>) {
    this.name = payload.name
    this.email = payload.email || ''
    this.is_active = payload.is_active
    this.photo_url = payload.photo_url

    // XXX TODO :: Adicionar a company
    // XXX TODO :: Adicionar o user
  }

  static list(person: Person[]): PersonResources[] {
    return person.map(d => new PersonResources(d))
  }
}

import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'
import alumnoService from './alumnoService'

vi.mock('axios')

describe('alumnoService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('getAll debe retornar la lista de alumnos', async () => {
    const mockData = [{ id: 1, nombre: 'Juan' }]
    axios.get.mockResolvedValueOnce({ data: mockData })

    const result = await alumnoService.getAll()

    expect(axios.get).toHaveBeenCalledWith('/api/alumnos')
    expect(result).toEqual(mockData)
  })

  it('getById debe retornar un alumno específico', async () => {
    const mockData = { id: 1, nombre: 'Juan' }
    axios.get.mockResolvedValueOnce({ data: mockData })

    const result = await alumnoService.getById(1)

    expect(axios.get).toHaveBeenCalledWith('/api/alumnos/1')
    expect(result).toEqual(mockData)
  })

  it('getByRut debe retornar un alumno por su RUT', async () => {
    const mockData = { id: 1, rut: '12345678-9', nombre: 'Juan' }
    axios.get.mockResolvedValueOnce({ data: mockData })

    const result = await alumnoService.getByRut('12345678-9')

    expect(axios.get).toHaveBeenCalledWith('/api/alumnos/rut/12345678-9')
    expect(result).toEqual(mockData)
  })

  it('create debe enviar un POST y retornar el alumno creado', async () => {
    const nuevoAlumno = { rut: '12345678-9', nombre: 'Juan', apellido: 'Perez' }
    const mockResponse = { id: 1, ...nuevoAlumno }
    axios.post.mockResolvedValueOnce({ data: mockResponse })

    const result = await alumnoService.create(nuevoAlumno)

    expect(axios.post).toHaveBeenCalledWith('/api/alumnos', nuevoAlumno)
    expect(result).toEqual(mockResponse)
  })

  it('update debe enviar un PUT y retornar el alumno modificado', async () => {
    const alumnoModificado = { rut: '12345678-9', nombre: 'Juan Carlos', apellido: 'Perez' }
    const mockResponse = { id: 1, ...alumnoModificado }
    axios.put.mockResolvedValueOnce({ data: mockResponse })

    const result = await alumnoService.update(1, alumnoModificado)

    expect(axios.put).toHaveBeenCalledWith('/api/alumnos/1', alumnoModificado)
    expect(result).toEqual(mockResponse)
  })

  it('delete debe enviar un DELETE', async () => {
    axios.delete.mockResolvedValueOnce({})

    await alumnoService.delete(1)

    expect(axios.delete).toHaveBeenCalledWith('/api/alumnos/1')
  })
})

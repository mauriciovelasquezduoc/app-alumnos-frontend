import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import AlumnoForm from './AlumnoForm'
import alumnoService from '../services/alumnoService'

vi.mock('../services/alumnoService')

const mockNavigate = vi.fn()
let mockIdParam = undefined

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ id: mockIdParam }),
  }
})

describe('AlumnoForm', () => {
  const mockAlumno = { id: 1, rut: '123-4', nombre: 'Juan', apellido: 'Perez' }

  beforeEach(() => {
    vi.clearAllMocks()
    mockIdParam = undefined
    vi.spyOn(window, 'alert').mockImplementation(() => {})
  })

  it('debe renderizar en modo "Crear" cuando no hay ID', () => {
    render(
      <MemoryRouter>
        <AlumnoForm />
      </MemoryRouter>
    )

    expect(screen.getByText('Nuevo Alumno')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('12345678-9')).toHaveValue('')
    expect(screen.getByPlaceholderText('Juan')).toHaveValue('')
    expect(screen.getByPlaceholderText('Pérez')).toHaveValue('')
  })

  it('debe cargar los datos del alumno y renderizar en modo "Editar" cuando hay ID', async () => {
    mockIdParam = '1'
    alumnoService.getById.mockResolvedValueOnce(mockAlumno)

    render(
      <MemoryRouter>
        <AlumnoForm />
      </MemoryRouter>
    )

    expect(screen.getByText('Editar Alumno')).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getByPlaceholderText('12345678-9')).toHaveValue('123-4')
      expect(screen.getByPlaceholderText('Juan')).toHaveValue('Juan')
      expect(screen.getByPlaceholderText('Pérez')).toHaveValue('Perez')
    })
  })

  it('debe manejar errores de fetch al cargar el alumno en edición', async () => {
    mockIdParam = '1'
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    alumnoService.getById.mockRejectedValueOnce(new Error('Fetch failed'))

    render(
      <MemoryRouter>
        <AlumnoForm />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled()
    })
  })

  it('debe mostrar errores de validación si los campos requeridos están vacíos', () => {
    render(
      <MemoryRouter>
        <AlumnoForm />
      </MemoryRouter>
    )

    const submitButton = screen.getByText('Crear Alumno')
    fireEvent.click(submitButton)

    expect(screen.getByText('El RUT es obligatorio')).toBeInTheDocument()
    expect(screen.getByText('El nombre es obligatorio')).toBeInTheDocument()
    expect(screen.getByText('El apellido es obligatorio')).toBeInTheDocument()
  })

  it('debe actualizar los valores de los inputs y limpiar los errores al escribir', () => {
    render(
      <MemoryRouter>
        <AlumnoForm />
      </MemoryRouter>
    )

    // Gatillar errores
    fireEvent.click(screen.getByText('Crear Alumno'))
    expect(screen.getByText('El RUT es obligatorio')).toBeInTheDocument()

    // Escribir en RUT
    const rutInput = screen.getByPlaceholderText('12345678-9')
    fireEvent.change(rutInput, { target: { name: 'rut', value: '1234-5' } })

    expect(rutInput).toHaveValue('1234-5')
    expect(screen.queryByText('El RUT es obligatorio')).not.toBeInTheDocument()
  })

  it('debe cancelar y volver a la lista', () => {
    render(
      <MemoryRouter>
        <AlumnoForm />
      </MemoryRouter>
    )

    const cancelButton = screen.getByText('Cancelar')
    fireEvent.click(cancelButton)

    expect(mockNavigate).toHaveBeenCalledWith('/')
  })

  it('debe enviar los datos y crear el alumno en modo "Crear"', async () => {
    alumnoService.create.mockResolvedValueOnce({ id: 2, rut: '123-4', nombre: 'Juan', apellido: 'Perez' })

    render(
      <MemoryRouter>
        <AlumnoForm />
      </MemoryRouter>
    )

    fireEvent.change(screen.getByPlaceholderText('12345678-9'), { target: { name: 'rut', value: '123-4' } })
    fireEvent.change(screen.getByPlaceholderText('Juan'), { target: { name: 'nombre', value: 'Juan' } })
    fireEvent.change(screen.getByPlaceholderText('Pérez'), { target: { name: 'apellido', value: 'Perez' } })

    fireEvent.click(screen.getByText('Crear Alumno'))

    await waitFor(() => {
      expect(alumnoService.create).toHaveBeenCalledWith({
        rut: '123-4',
        nombre: 'Juan',
        apellido: 'Perez'
      })
      expect(mockNavigate).toHaveBeenCalledWith('/')
    })
  })

  it('debe enviar los datos y actualizar el alumno en modo "Editar"', async () => {
    mockIdParam = '1'
    alumnoService.getById.mockResolvedValueOnce(mockAlumno)
    alumnoService.update.mockResolvedValueOnce({ id: 1, rut: '123-4', nombre: 'Juan Modificado', apellido: 'Perez' })

    render(
      <MemoryRouter>
        <AlumnoForm />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Juan')).toHaveValue('Juan')
    })

    fireEvent.change(screen.getByPlaceholderText('Juan'), { target: { name: 'nombre', value: 'Juan Modificado' } })
    fireEvent.click(screen.getByText('Actualizar Alumno'))

    await waitFor(() => {
      expect(alumnoService.update).toHaveBeenCalledWith('1', {
        rut: '123-4',
        nombre: 'Juan Modificado',
        apellido: 'Perez'
      })
      expect(mockNavigate).toHaveBeenCalledWith('/')
    })
  })

  it('debe mostrar alerta de error si falla la creación/guardado', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    alumnoService.create.mockRejectedValueOnce(new Error('Save failed'))

    render(
      <MemoryRouter>
        <AlumnoForm />
      </MemoryRouter>
    )

    fireEvent.change(screen.getByPlaceholderText('12345678-9'), { target: { name: 'rut', value: '123-4' } })
    fireEvent.change(screen.getByPlaceholderText('Juan'), { target: { name: 'nombre', value: 'Juan' } })
    fireEvent.change(screen.getByPlaceholderText('Pérez'), { target: { name: 'apellido', value: 'Perez' } })

    fireEvent.click(screen.getByText('Crear Alumno'))

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Error al guardar el alumno. Por favor, intente de nuevo.')
      expect(consoleSpy).toHaveBeenCalled()
    })
  })

  it('debe cargar los datos del alumno con fallbacks vacíos cuando faltan propiedades en edición', async () => {
    mockIdParam = '1'
    alumnoService.getById.mockResolvedValueOnce({ id: 1 })

    render(
      <MemoryRouter>
        <AlumnoForm />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByPlaceholderText('12345678-9')).toHaveValue('')
      expect(screen.getByPlaceholderText('Juan')).toHaveValue('')
      expect(screen.getByPlaceholderText('Pérez')).toHaveValue('')
    })
  })
})

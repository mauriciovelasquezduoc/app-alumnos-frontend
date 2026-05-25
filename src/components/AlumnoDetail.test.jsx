import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import AlumnoDetail from './AlumnoDetail'
import alumnoService from '../services/alumnoService'

vi.mock('../services/alumnoService')

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ id: '1' }),
  }
})

describe('AlumnoDetail', () => {
  const mockAlumno = { id: 1, rut: '123-4', nombre: 'Juan', apellido: 'Perez' }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(window, 'confirm').mockImplementation(() => true)
  })

  it('debe renderizar el spinner de carga inicialmente', () => {
    alumnoService.getById.mockReturnValue(new Promise(() => {}))
    render(
      <MemoryRouter>
        <AlumnoDetail />
      </MemoryRouter>
    )
    expect(document.querySelector('.animate-spin')).toBeInTheDocument()
  })

  it('debe renderizar los detalles del alumno al cargarlo con éxito', async () => {
    alumnoService.getById.mockResolvedValueOnce(mockAlumno)

    render(
      <MemoryRouter>
        <AlumnoDetail />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Detalles del Alumno')).toBeInTheDocument()
      expect(screen.getByText('Juan')).toBeInTheDocument()
      expect(screen.getByText('Perez')).toBeInTheDocument()
      expect(screen.getByText('123-4')).toBeInTheDocument()
    })
  })

  it('debe renderizar mensaje de error si la carga falla', async () => {
    alumnoService.getById.mockRejectedValueOnce(new Error('Fetch failed'))

    render(
      <MemoryRouter>
        <AlumnoDetail />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Error al cargar los detalles del alumno.')).toBeInTheDocument()
    })

    const backButton = screen.getByText('Volver a la lista')
    fireEvent.click(backButton)
    expect(mockNavigate).toHaveBeenCalledWith('/')
  })

  it('debe renderizar mensaje de no encontrado si el alumno no existe', async () => {
    alumnoService.getById.mockResolvedValueOnce(null)

    render(
      <MemoryRouter>
        <AlumnoDetail />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Alumno no encontrado')).toBeInTheDocument()
    })

    const backButton = screen.getByText('Volver a la lista')
    fireEvent.click(backButton)
    expect(mockNavigate).toHaveBeenCalledWith('/')
  })

  it('debe volver a la lista si se hace click en Volver', async () => {
    alumnoService.getById.mockResolvedValueOnce(mockAlumno)

    render(
      <MemoryRouter>
        <AlumnoDetail />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Volver a la lista')).toBeInTheDocument()
    })

    const backButton = screen.getByText('Volver a la lista')
    fireEvent.click(backButton)
    expect(mockNavigate).toHaveBeenCalledWith('/')
  })

  it('debe ir a editar si se presiona Editar', async () => {
    alumnoService.getById.mockResolvedValueOnce(mockAlumno)

    render(
      <MemoryRouter>
        <AlumnoDetail />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Editar')).toBeInTheDocument()
    })

    const editButton = screen.getByText('Editar')
    fireEvent.click(editButton)
    expect(mockNavigate).toHaveBeenCalledWith('/alumnos/1/editar')
  })

  it('debe eliminar y volver a la lista si se confirma', async () => {
    alumnoService.getById.mockResolvedValueOnce(mockAlumno)
    alumnoService.delete.mockResolvedValueOnce({})

    render(
      <MemoryRouter>
        <AlumnoDetail />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Eliminar')).toBeInTheDocument()
    })

    const deleteButton = screen.getByText('Eliminar')
    fireEvent.click(deleteButton)

    expect(window.confirm).toHaveBeenCalled()
    expect(alumnoService.delete).toHaveBeenCalledWith('1')
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/')
    })
  })

  it('debe mostrar error si falla la eliminación', async () => {
    alumnoService.getById.mockResolvedValueOnce(mockAlumno)
    alumnoService.delete.mockRejectedValueOnce(new Error('Delete failed'))

    render(
      <MemoryRouter>
        <AlumnoDetail />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Eliminar')).toBeInTheDocument()
    })

    const deleteButton = screen.getByText('Eliminar')
    fireEvent.click(deleteButton)

    await waitFor(() => {
      expect(screen.getByText('Error al eliminar el alumno.')).toBeInTheDocument()
    })
  })

  it('no debe hacer nada si se cancela la confirmación de eliminación', async () => {
    window.confirm.mockImplementationOnce(() => false)
    alumnoService.getById.mockResolvedValueOnce(mockAlumno)

    render(
      <MemoryRouter>
        <AlumnoDetail />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Eliminar')).toBeInTheDocument()
    })

    const deleteButton = screen.getByText('Eliminar')
    fireEvent.click(deleteButton)

    expect(window.confirm).toHaveBeenCalled()
    expect(alumnoService.delete).not.toHaveBeenCalled()
    expect(mockNavigate).not.toHaveBeenCalledWith('/')
  })
})

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import AlumnoList from './AlumnoList'
import alumnoService from '../services/alumnoService'

vi.mock('../services/alumnoService')

describe('AlumnoList', () => {
  const mockAlumnos = [
    { id: 1, rut: '123-4', nombre: 'Juan', apellido: 'Perez' },
    { id: 2, rut: '567-8', nombre: 'Maria', apellido: 'Gomez' }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(window, 'confirm').mockImplementation(() => true)
  })

  it('debe renderizar el spinner de carga inicialmente', () => {
    alumnoService.getAll.mockReturnValue(new Promise(() => {}))
    render(
      <MemoryRouter>
        <AlumnoList />
      </MemoryRouter>
    )
    expect(document.querySelector('.animate-spin')).toBeInTheDocument()
  })

  it('debe renderizar la lista de alumnos al cargar los datos', async () => {
    alumnoService.getAll.mockResolvedValueOnce(mockAlumnos)

    render(
      <MemoryRouter>
        <AlumnoList />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Juan')).toBeInTheDocument()
      expect(screen.getByText('Maria')).toBeInTheDocument()
    })
  })

  it('debe renderizar un mensaje de error si la carga falla', async () => {
    alumnoService.getAll.mockRejectedValueOnce(new Error('Fetch failed'))

    render(
      <MemoryRouter>
        <AlumnoList />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Error al cargar los alumnos. Por favor, intente de nuevo.')).toBeInTheDocument()
    })
  })

  it('debe filtrar los alumnos según el término de búsqueda', async () => {
    alumnoService.getAll.mockResolvedValueOnce(mockAlumnos)

    render(
      <MemoryRouter>
        <AlumnoList />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Juan')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText('Buscar por nombre, apellido o RUT...')
    fireEvent.change(searchInput, { target: { value: 'Maria' } })

    expect(screen.queryByText('Juan')).not.toBeInTheDocument()
    expect(screen.getByText('Maria')).toBeInTheDocument()

    // Búsqueda sin coincidencias
    fireEvent.change(searchInput, { target: { value: 'Inexistente' } })
    expect(screen.getByText('No se encontraron alumnos')).toBeInTheDocument()
  })

  it('debe eliminar un alumno cuando se hace click en eliminar y se confirma', async () => {
    alumnoService.getAll.mockResolvedValueOnce(mockAlumnos)
    alumnoService.delete.mockResolvedValueOnce({})

    render(
      <MemoryRouter>
        <AlumnoList />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Juan')).toBeInTheDocument()
    })

    const deleteButtons = screen.getAllByTitle('Eliminar')
    fireEvent.click(deleteButtons[0])

    expect(window.confirm).toHaveBeenCalledWith('¿Está seguro de eliminar este alumno?')
    expect(alumnoService.delete).toHaveBeenCalledWith(1)

    await waitFor(() => {
      expect(screen.queryByText('Juan')).not.toBeInTheDocument()
    })
  })

  it('debe mostrar error si falla la eliminación', async () => {
    alumnoService.getAll.mockResolvedValueOnce(mockAlumnos)
    alumnoService.delete.mockRejectedValueOnce(new Error('Delete failed'))

    render(
      <MemoryRouter>
        <AlumnoList />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Juan')).toBeInTheDocument()
    })

    const deleteButtons = screen.getAllByTitle('Eliminar')
    fireEvent.click(deleteButtons[0])

    await waitFor(() => {
      expect(screen.getByText('Error al eliminar el alumno.')).toBeInTheDocument()
    })
  })

  it('no debe eliminar si el usuario cancela la confirmación', async () => {
    window.confirm.mockImplementationOnce(() => false)
    alumnoService.getAll.mockResolvedValueOnce(mockAlumnos)

    render(
      <MemoryRouter>
        <AlumnoList />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Juan')).toBeInTheDocument()
    })

    const deleteButtons = screen.getAllByTitle('Eliminar')
    fireEvent.click(deleteButtons[0])

    expect(window.confirm).toHaveBeenCalled()
    expect(alumnoService.delete).not.toHaveBeenCalled()
    expect(screen.getByText('Juan')).toBeInTheDocument()
  })
})

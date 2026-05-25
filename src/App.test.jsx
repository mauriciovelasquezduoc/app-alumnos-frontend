import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import App from './App'
import alumnoService from './services/alumnoService'

vi.mock('./services/alumnoService')

describe('App Component', () => {
  it('debe renderizar la aplicación completa con su barra de navegación', async () => {
    alumnoService.getAll.mockResolvedValueOnce([])
    render(<App />)

    expect(screen.getByText('Gestión de Alumnos')).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getByText('Lista de Alumnos')).toBeInTheDocument()
    })
  })
})

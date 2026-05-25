import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect } from 'vitest'
import Navbar from './Navbar'

describe('Navbar', () => {
  it('debe renderizar correctamente el título y los enlaces', () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    )

    expect(screen.getByText('Gestión de Alumnos')).toBeInTheDocument()
    expect(screen.getByText('Alumnos')).toBeInTheDocument()
    expect(screen.getByText('+ Nuevo Alumno')).toBeInTheDocument()
  })
})

<div align="right">
  <a href="./001-clean-architecture.md">
    <img
      alt="English"
      src="https://img.shields.io/badge/Language-English-1f6feb?style=for-the-badge"
    />
  </a>
  <a href="./001-clean-architecture.es.md">
    <img
      alt="Espanol"
      src="https://img.shields.io/badge/Idioma-Espanol-0b7a4b?style=for-the-badge"
    />
  </a>
</div>

# ADR 001 - Arquitectura limpia pragmatica

## Estado

Aceptada

## Decision

Usar un monolito modular pragmatico con limites claros de dominio, aplicacion e infraestructura por cada modulo de negocio.

## Razon

- El prompt exige explicitamente un monolito profesional, no microservicios
- Las reglas de tickets, el comportamiento SLA, la autorizacion y la auditoria son criticos para el negocio y deben seguir siendo testeables sin acoplamiento al framework
- Los limites por modulo reducen la complejidad accidental tanto en codigo como en pruebas

## Consecuencias

- Mas codigo de mapeo explicito
- Mejor aislamiento para pruebas de dominio y aplicacion
- Extraccion futura mas sencilla de adaptadores como almacenamiento de archivos en la nube

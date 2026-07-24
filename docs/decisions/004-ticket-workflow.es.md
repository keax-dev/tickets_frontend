<div align="right">
  <a href="./004-ticket-workflow.md">
    <img
      alt="English"
      src="https://img.shields.io/badge/Language-English-1f6feb?style=for-the-badge"
    />
  </a>
  <a href="./004-ticket-workflow.es.md">
    <img
      alt="Espanol"
      src="https://img.shields.io/badge/Idioma-Espanol-0b7a4b?style=for-the-badge"
    />
  </a>
</div>

# ADR 004 - Flujo de Tickets

## Estado

Aceptada

## Decision

Modelar explicitamente las transiciones del ticket en el dominio y rechazar cambios de estado invalidos mediante excepciones de dominio.

## Razon

- El flujo contiene restricciones estrictas de rol y estado
- Permitir actualizaciones ad-hoc de estado en controllers o codigo de UI generaria comportamiento inconsistente
- La pausa o reanudacion del SLA y el historial de auditoria dependen de reglas de transicion confiables

## Consecuencias

- Los controllers permanecen delgados
- El frontend recibe un modelo de acciones estable desde el API
- Los conflictos de version y las transiciones invalidas pueden reportarse de forma consistente

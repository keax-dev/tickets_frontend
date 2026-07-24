<div align="right">
  <a href="./003-angular-state-management.md">
    <img
      alt="English"
      src="https://img.shields.io/badge/Language-English-1f6feb?style=for-the-badge"
    />
  </a>
  <a href="./003-angular-state-management.es.md">
    <img
      alt="Espanol"
      src="https://img.shields.io/badge/Idioma-Espanol-0b7a4b?style=for-the-badge"
    />
  </a>
</div>

# ADR 003 - Gestion de Estado en Angular

## Estado

Aceptada

## Decision

Usar stores y facades locales por feature basados en Signals, combinados con RxJS para la orquestacion HTTP.

## Razon

- Angular 21 proporciona primitivas reactivas de primer nivel para estado local y derivado de UI
- El prompt desalienta introducir NgRx sin una necesidad demostrada
- RxJS sigue siendo mas adecuado para cancelacion, debounce, colas de refresh y preocupaciones de transporte

## Consecuencias

- Cada feature es dueña de su limite de estado
- El estado compartido entre features se mantiene al minimo
- Las mutaciones se exponen mediante metodos explicitos del store

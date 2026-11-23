# Práctica 4 · Tu batería de casos

Una fila por caso. La primera va de ejemplo. Para añadir un caso, copia una fila vacía y
rellénala; la vista previa (Ctrl+Shift+V) la enseña como tabla. Si ya empezaste en
`casos.csv`, puedes seguir allí.

| ID | Título | Requisito | Tipo | Precondición | Operación y entrada | Esperado | Estable | Candidata | Evidencia |
|---|---|---|---|---|---|---|---|---|---|
| CP-01 | Apuesta válida en sorteo abierto | REQ-13 a REQ-19 | positivo | Token de ana | `POST /apuestas` con `{"sorteoId": 4, "numeros": [3,12,21,30,39,48]}` | 201, cabecera `Location`, estado `activa`, importe 0.5 | | | |
| CP-02 | | | | | | | | | |
| CP-03 | | | | | | | | | |
| CP-04 | | | | | | | | | |
| CP-05 | | | | | | | | | |
| CP-06 | | | | | | | | | |
| CP-07 | | | | | | | | | |
| CP-08 | | | | | | | | | |
| CP-09 | | | | | | | | | |
| CP-10 | | | | | | | | | |
| CP-11 | | | | | | | | | |
| CP-12 | | | | | | | | | |
| CP-13 | | | | | | | | | |
| CP-14 | | | | | | | | | |
| CP-15 | | | | | | | | | |

**Tipo:** positivo, negativo, límite o seguridad. **Estable y Candidata:** pasa o falla.
**Evidencia:** si falla, el código y lo que devolvió (o el curl).

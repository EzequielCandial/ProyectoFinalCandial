# Proyecto Final- Simulador de Conversión de Monedas y Criptomonedas

**Autor:** Ezequiel Candial  
**Curso:** JavaScript - Coderhouse  
**Año:** 2025  


## Descripción general

Este proyecto es un **simulador interactivo de conversión de monedas y criptomonedas**, que incluye una **cartera virtual** y un **historial de operaciones**, todo desarrollado con **HTML, CSS y JavaScript puro**.

Permite realizar conversiones entre diferentes divisas y activos digitales, visualizar saldos actualizados y guardar tanto el usuario como las transacciones realizadas en el **almacenamiento local del navegador (localStorage)**.

##  Objetivos del proyecto

- Implementar un **simulador 100% funcional** que cumpla el flujo de entrada → procesamiento → salida.  
- Utilizar datos remotos **simulados con JSON** cargados mediante `fetch()`.  
- Emplear estructuras avanzadas de JavaScript (clases, arrays, objetos, funciones parametrizadas).  
- Mejorar la experiencia de usuario con **SweetAlert2** en lugar de `alert`, `prompt` o `confirm`.  
- Garantizar una interfaz limpia, legible y responsive.

##  Funcionalidades principales

###  Conversión de monedas
- Convierte entre **monedas fiat** (USD, EUR, ARS, BRL, etc.) y **criptomonedas** (BTC, ETH, USDT, USDC).
- Los valores se obtienen desde un archivo remoto `data/rates.json`.
- El cálculo se realiza de forma dinámica y asíncrona.

###  Cartera virtual
- Muestra los saldos del usuario en distintas monedas.
- Posibilidad de **aplicar la conversión directamente a la cartera**.
- Los saldos se actualizan en tiempo real y se guardan en `localStorage`.

###  Historial de operaciones
- Registra todas las conversiones realizadas.
- Permite filtrar operaciones por tipo:
  - **Fiat**
  - **Cripto**
  - **Todas**
- Cada operación muestra fecha, monto y tipo de impacto en la cartera.

###  Gestión de usuario
- El usuario puede ingresar su nombre, el cual se guarda en el navegador.
- Personaliza la experiencia de uso.


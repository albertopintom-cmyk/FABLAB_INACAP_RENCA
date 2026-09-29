---
layout: default
title: Arquitectura
nav_order: 2
---


# Arquitectura

## Project

FABLAB INACAP RENCA

## Stack aprobado

- **GitHub:** repositorio de código, control de versiones y colaboración.
- **Vercel:** despliegue y hosting del portal web.
- **Supabase:** backend administrado, autenticación, API y conexión a la base de datos.
- **React + Vite:** aplicación frontend del portal público y panel administrador.
- **PostgreSQL:** base de datos propia e independiente del proyecto.

## Architectural Principles

- Independent project
- Institutional ownership
- Future maintainability
- Low coupling

## Alcance e independencia

El portal FABLAB INACAP RENCA administra y publica información de proyectos institucionales. Mantiene una base de datos propia y no depende operativamente de **FABLAB Access** ni de **Open SAM**.

- **FABLAB Access** no es una dependencia del portal.
- **Open SAM** mantiene la gestión detallada de proyectos; el portal solo difunde información seleccionada.
- Las futuras integraciones deben ser explícitas, documentadas y no deben convertir estos sistemas en dependencias obligatorias.

## System Boundaries

FABLAB Access is an independent system.

Open SAM is an independent system.

FABLAB INACAP RENCA is focused on public dissemination.

## Diagrama de alto nivel

```text
GitHub
  |
Vercel
  |
React + Vite
  |
Supabase
  |
PostgreSQL
```

El código se versiona en GitHub y Vercel puede desplegar automáticamente desde el repositorio principal.

---
layout: default
title: Contexto
nav_order: 2
---

# AUTO-GENERATED FILE - DO NOT EDIT MANUALLY

## Proyecto

**FABLAB INACAP Renca** es un portal institucional para difundir proyectos desarrollados en el FabLab de la sede Renca.

## Propósito

El portal muestra proyectos, noticias y contenido institucional seleccionado. La gestión detallada de proyectos pertenece a Open SAM y no forma parte del alcance principal de este sistema.

## Arquitectura resumida

- Frontend: React + Vite.
- Backend y autenticación: Supabase.
- Base de datos: PostgreSQL propia.
- Despliegue: Vercel.
- Código fuente: GitHub.
- Sistemas externos independientes: FABLAB Access y Open SAM.

## Alcance actual

- Home institucional.
- Catálogo público de proyectos.
- Filtros y búsqueda.
- Panel administrador MVP.
- Estructura SQL inicial para contenido, usuarios administradores y configuración.
- Datos simulados disponibles cuando Supabase no está configurado.

## Criterios de continuidad

La solución debe mantenerse simple, documentada y comprensible para futuros coordinadores, docentes y estudiantes. Los cambios de arquitectura o integración deben registrarse en `BITACORA_TECNICA.md`.

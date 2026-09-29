---
layout: default
title: Bitácora
nav_order: 2
---

# Bitácora técnica

Las entradas más recientes se agregan al inicio. El documento histórico existente se conserva sin modificaciones.

## 2026-09-07 — Projects Module Completed

The FABLAB INACAP RENCA projects module reached MVP completion.

### Completed

- Supabase integration completed.
- `projects` table created and validated.
- Row Level Security (RLS) configured.
- Public project catalog connected to Supabase.
- Dynamic categories implemented.
- Public project visualization operational.
- Supabase Storage bucket "projects" created.
- Public image URLs supported through `image_url`.
- Private administration module implemented.
- Supabase Auth login implemented.
- `admin_users` table created.
- Protected `/admin` access implemented.
- CRUD operations completed:
	- Create
	- Read
	- Update
	- Delete
- Project creation operational from admin panel.
- Project editing operational from admin panel.
- Project deletion operational from admin panel.

## 2026-09-06 — Project Images Strategy Approved

- Supabase Storage will be used for project images.
- A bucket named "projects" will store project photos.
- The field `projects.image_url` will store the public image URL.
- React already supports `image_url`.
- `hero.png` will remain as fallback.
- Next task: Create the Storage bucket and upload real FABLAB images.

## 2026-09-06 — Creación del MVP

- Se creó el MVP del portal institucional FABLAB INACAP Renca.
- Se definió el alcance inicial como portal público de difusión de proyectos y panel administrador básico.
- Se priorizó una solución simple, mantenible y desacoplada de FABLAB Access y Open SAM.

### React + Vite

- Se inicializó la aplicación con React y Vite.
- Se configuró el flujo de desarrollo, compilación y lint.
- Se incorporó una interfaz responsive con identidad visual basada en los colores institucionales INACAP.

### Preparación de Supabase

- Se agregó el cliente opcional de Supabase mediante variables de entorno.
- Se preparó el esquema PostgreSQL inicial para `projects`, `news`, `admin_users` y `settings`.
- Se habilitaron políticas básicas de Row Level Security para contenido público y administración autenticada.

### Portal público inicial

- Se implementaron hero principal, estadísticas, proyectos destacados, búsqueda y filtros.
- Se agregó detalle modal de proyectos.
- Se agregó sección Comunidad y footer institucional.
- Se mantuvieron datos simulados como fallback para permitir ejecutar el MVP sin credenciales externas.

## Registro histórico

Los registros técnicos anteriores se encuentran en el archivo `Bitácora_Copilot_ arquitectura_y_razonamiento.docx`, conservado en esta carpeta.

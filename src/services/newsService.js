import { supabase } from '../lib/supabase'

/**
 * Obtiene todas las noticias publicadas ordenadas por fecha de creación descendente.
 * Solo retorna registros donde published = true.
 */
export async function getPublishedNews() {
  if (!supabase) {
    throw new Error('Supabase no está configurado.')
  }

  const { data, error } = await supabase
    .from('news')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error al obtener noticias publicadas:', error)
    throw error
  }

  return data
}

/**
 * Obtiene una noticia publicada específica por su ID.
 * Solo retorna el registro si published = true.
 */
export async function getNewsById(id) {
  if (!supabase) {
    throw new Error('Supabase no está configurado.')
  }

  const { data, error } = await supabase
    .from('news')
    .select('*')
    .eq('id', id)
    .eq('published', true)
    .single()

  if (error) {
    console.error(`Error al obtener noticia con id ${id}:`, error)
    throw error
  }

  return data
}

/**
 * Crea una nueva noticia en la base de datos.
 * @param {Object} data - Datos de la noticia (title, summary, content, image_url, published, etc.)
 */
export async function createNews(data) {
  if (!supabase) {
    throw new Error('Supabase no está configurado.')
  }

  const { data: createdNews, error } = await supabase
    .from('news')
    .insert(data)
    .select()
    .single()

  if (error) {
    console.error('Error al crear noticia:', error)
    throw error
  }

  return createdNews
}

/**
 * Actualiza una noticia existente por su ID.
 * @param {string|number} id - ID de la noticia a actualizar.
 * @param {Object} data - Campos a actualizar.
 */
export async function updateNews(id, data) {
  if (!supabase) {
    throw new Error('Supabase no está configurado.')
  }

  const { data: updatedNews, error } = await supabase
    .from('news')
    .update(data)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error(`Error al actualizar noticia con id ${id}:`, error)
    throw error
  }

  return updatedNews
}

/**
 * Elimina una noticia por su ID.
 * @param {string|number} id - ID de la noticia a eliminar.
 */
export async function deleteNews(id) {
  if (!supabase) {
    throw new Error('Supabase no está configurado.')
  }

  const { data, error } = await supabase
    .from('news')
    .delete()
    .eq('id', id)
    .select()

  if (error) {
    console.error(`Error al eliminar noticia con id ${id}:`, error)
    throw error
  }

  return data
}

export default {
  getPublishedNews,
  getNewsById,
  createNews,
  updateNews,
  deleteNews,
}

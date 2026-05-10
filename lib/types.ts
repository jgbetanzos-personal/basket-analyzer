export type PlayType =
  | 'canasta_2pts'
  | 'canasta_3pts'
  | 'tiro_libre_anotado'
  | 'tiro_libre_fallado'
  | 'rebote_ofensivo'
  | 'rebote_defensivo'
  | 'asistencia'
  | 'tapon'
  | 'robo'
  | 'falta'
  | 'perdida'

export interface Evento {
  tiempo: string
  tipo: PlayType
  jugador: string
  equipo: 'local' | 'visitante'
  descripcion: string
}

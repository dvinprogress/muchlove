/**
 * Utilitaires pour gerer les statuts de contacts et leur affichage
 */

import type { ContactStatus, ProcessingStatus } from '@/types/database';

/**
 * Configuration d'affichage d'un statut
 */
export interface StatusConfig {
  label: string;
  variant: 'default' | 'success' | 'warning' | 'danger' | 'info';
  color: string;
  order: number;
}

/**
 * Retourne la configuration d'affichage d'un statut de contact
 */
export function getContactStatusConfig(status: ContactStatus): StatusConfig {
  const configs: Record<ContactStatus, StatusConfig> = {
    created: {
      label: 'Cree',
      variant: 'default',
      color: 'bg-slate-400',
      order: 0,
    },
    invited: {
      label: 'Invite',
      variant: 'info',
      color: 'bg-blue-500',
      order: 1,
    },
    link_opened: {
      label: 'Lien ouvert',
      variant: 'info',
      color: 'bg-indigo-500',
      order: 2,
    },
    video_started: {
      label: 'En cours',
      variant: 'warning',
      color: 'bg-purple-500',
      order: 3,
    },
    video_completed: {
      label: 'Video terminee',
      variant: 'success',
      color: 'bg-green-500',
      order: 4,
    },
    shared_1: {
      label: 'Partage 1/3',
      variant: 'success',
      color: 'bg-emerald-500',
      order: 5,
    },
    shared_2: {
      label: 'Partage 2/3',
      variant: 'success',
      color: 'bg-emerald-500',
      order: 6,
    },
    shared_3: {
      label: 'Ambassadeur',
      variant: 'success',
      color: 'bg-amber-500',
      order: 7,
    },
  };

  return configs[status];
}

/**
 * Retourne la configuration d'affichage d'un statut de traitement
 */
export function getProcessingStatusConfig(status: ProcessingStatus): StatusConfig {
  const configs: Record<ProcessingStatus, StatusConfig> = {
    pending: {
      label: 'En attente',
      variant: 'default',
      color: 'bg-slate-400',
      order: 0,
    },
    processing: {
      label: 'Traitement...',
      variant: 'warning',
      color: 'bg-orange-500',
      order: 1,
    },
    completed: {
      label: 'Termine',
      variant: 'success',
      color: 'bg-green-500',
      order: 2,
    },
    failed: {
      label: 'Echoue',
      variant: 'danger',
      color: 'bg-red-500',
      order: 3,
    },
  };

  return configs[status];
}

/**
 * Ordre des statuts dans le funnel de conversion
 */
export const CONTACT_STATUS_ORDER: ContactStatus[] = [
  'created',
  'invited',
  'link_opened',
  'video_started',
  'video_completed',
  'shared_1',
  'shared_2',
  'shared_3',
];

/**
 * Etapes simplifiees du funnel pour affichage dashboard
 */
export const FUNNEL_STEPS = [
  {
    key: 'created',
    label: 'Crees',
    statuses: ['created'] as const,
  },
  {
    key: 'invited',
    label: 'Invites',
    statuses: ['invited'] as const,
  },
  {
    key: 'opened',
    label: 'Lien ouvert',
    statuses: ['link_opened'] as const,
  },
  {
    key: 'video',
    label: 'Video',
    statuses: ['video_started', 'video_completed'] as const,
  },
  {
    key: 'shared',
    label: 'Partages',
    statuses: ['shared_1', 'shared_2', 'shared_3'] as const,
  },
] as const;

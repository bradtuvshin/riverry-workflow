export const ROLES = {
  MASTER: 'master',
  ADMIN: 'admin',
  EDITOR: 'editor',
  REVISOR: 'revisor',
  CUSTOMER_SERVICE: 'customer_service',
  CUSTOMER: 'customer',
  ARTIST: 'artist'
};

export const TASK_STATUS = {
  PENDING: 'pending',
  ASSIGNED: 'assigned',
  IN_PROGRESS: 'in_progress',
  SUBMITTED: 'submitted',
  NEEDS_REVISION: 'needs_revision',
  COMPLETED: 'completed'
};

export const STATUS_COLORS = {
  [TASK_STATUS.PENDING]: 'gray',
  [TASK_STATUS.ASSIGNED]: 'blue',
  [TASK_STATUS.IN_PROGRESS]: 'warning',
  [TASK_STATUS.SUBMITTED]: 'blue',
  [TASK_STATUS.NEEDS_REVISION]: 'danger',
  [TASK_STATUS.COMPLETED]: 'success'
};

export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

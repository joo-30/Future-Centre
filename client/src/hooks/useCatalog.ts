import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

export const useCatalog = () =>
  useQuery({ queryKey: ['catalog'], queryFn: api.catalog, staleTime: 60000 });

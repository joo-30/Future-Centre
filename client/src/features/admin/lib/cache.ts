import { useQueryClient } from '@tanstack/react-query';

export const refreshAdmin = (client: ReturnType<typeof useQueryClient>) => {
  void client.invalidateQueries({ queryKey: ['admin'] });
  void client.invalidateQueries({ queryKey: ['account'] });
  void client.invalidateQueries({ queryKey: ['catalog'] });
  void client.invalidateQueries({ queryKey: ['availability'] });
};

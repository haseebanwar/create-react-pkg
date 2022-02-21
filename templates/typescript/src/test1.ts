export type Hello = {
  message: string;
};

export function logHello(): Hello {
  return {
    message: 'hellothere',
  };
}

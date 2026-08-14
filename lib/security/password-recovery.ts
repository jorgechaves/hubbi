export function passwordRecoveryClientOptions() {
  return {
    auth: { detectSessionInUrl: false },
    isSingleton: false,
  } as const
}

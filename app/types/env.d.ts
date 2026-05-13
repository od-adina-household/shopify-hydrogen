// Augment the global Env type to include the R2 bucket binding
// This ensures TypeScript knows about ASSETS_BUCKET in route loaders/actions
declare global {
  interface Env {
    ASSETS_BUCKET: R2Bucket
  }
}

export {}
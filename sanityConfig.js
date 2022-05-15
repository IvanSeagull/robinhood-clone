export const config = {
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECTID,
  dataset: 'production',
  apiVersion: 'v1',
  token: process.env.NEXT_PUBLIC_SANITY_TOKEN,
  useCdn: false,
};

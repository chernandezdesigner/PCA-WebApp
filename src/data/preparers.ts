export interface Preparer {
  name: string;
  title: string;
  signatureKey: string;
}

export const PREPARERS: Record<string, Preparer> = {
  'john-doe': {
    name: 'John Doe',
    title: 'Project Manager',
    signatureKey: 'john-doe-signature.png',
  },
  'jane-doe': {
    name: 'Jane Doe',
    title: 'Project Manager',
    signatureKey: 'jane-doe-signature.png',
  },
};

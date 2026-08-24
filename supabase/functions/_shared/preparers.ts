export interface Preparer {
  name: string;
  title: string;
  signatureKey: string; // path within report-assets bucket, spaces preserved (URL-encoded at runtime)
}

export const PREPARERS: Record<string, Preparer> = {
  'anthony-notaro': {
    name: 'Anthony Notaro',
    title: 'Project Manager',
    signatureKey: 'prepared-by-signatures/Anthony Notaro Signature.jpg',
  },
  'gabriella-baldomero': {
    name: 'Gabriella Baldomero',
    title: 'Project Manager',
    signatureKey: 'prepared-by-signatures/Gabriella Baldomero Signature.jpg',
  },
  't-west-white': {
    name: 'T. West White',
    title: 'Project Manager',
    signatureKey: 'prepared-by-signatures/T. West White Signature.png',
  },
  'timothy-d-nelson': {
    name: 'Timothy D. Nelson',
    title: 'Project Manager',
    signatureKey: 'prepared-by-signatures/Timothy D. Nelson Signature.png',
  },
  'kerry-cooper': {
    name: 'Kerry Cooper',
    title: 'Project Manager',
    signatureKey: 'prepared-by-signatures/Kerry Cooper Signature.jpg',
  },
  'stephanie-melvin': {
    name: 'Stephanie Melvin',
    title: 'Project Manager',
    signatureKey: 'prepared-by-signatures/Stephanie Melvin Signature.jpg',
  },
  'john-t-mcrae': {
    name: 'John T. McRae',
    title: 'Project Manager',
    signatureKey: 'prepared-by-signatures/John T. McRae Signature.png',
  },
  'billy-mueller': {
    name: 'Billy Mueller',
    title: 'Project Manager',
    signatureKey: 'prepared-by-signatures/Billy Mueller Signature.jpg',
  },
  'craig-lanouette': {
    name: 'Craig Lanouette',
    title: 'Project Manager',
    signatureKey: 'prepared-by-signatures/Craig Lanouette Signature.png',
  },
  'brendan-yadav': {
    name: 'Brendan Yadav',
    title: 'Project Manager',
    signatureKey: 'prepared-by-signatures/Brendan Yadav Signature.jpg',
  },
  'sarah-malekpour': {
    name: 'Sarah Malekpour',
    title: 'Project Manager',
    signatureKey: 'prepared-by-signatures/Sarah Malekpour Signature.png',
  },
  'taru-holinsworth': {
    name: 'Taru Holinsworth',
    title: 'Project Manager',
    signatureKey: 'prepared-by-signatures/Taru Holinsworth Signature.png',
  },
};

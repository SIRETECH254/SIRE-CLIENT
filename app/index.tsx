import { Redirect } from 'expo-router';

export default function RootIndex() {
  // Always show the public landing page regardless of authentication status
  return <Redirect href="/(public)" />;
}


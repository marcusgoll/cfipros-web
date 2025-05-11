import HomePageV2 from '@/app/home-v2';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CFIPros - Flight Training Platform (New Design)',
  description:
    'Connect with flight instructors, track your training progress, and manage your flight school with our all-in-one platform.',
};

export default function HomeV2Page() {
  return <HomePageV2 />;
}

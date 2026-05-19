export const mockRequests = [
  {
    id: '1',
    tenantName: 'Sarah Jenkins',
    initials: 'SJ',
    avatarColor: '#10b981', // green-ish
    appliedAt: 'Applied 2 hours ago',
    status: 'New',
    roomName: 'Suite 4B - The Brooklyn',
    moveInDate: 'Oct 1st, 2024',
    message: '"Hi, I\'m relocating for a new job in tech and your property looks perfect. I have excellent credit and references ready."',
  },
  {
    id: '2',
    tenantName: 'Michael Chen',
    initials: 'MC',
    avatarColor: '#3b82f6', // blue-ish
    appliedAt: 'Applied 1 day ago',
    status: 'Under Review',
    roomName: 'Studio 2A - The Minimalist',
    moveInDate: 'Nov 15th, 2024',
    message: '"I\'m currently a grad student looking for a quiet space. I\'ve uploaded my guarantor documents as requested."',
  },
  {
    id: '3',
    tenantName: 'Emily Jones',
    initials: 'EJ',
    avatarColor: '#eab308', // yellow-ish
    appliedAt: 'Applied 3 days ago',
    status: 'Accepted',
    roomName: 'Suite 1C - The Garden',
    moveInDate: 'Sep 15th, 2024',
    message: '"Thanks for the quick approval! Looking forward to receiving the lease agreement."',
  },
  {
    id: '4',
    tenantName: 'David Wright',
    initials: 'DW',
    avatarColor: '#f43f5e', // red-ish
    appliedAt: 'Applied 1 week ago',
    status: 'Rejected',
    roomName: 'Studio 5F - The Loft',
    moveInDate: 'N/A',
    message: '',
  }
];

export const getRentalRequests = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockRequests);
    }, 500);
  });
};



export interface UserDetails {
  id: string;
  uniqueId: string;
  userType: string;
  authToken: string;
  isActive: boolean;
  status: string;
  fullName: string;
  profileUrl: string;
  email: string;
  countryCode: string;
  mobileNumber: string;
  employerId: string;
  department: string;
  designation: string;
  rewardPoints: number|string;
  companyLogo: string;
  companyName: string;
  companyDescription: string;
  isProfileCompleted: boolean;
  isPersonalityTestCompleted: boolean;
  shipId: string | null;
  isBoarded: boolean;
  isMoodTracker: boolean;
  isHappinessIndex: boolean;
  notificationCount: number;
  [key: string]: any;
}

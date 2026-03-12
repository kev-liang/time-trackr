export type OnboardingPageData = {
  title: string;
  description: string;
  iconName: string;
};

export const ONBOARDING_PAGES: OnboardingPageData[] = [
  {
    title: "Track where your\ntime goes",
    description:
      "Log your activities throughout the day and see exactly how you spend your time — hour by hour.",
    iconName: "clock.fill",
  },
  {
    title: "Understand your\npatterns",
    description:
      "Browse your history and spot trends across days and weeks to make smarter decisions.",
    iconName: "chart.bar.fill",
  },
  {
    title: "Stay on track with\nreminders",
    description:
      "Get nudged at the right times so your activity log stays accurate. Set your own schedule.",
    iconName: "bell.fill",
  },
];

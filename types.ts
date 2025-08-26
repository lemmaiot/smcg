export enum Platform {
  Instagram = 'Instagram',
  Twitter = 'Twitter',
  Facebook = 'Facebook',
  LinkedIn = 'LinkedIn',
  TikTok = 'TikTok',
}

export enum AppStep {
  SELECT_PLATFORM,
  ENTER_HANDLE,
  CONFIRM_HANDLE,
  ENTER_TOPIC,
  GENERATING,
  SHOW_RESULTS,
}

export interface PostSuggestion {
  caption: string;
  imageSuggestion: string;
  hashtags: string[];
}

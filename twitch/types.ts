export type AppToken = {
  access_token: string;
  expires_in: number;
  token_type: "bearer";
};

export type Result<T> = {
  data: T;
};

export interface Stream {
  id: string;
  user_id: string;
  user_login: string;
  user_name: string;
  game_id: string;
  game_name: string;
  type: string;
  title: string;
  tags: string[];
  viewer_count: number;
  started_at: Date;
  language: string;
  thumbnail_url: string;
  is_mature: boolean;
}

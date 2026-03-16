/* eslint-disable @typescript-eslint/no-explicit-any */

export interface GitHubRawIssue {
  number: number;
  title: string;
  state: string;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  comments: number;
  labels: { id: number; name: string; color: string }[];
  user: { login: string };
  body: string | null;
  pull_request?: unknown;
}

export interface GitHubContent {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  git_url: string;
  type: string;
  _links: {
    git: string;
    self: string;
    html: string;
  };
}

interface GitHubUser {
  login: string;
  node_id: string;
  url: string;
  site_admin: boolean;
}

export interface GitHubIssuesItem {
  active_lock_reason: string | null;
  body: string;
  closed_at: string | null;
  comments: number;
  comments_url: string;
  created_at: string;
  events_url: string;
  html_url: string;
  id: number;
  labels: any[];
  labels_url: string;
  locked: boolean;
  milestone: any;
  node_id: string;
  number: number;
  performed_via_github_app: null;
  url: string;
  state: string;
  title: string;
  updated_at: string;
}

export interface GitHubIssue {
  incomplete_results: boolean;
  items: GitHubIssuesItem[];
  total_count: number;
}

export interface GitHubContributor {
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  gravatar_id: string;
  url: string;
  html_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  starred_url: string;
  subscriptions_url: string;
  organizations_url: string;
  repos_url: string;
  events_url: string;
  received_events_url: string;
  type: string;
  user_view_type: string;
  site_admin: boolean;
  contributions: number;
}

export interface GitHubComment {
  id: number;
  author_association: string;
  created_at: string;
  updated_at: string;
  body: string;
  url: string;
  user: GitHubUser;
  issue_url: string;
  html_url: string;
}

export interface GitHubOrganizedComments {
  id: number;
  comments: GitHubComment[];
}

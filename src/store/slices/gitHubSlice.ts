import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { GitHubComment, GitHubContent, GitHubContributor, GitHubIssue, GitHubOrganizedComments } from "../../types/gitHub";
import api from "../../api/api";

export interface GitHubState {
  contents: GitHubContent[];
  issues: GitHubIssue;
  contributors: GitHubContributor[];
  loading: boolean;
  error: string | null;
  comments: GitHubComment[];
  organizedComments: GitHubOrganizedComments[]
}

const initialState: GitHubState = {
  contents: [],
  issues: {
    incomplete_results: false,
    items: [],
    total_count: 0,
  },
  organizedComments: [],
  contributors: [],
  comments: [],
  loading: false,
  error: null,
};

interface FetchGitHubIssuesParams {
  repoFullName: string;
  label: string;
}

interface FetchGitHubCommentsParams {
  repoFullName: string;
  issueNumber: number;
}

export const fetchGitHubContents = createAsyncThunk(
  "gitHub/fetchContents",
  async (repoFullName: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/repos/${repoFullName}/contents`);
      return response.data as GitHubContent[];
    } catch {
      return rejectWithValue("Falha ao recuperar conteúdo do GitHub.");
    }
  }
);

export const fetchGitHubContributors = createAsyncThunk(
  "gitHub/fetchContributors",
  async (repoFullName: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/repos/${repoFullName}/contributors`, {
        params: { per_page: 100 },
      });
      return response.data as GitHubContributor[];
    } catch {
      return rejectWithValue("Falha ao recuperar contribuidores do GitHub.");
    }
  }
);

export const fetchGitHubIssues = createAsyncThunk(
  "gitHub/fetchIssues",
  async ({ label, repoFullName }: FetchGitHubIssuesParams, { rejectWithValue }) => {
    try {
      const response = await api.get(`/search/issues`, {
        params: {
          q: `repo:${repoFullName} is:issue state:open label:"${label}"`,
        },
      });
      return response.data as GitHubIssue;
    } catch {
      return rejectWithValue("Falha ao recuperar issues do GitHub.");
    }
  }
);

export const fetchGitHubComments = createAsyncThunk(
  "gitHub/fetchComments",
  async ({ issueNumber, repoFullName }: FetchGitHubCommentsParams, { rejectWithValue }) => {
    try {
      const response = await api.get(`/repos/${repoFullName}/issues/${issueNumber}/comments`);
      return response.data as GitHubComment[];
    } catch {
      return rejectWithValue("Falha ao recuperar comentários do GitHub."); 
    }
  }
)

export const gitHubSlice = createSlice({
  name: "gitHub",
  initialState,
  reducers: {
    clearGitHubState: (state) => {
      state.contents = [];
      state.issues = {
        incomplete_results: false,
        items: [],
        total_count: 0,
      };
      state.contributors = [];
      state.comments = [];
      state.loading = false;
      state.organizedComments = [];
      state.error = null;
    },
    organizeCommentsByIdSection: (state) => {
      const recordOrganizedById: Record<number, GitHubComment[]> = {};
      state.comments.forEach((comment) => {
        const idUrl = comment.issue_url.split("/")[7];
        if (!recordOrganizedById[+idUrl]) {
          recordOrganizedById[+idUrl] = [];
        }
        if (recordOrganizedById[+idUrl].length < 2) {
          const hasEqualUser =recordOrganizedById[+idUrl].find((item) => item.user.login === comment.user.login)
          console.log(hasEqualUser)
          if (!hasEqualUser) {
            recordOrganizedById[+idUrl].push(comment);
          }
        }
      });
      state.organizedComments = Object.entries(recordOrganizedById).map(([id, comments]) => {
        return {
          id: +id,
          comments
        }
      });
      console.log(state.comments)
      console.log(state.organizedComments)
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGitHubContents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGitHubContents.fulfilled, (state, action) => {
        state.loading = false;
        state.contents = action.payload;
      })
      .addCase(fetchGitHubContents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(fetchGitHubContributors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGitHubContributors.fulfilled, (state, action) => {
        state.loading = false;
        state.contributors = action.payload;
      })
      .addCase(fetchGitHubContributors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(fetchGitHubIssues.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGitHubIssues.fulfilled, (state, action) => {
        state.loading = false;
        state.issues = action.payload;
      })
      .addCase(fetchGitHubIssues.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(fetchGitHubComments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGitHubComments.fulfilled, (state, action) => {
        state.loading = false;
        state.comments = [...state.comments, ...action.payload];
      })
      .addCase(fetchGitHubComments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearGitHubState, organizeCommentsByIdSection } = gitHubSlice.actions;
export default gitHubSlice.reducer;

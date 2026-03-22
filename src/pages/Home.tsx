import { Button, Card, Input } from "@mantine/core";
import { useAppDispatch, useAppSelector } from "../store";
import { IconSearch, IconX } from "@tabler/icons-react";
import { setQuerySearch, unsetQuerySearch } from "../store/slices/searchSlice";
import useToast from "../hooks/useToast";
import {
  clearGitHubState,
  fetchContributing,
  fetchGitHubAllIssues,
  fetchGitHubComments,
  fetchGitHubContents,
  fetchGitHubContributors,
  fetchGitHubIssues,
  fetchReadme,
  fetchTotalOpenIssues,
  organizeCommentsByIdSection,
} from "../store/slices/gitHubSlice";
import {
  clearAnalysisResult,
  setAnalysisResult,
} from "../store/slices/analysisSlice";
import { computeAnalysis } from "../services/metricsCalculator";
import ScoreDashboard from "../components/ScoreDashboard";
import repoHoundDog from "../assets/RepoHoundimg.png";

const BEGINNER_LABELS = [
  "good first issue",
  "good-first-issue",
  "first-timers-only",
  "help wanted",
  "help-wanted",
  "p4",
  "good-first-bug",
  "good-first-contribution",
  "beginners",
  "newbie",
  "welcome",
  "easy-fix",
  "quick-fix",
];

export default function Home() {
  const { query } = useAppSelector((state) => state.search);
  const { loading, error } = useAppSelector((state) => state.gitHub);
  const { result: analysisResult } = useAppSelector((state) => state.analysis);
  const size = 16;
  const dispatch = useAppDispatch();
  const { handleErrorNotification, handleWarnNotification } = useToast();

  const handleSearchRepositoryGitHub = async () => {
    if (query.trim() === "") {
      handleWarnNotification(
        "Campo vazio",
        "Por favor, insira a URL do repositório GitHub.",
      );
      return;
    }

    const parts = query.split("/");
    if (
      parts[2] !== "github.com" ||
      query.startsWith("http://") ||
      parts.length < 5
    ) {
      handleWarnNotification(
        "URL inválida",
        "Por favor, insira uma URL válida do GitHub (ex: https://github.com/owner/repo).",
      );
      return;
    }

    const fullNamRepo = `${parts[3]}/${parts[4]}`;

    dispatch(clearGitHubState());
    dispatch(clearAnalysisResult());

    try {
      const [contentsData, readmeData, contributingData] = await Promise.all([
        dispatch(fetchGitHubContents(fullNamRepo)).unwrap(),
        dispatch(fetchReadme(fullNamRepo)).unwrap(),
        dispatch(fetchContributing(fullNamRepo)).unwrap(),
      ]);

      const [allIssuesData, totalOpenData, , taggedData] = await Promise.all([
        dispatch(fetchGitHubAllIssues(fullNamRepo)).unwrap(),
        dispatch(fetchTotalOpenIssues(fullNamRepo)).unwrap(),
        dispatch(fetchGitHubContributors(fullNamRepo)).unwrap(),
        dispatch(
          fetchGitHubIssues({
            repoFullName: fullNamRepo,
            label: BEGINNER_LABELS,
          }),
        ).unwrap(),
      ]);

      const commentsData: import("../types/gitHub").GitHubComment[] = [];
      if (taggedData && taggedData.total_count > 0) {
        const limited = taggedData.items.slice(0, 20);
        const commentResults = await Promise.all(
          limited.map((issue) =>
            dispatch(
              fetchGitHubComments({
                issueNumber: issue.number,
                repoFullName: fullNamRepo,
              }),
            ).unwrap(),
          ),
        );
        commentResults.forEach((r) => commentsData.push(...r));
      }

      dispatch(organizeCommentsByIdSection());

      const recordById: Record<
        number,
        import("../types/gitHub").GitHubComment[]
      > = {};
      commentsData.forEach((comment) => {
        const idStr = comment.issue_url.split("/").pop();
        if (!idStr) return;
        const id = Number(idStr);
        if (!recordById[id]) recordById[id] = [];
        const existing = recordById[id];
        if (existing.length < 2) {
          const duplicate = existing.find(
            (c) => c.user.login === comment.user.login,
          );
          if (!duplicate) existing.push(comment);
        }
      });
      const organizedComments = Object.entries(recordById).map(
        ([id, comments]) => ({ id: Number(id), comments }),
      );

      const analysis = computeAnalysis({
        readme: readmeData,
        contributing: contributingData ?? false,
        contents: contentsData,
        taggedIssues: taggedData,
        allIssues: allIssuesData,
        totalOpenIssues: totalOpenData,
        comments: commentsData,
        organizedComments,
        repoFullName: fullNamRepo,
      });

      dispatch(setAnalysisResult(analysis));
    } catch {
      handleErrorNotification(
        "Erro ao Recuperar Dados",
        error || "Ocorreu um erro ao buscar os dados do repositório GitHub.",
      );
    }
  };

  return (
    <main
      className={`row justify-content-center ${analysisResult ? "align-items-start pt-4" : "align-items-center"}`}
    >
      <section className="row justify-content-center align-items-center gap-2">
        <Card
          padding="lg"
          radius="md"
          className="col-12 col-sm-12 col-md-7 col-lg-7"
        >
          <div className="d-flex justify-content-center align-items-start">
            <img src={repoHoundDog} alt="RepoHound" style={{borderRadius: "50%", width: "350px", height: "350px"}}/>
          </div>
          <h1 className="col-12 text-center">Analise seu repositório GitHub</h1>
          <div className="d-flex col-12 justify-content-center align-items-center gap-2 flex-wrap flex-column">
            <Input
              rightSectionPointerEvents="all"
              onChange={(e) => dispatch(setQuerySearch(e.target.value))}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearchRepositoryGitHub();
              }}
              rightSection={
                query.trim() === "" ? (
                  <IconSearch
                    onClick={handleSearchRepositoryGitHub}
                    size={size}
                    style={{ cursor: "pointer" }}
                  />
                ) : (
                  <IconX
                    size={size}
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      dispatch(unsetQuerySearch())
                      dispatch(clearGitHubState());
                      dispatch(clearAnalysisResult());
                    }}
                  />
                )
              }
              type="text"
              size="md"
              radius={"md"}
              className="col-12 col-sm-12 col-md-7 col-lg-7"
              value={query}
              placeholder="Insira a URL GitHub: https://github.com/seu/repositorio"
            />
            <Button
              onClick={handleSearchRepositoryGitHub}
              className="col-12 col-sm-12 col-md-7 col-lg-7"
              radius={"md"}
              color="#002e68"
              loading={loading}
              disabled={loading}
            >
              Analisar
            </Button>
          </div>
        </Card>
      </section>

      {analysisResult && <ScoreDashboard result={analysisResult} />}
    </main>
  );
}

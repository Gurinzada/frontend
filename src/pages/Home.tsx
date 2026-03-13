import { Button, Card, Input } from "@mantine/core";
import { useAppDispatch, useAppSelector } from "../store";
import { IconSearch, IconX } from "@tabler/icons-react";
import { setQuerySearch, unsetQuerySearch } from "../store/slices/searchSlice";
import useToast from "../hooks/useToast";
import { clearGitHubState, fetchGitHubComments, fetchGitHubContents, fetchGitHubContributors, fetchGitHubIssues, organizeCommentsByIdSection } from "../store/slices/gitHubSlice";
import api from "../api/api";

export default function Home() {
  const { query } = useAppSelector((state) => state.search);
  const { contents, contributors, issues, loading, error, comments } = useAppSelector((state) => state.gitHub);
  const size = 16;
  const dispatch = useAppDispatch();
  const { handleErrorNotification, handleWarnNotification } = useToast();

  const handleSearchRepositoryGitHub = async () => {
    dispatch(clearGitHubState())
    await api.get("/rate_limit");
    const repo = query.split("/")
    const fullNamRepo = `${repo[3]}/${repo[4]}`
    console.log(repo);
    if (query.split("/")[2] !== "github.com" || query.startsWith("http://")) {
      handleWarnNotification(
        "URL inválida",
        "Por favor, insira uma URL válida do GitHub."
      );
      return;
    }
    if (query.trim() === "") {
      handleWarnNotification(
        "Campo vazio",
        "Por favor, insira a URL do repositório GitHub."
      );
      return;
    }

    try {
      await dispatch(fetchGitHubContents(fullNamRepo)).unwrap();
      await dispatch(fetchGitHubContributors(fullNamRepo)).unwrap();
      const issuesLabels = ["good first issue", "good-first-issue", "first-timers-only", "help wanted", "p4"];
      for (const label of issuesLabels) {
        const resultIssues = await dispatch(fetchGitHubIssues({ repoFullName: fullNamRepo, label })).unwrap();
        if (resultIssues.total_count > 0) {
          const resultIssuesLimits = resultIssues.total_count > 5 ? resultIssues.items.slice(0, 5): resultIssues.items;
          for (const issue of resultIssuesLimits) {
            await dispatch(fetchGitHubComments({issueNumber: issue.number, repoFullName: fullNamRepo})).unwrap();
          }
          break;
        }
      };
      dispatch(organizeCommentsByIdSection());
    } catch {
      handleErrorNotification("Erro ao Recuperar Dados", error || "Ocorreu um erro ao buscar os dados do repositório GitHub.");
    }
   
  };

  return (
    <main className="row justify-content-center align-items-center vh-100">
      <section className="row justify-content-center aling-items-center gap-2">
        <Card
          shadow="sm"
          padding="lg"
          radius="md"
          className="col-12 col-sm-12 col-md-7 col-lg-7"
        >
          <h1 className="col-12 text-center">Analise seu repositório GitHub</h1>
          <div className="d-flex col-12 justify-content-center align-items-center gap-2 flex-wrap flex-column">
            <Input
              rightSectionPointerEvents="all"
              onChange={(e) => dispatch(setQuerySearch(e.target.value))}
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
                    onClick={() => dispatch(unsetQuerySearch())}
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
              color="teal"
              loading={loading}
              disabled={loading}
            >
              Analisar
            </Button>
          </div>
        </Card>
        {comments.length}
      </section>
    </main>
  );
}

import {
  Button,
  Divider,
  Modal,
  Popover,
  Text,
  TextInput,
} from "@mantine/core";
import { useState } from "react";
import useToast from "../../hooks/useToast";
import { useAppDispatch } from "../../store";
import { insertTokenGitHub } from "../../store/slices/tokenGitHubSlice";
import { IconInfoSquareRounded, IconX } from "@tabler/icons-react";

interface ModalTokenProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ModalToken({ isOpen, onClose }: ModalTokenProps) {
  const [token, setToken] = useState<string>("");
  const [onHover, setOnHover] = useState<boolean>(false);
  const [onHoverStyles, setOnHoverStyles] = useState<boolean>(false);
  const {
    handleWarnNotification,
    handleSucessNotification,
    handleInfoNotification,
  } = useToast();
  const dispatch = useAppDispatch();
  const handleGitHubTokenSubmit = () => {
    if (token.trim() === "") {
      handleWarnNotification(
        "Campo vazio",
        "Insira um token válido do GitHub para continuar.",
        true,
      );
      return;
    }
    dispatch(insertTokenGitHub(token));
    setToken("");
    onClose();
    setTimeout(() => {
      handleSucessNotification(
        "Token salvo",
        "Seu token do GitHub foi salvo com sucesso.",
      );
      handleInfoNotification(
        "Seu token está seguro conosco",
        "Nossa plataforma armazena seu token somente localmente em seu navegador, garantindo que ele nunca seja compartilhado ou acessado por terceiros. Você tem controle total sobre seu token e pode remover quando desejar.",
      );
    }, 500);
  };

  return (
    <Modal
      aria-description="Área para Adicionar Token GitHub"
      opened={isOpen}
      onClose={onClose}
      title="Adicione seu Token do GitHub"
      centered
      size={"md"}
      withCloseButton
    >
      <Divider />
      <main className="mt-2">
        <div>
          <Popover
            position="bottom"
            opened={onHover}
            shadow="md"
            withArrow
            closeOnClickOutside={true}
          >
            <Popover.Target>
              <div className="d-flex justify-content-end">
                {onHover === false ? (
                  <IconInfoSquareRounded
                    size={20}
                    color="#666"
                    style={{
                      transform: onHoverStyles ? "scale(1.125)" : "scale(1)",
                      transition: "transform 0.2s ease",
                      cursor: "pointer",
                    }}
                    onClick={() => setOnHover((prev) => !prev)}
                    onMouseEnter={() => setOnHoverStyles(true)}
                    onMouseLeave={() => setOnHoverStyles(false)}
                  />
                ) : (
                  <IconX
                    size={20}
                    color="#666"
                    style={{
                      transform: onHoverStyles ? "scale(1.125)" : "scale(1)",
                      transition: "transform 0.2s ease",
                      cursor: "pointer",
                    }}
                    onClick={() => setOnHover((prev) => !prev)}
                    onMouseEnter={() => setOnHoverStyles(true)}
                    onMouseLeave={() => setOnHoverStyles(false)}
                  />
                )}
              </div>
            </Popover.Target>
            <Popover.Dropdown>
              <Text size="sm">
                Caso tenha dúvidas para gerar seu Token GitHub, siga a
                documentação abaixo:
              </Text>
              <Text size="sm" mt="xs">
                <a
                  href="https://docs.github.com/pt/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Gerenciar seus Tokens de Acesso Pessoal
                </a>
              </Text>
            </Popover.Dropdown>
          </Popover>
        </div>
        <div>
          <TextInput
            placeholder="Digite seu Token GitHub"
            label="Token GitHub"
            value={token}
            onChange={(e) => setToken(e.target.value)}
          />
          <Button
            onClick={handleGitHubTokenSubmit}
            color="#002e68"
            mt="md"
            fullWidth
          >
            Salvar Token
          </Button>
        </div>
      </main>
    </Modal>
  );
}

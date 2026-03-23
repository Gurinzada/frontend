import { Button, Divider, Modal, TextInput } from "@mantine/core";
import { useState } from "react";
import useToast from "../hooks/useToast";
import { useAppDispatch } from "../store";
import { insertTokenGitHub } from "../store/slices/tokenGitHubSlice";

interface ModalTokenProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ModalToken({ isOpen, onClose }: ModalTokenProps){

    const [token, setToken] = useState<string>('');
    const { handleWarnNotification, handleSucessNotification } = useToast();
    const dispatch = useAppDispatch();
    const handleGitHubTokenSubmit = () => {
        if (token.trim() === "") {
            handleWarnNotification("Campo vazio", "Insira um token válido do GitHub para continuar.");
            return;
        }
        dispatch(insertTokenGitHub(token));
        setToken('');
        onClose();
        setTimeout(() => {
            handleSucessNotification("Token salvo", "Seu token do GitHub foi salvo com sucesso.");
        }, 500)
    }

    return (
        <Modal aria-description="Área para Adicionar Token GitHub" opened={isOpen} onClose={onClose} title="Adicione seu Token do GitHub" centered size={"md"} withCloseButton>
            <Divider 
            />
            <main className="mt-2">
                <div>
                    <TextInput
                        placeholder="Digite seu Token GitHub"
                        label="Token GitHub"
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                    />
                    <Button onClick={handleGitHubTokenSubmit} color="#002e68" mt="md" fullWidth>
                        Salvar Token
                    </Button>
                </div>
            </main>
        </Modal>
    )
}
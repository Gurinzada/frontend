import { Button, DefaultMantineColor, Modal, Paper, Text } from "@mantine/core";

interface ConfirmModalProps {
        opened: boolean;
        onClose: () => void;
        title: string;
        description: string;
        onConfirm: () => void;
        colorButton?: DefaultMantineColor | string;
        titleButton: string;
}

export default function ConfirmModal({ description, onClose, onConfirm, opened, title, titleButton, colorButton }: ConfirmModalProps) {
    return (
        <Modal opened={opened} onClose={onClose} title={title} centered>
            <Paper shadow="sm" radius={"md"} withBorder p={"md"}>
                <Text>{description}</Text>
            </Paper>
            <div className="mt-2"></div>
            <Button color={colorButton} onClick={onConfirm} fullWidth>
                {titleButton}
            </Button>
        </Modal>
    )
}
import { IonContent, IonPage } from "@ionic/react";
import Header from "./Header/Header";

interface TemplateProps {
    children?: React.ReactNode;
}

export default function Template({ children }: TemplateProps) {
    return (
        <IonPage>
            <Header />
            <IonContent fullscreen>
                <div className="p-2 row justify-content-center align-items-center">
                    {children}
                </div>
            </IonContent>
        </IonPage>
    )
}
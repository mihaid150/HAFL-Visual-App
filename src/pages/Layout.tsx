import React, { ReactNode } from "react";
import { Header } from "../components/header/Header.tsx";

interface LayoutProps {
    children: ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <>
            <Header />
            <main style={{ marginTop: "8rem" }}>
                {children}
            </main>
        </>
    );
};

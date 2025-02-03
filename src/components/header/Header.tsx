import React, { useEffect, useState } from "react";
import "./Header.sass";
import { useNavigate } from "react-router-dom";
import menuData from "./MenuData.ts";

export const Header: React.FC = () => {
    const [sticky, setSticky] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => setSticky(window.scrollY > 0);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <header className={sticky ? "sticky" : ""}>
            <div className="container">
                <div className="logo-nav">
                    <div className="logo-section">
                        <img
                            src="/federated-app.svg"
                            alt="Logo"
                            className="logo"
                            onClick={() => navigate("/")}
                        />
                        <h3 className="title">Heuristic Adaptive Federated Learning</h3>
                    </div>
                    <nav>
                        {menuData.map((item) => (
                            <p key={item.id} onClick={() => navigate(item.path)}>
                                {item.title}
                            </p>
                        ))}
                    </nav>
                </div>
            </div>
        </header>
    );
};

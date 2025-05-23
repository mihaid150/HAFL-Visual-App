import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import React from "react";
import SimulationPage from "./pages/SimulationPage.tsx";
import {Layout} from "./pages/Layout.tsx";
import "./global.sass"

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: true,
        },
    },
});


const App: React.FC = () => {
    return (
        <div>
            <QueryClientProvider client={queryClient}>
                <Router>
                    <Layout>
                        <Routes>
                            <Route path="/" element={<SimulationPage/>}/>
                            <Route path="/simulation" element={<SimulationPage/>}/>
                        </Routes>
                    </Layout>
                </Router>
            </QueryClientProvider>
        </div>
    );
};

export default App;

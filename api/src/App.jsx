import { BrowserRouter, Routes, Route } from "react-router-dom";
import UsersPage from "./pages/UsersPage";
import UserDetailsPage from "./pages/UserDetailsPage";

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<UsersPage />} />
                <Route path="/user/:id" element={<UserDetailsPage />} />
            </Routes>
        </BrowserRouter>
    );
}

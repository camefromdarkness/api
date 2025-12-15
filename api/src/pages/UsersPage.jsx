import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useUsersStore } from "../stores/users";
import Spinner from "../components/Spinner";
import "./UsersPage.css";

const API = "https://jsonplaceholder.typicode.com";

export default function UsersPage() {
    const {
        users,
        usersLoading,
        viewMode,
        setUsers,
        setUsersLoading,
        setViewMode
    } = useUsersStore();

    useEffect(() => {
        if (users.length > 0) return;

        setUsersLoading(true);
        fetch(`${API}/users`)
            .then(res => res.json())
            .then(data => setUsers(data))
            .finally(() => setUsersLoading(false));
    }, [users, setUsers, setUsersLoading]);

    return (
        <div className="users-page">
            <h1>Users</h1>

            <div className="view-buttons">
                <button onClick={() => setViewMode("list")}>List</button>
                <button onClick={() => setViewMode("grid")}>Grid</button>
            </div>

            {usersLoading && <Spinner />}

            <div className={viewMode === "grid" ? "users-grid" : "users-list"}>
                {users.map(user => (
                    <Link key={user.id} to={`/user/${user.id}`} className="user-card">
                        <div className="user-name">{user.name}</div>
                        <div className="user-email">{user.email}</div>
                    </Link>
                ))}
            </div>
        </div>
    );
}

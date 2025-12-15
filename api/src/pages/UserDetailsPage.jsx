import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUsersStore } from "../stores/users";
import Spinner from "../components/Spinner";
import "./UserDetailsPage.css";

const API = "https://jsonplaceholder.typicode.com";

export default function UserDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const {
        users,
        posts,
        postsLoading,
        setPostsForUser,
        setPostLoadingForUser
    } = useUsersStore();

    const user = users.find(u => u.id === Number(id));
    const userPosts = posts[id];

    useEffect(() => {
        if (userPosts) return;

        setPostLoadingForUser(id, true);
        fetch(`${API}/users/${id}/posts`)
            .then(res => res.json())
            .then(data => setPostsForUser(id, data))
            .finally(() => setPostLoadingForUser(id, false));
    }, [id, userPosts, setPostsForUser, setPostLoadingForUser]);

    return (
        <div className="user-details-page">
            <button onClick={() => navigate(-1)}>Back</button>

            {user && (
                <div className="user-info">
                    <h2>{user.name}</h2>
                    <div>{user.email}</div>
                </div>
            )}

            <h3>Posts</h3>

            {postsLoading?.[id] && <Spinner />}

            {userPosts && userPosts.map(post => (
                <div key={post.id} className="post-card">
                    <strong>{post.title}</strong>
                    <p>{post.body}</p>
                </div>
            ))}
        </div>
    );
}
